import { createClient } from "@supabase/supabase-js"
import { google } from "googleapis"
import Groq from "groq-sdk"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function GET(request) {
  // Security check — only Vercel cron can call this
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get all active users
    const { data: users } = await supabase
      .from("users")
      .select("*")
      .not("google_access_token", "is", null)

    if (!users || users.length === 0) {
      return Response.json({ message: "No users to scan" })
    }

    let totalScanned = 0
    let totalMeetings = 0

    for (const user of users) {
      try {
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET
        )
        oauth2Client.setCredentials({
          access_token: user.google_access_token,
          refresh_token: user.google_refresh_token
        })

        oauth2Client.on("tokens", async (tokens) => {
          if (tokens.access_token) {
            await supabase
              .from("users")
              .update({ google_access_token: tokens.access_token })
              .eq("id", user.id)
          }
        })

        const gmail = google.gmail({ version: "v1", auth: oauth2Client })

        const listResponse = await gmail.users.messages.list({
          userId: "me",
          maxResults: 5,
          labelIds: ["INBOX"],
          q: "is:unread newer_than:1h"
        })

        const messages = listResponse.data.messages || []

        const { data: processedLogs } = await supabase
          .from("email_logs")
          .select("gmail_message_id")
          .eq("user_id", user.id)

        const processedIds = new Set(
          (processedLogs || []).map(l => l.gmail_message_id)
        )

        const { data: existingMeetings } = await supabase
          .from("meetings")
          .select("gmail_thread_id")
          .eq("user_id", user.id)

        const existingThreadIds = new Set(
          (existingMeetings || []).map(m => m.gmail_thread_id)
        )

        for (const msg of messages) {
          if (processedIds.has(msg.id)) continue

          const emailData = await gmail.users.messages.get({
            userId: "me",
            id: msg.id,
            format: "metadata",
            metadataHeaders: ["Subject", "From"]
          })

          const headers = emailData.data.payload?.headers || []
          const subject = headers.find(h => h.name === "Subject")?.value || "No subject"
          const from = headers.find(h => h.name === "From")?.value || "Unknown"
          const snippet = emailData.data.snippet || ""
          const threadId = emailData.data.threadId || msg.id

          if (existingThreadIds.has(threadId)) continue

          const prompt = `Analyze this email. Is it a meeting request?
Subject: ${subject}
From: ${from}
Preview: ${snippet}
Today: ${new Date().toISOString().split("T")[0]}

Reply ONLY in this format:
IS_MEETING: yes or no
PERSON_NAME: sender first name or "unknown"
PROPOSED_DATE: YYYY-MM-DD or "not specified"
PROPOSED_TIME: HH:MM 24hr or "not specified"
DURATION_MINUTES: number or "30"
SUMMARY: one sentence`

          let aiText = ""
          try {
            const aiResult = await groq.chat.completions.create({
              messages: [{ role: "user", content: prompt }],
              model: "llama-3.1-8b-instant",
              max_tokens: 120,
              temperature: 0.1
            })
            aiText = aiResult.choices[0].message.content
          } catch (e) {
            continue
          }

          const isMeetingRequest = aiText.toLowerCase().includes("is_meeting: yes")

          await supabase.from("email_logs").upsert({
            user_id: user.id,
            gmail_message_id: msg.id,
            subject,
            sender_email: from,
            is_meeting_request: isMeetingRequest,
            ai_response: aiText,
            processed_at: new Date().toISOString()
          }, { onConflict: "gmail_message_id", ignoreDuplicates: true })

          if (isMeetingRequest) {
            const nameMatch = aiText.match(/PERSON_NAME:\s*(.+)/i)
            const personName = nameMatch ? nameMatch[1].trim() : "unknown"
            const dateMatch = aiText.match(/PROPOSED_DATE:\s*(.+)/i)
            const proposedDate = dateMatch ? dateMatch[1].trim() : "not specified"
            const timeMatch = aiText.match(/PROPOSED_TIME:\s*(.+)/i)
            const proposedTime = timeMatch ? timeMatch[1].trim() : "not specified"
            const durationMatch = aiText.match(/DURATION_MINUTES:\s*(.+)/i)
            const durationMinutes = durationMatch ? parseInt(durationMatch[1].trim()) || 30 : 30
            const summaryMatch = aiText.match(/SUMMARY:\s*(.+)/i)
            const aiSummary = summaryMatch ? summaryMatch[1].trim() : ""

            let scheduledAt = null
            if (proposedDate !== "not specified" && proposedTime !== "not specified") {
              try {
                const userTz = user.timezone || "America/New_York"
                const dateTimeStr = `${proposedDate}T${proposedTime}:00`
                const tempDate = new Date(dateTimeStr)
                const utcDate = new Date(new Date(dateTimeStr).toLocaleString("en-US", { timeZone: "UTC" }))
                const localDate = new Date(new Date(dateTimeStr).toLocaleString("en-US", { timeZone: userTz }))
                const offsetMs = localDate.getTime() - utcDate.getTime()
                const correctedDate = new Date(tempDate.getTime() - offsetMs)
                if (!isNaN(correctedDate.getTime())) {
                  scheduledAt = correctedDate.toISOString()
                }
              } catch (e) {}
            }

            await supabase.from("meetings").upsert({
              user_id: user.id,
              title: subject,
              attendee_name: personName,
              attendee_email: from,
              status: "pending_review",
              brief: aiSummary,
              gmail_thread_id: threadId,
              scheduled_at: scheduledAt,
              duration_minutes: durationMinutes
            }, { onConflict: "gmail_thread_id,user_id", ignoreDuplicates: true })

            existingThreadIds.add(threadId)
            totalMeetings++
          }

          totalScanned++
        }
      } catch (userError) {
        console.error(`Error scanning for user ${user.email}:`, userError.message)
        continue
      }
    }

    return Response.json({
      success: true,
      usersScanned: users.length,
      emailsScanned: totalScanned,
      meetingsFound: totalMeetings
    })

  } catch (error) {
    console.error("Auto scan error:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}