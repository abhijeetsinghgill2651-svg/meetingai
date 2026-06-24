import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { createClient } from "@supabase/supabase-js"
import Groq from "groq-sdk"
import { google } from "googleapis"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return Response.json({ error: "Not logged in" }, { status: 401 })
  }

  try {
    // Get user from database
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", session.user.email)
      .single()

    if (userError || !user) {
      console.log("User not found:", session.user.email)
      return Response.json({ 
        error: "User not found. Please sign out and sign in again.",
        emails: []
      }, { status: 400 })
    }

    if (!user.google_access_token) {
      return Response.json({ 
        error: "No Gmail access. Please sign out and sign in again.",
        emails: []
      }, { status: 400 })
    }

    // Connect to Gmail
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    )
    oauth2Client.setCredentials({
      access_token: user.google_access_token,
      refresh_token: user.google_refresh_token
    })

    // Auto refresh token if expired
    oauth2Client.on("tokens", async (tokens) => {
      if (tokens.access_token) {
        await supabase
          .from("users")
          .update({ google_access_token: tokens.access_token })
          .eq("id", user.id)
      }
    })

    const gmail = google.gmail({ version: "v1", auth: oauth2Client })

    // Get last 10 emails
    const listResponse = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10,
      labelIds: ["INBOX"]
    })

    const messages = listResponse.data.messages || []

    if (messages.length === 0) {
      return Response.json({ emails: [] })
    }

    // Get already processed email IDs to avoid duplicates
    const { data: processedLogs } = await supabase
      .from("email_logs")
      .select("gmail_message_id")
      .eq("user_id", user.id)

    const processedIds = new Set(
      (processedLogs || []).map(l => l.gmail_message_id)
    )

    // Get already saved meeting thread IDs
    const { data: existingMeetings } = await supabase
      .from("meetings")
      .select("gmail_thread_id")
      .eq("user_id", user.id)

    const existingThreadIds = new Set(
      (existingMeetings || []).map(m => m.gmail_thread_id)
    )

    const results = []

    // Process each email
    for (const msg of messages) {
      try {
        const emailData = await gmail.users.messages.get({
          userId: "me",
          id: msg.id,
          format: "metadata",
          metadataHeaders: ["Subject", "From", "Date"]
        })

        const headers = emailData.data.payload?.headers || []
        const subject = headers.find(h => h.name === "Subject")?.value || "No subject"
        const from = headers.find(h => h.name === "From")?.value || "Unknown"
        const snippet = emailData.data.snippet || ""
        const threadId = emailData.data.threadId || msg.id

        // Skip if already a saved meeting
        if (existingThreadIds.has(threadId)) {
          results.push({
            subject,
            from,
            snippet,
            isMeetingRequest: true,
            aiSummary: "Already saved as a meeting",
            alreadySaved: true
          })
          continue
        }

        // Skip if already processed and not a meeting
        if (processedIds.has(msg.id)) {
          continue
        }

        // Ask AI if this is a meeting request
        const prompt = `Analyze this email and detect if it is a meeting request.

Subject: ${subject}
From: ${from}
Preview: ${snippet}
Today: ${new Date().toISOString().split("T")[0]}

Reply ONLY in this exact format:
IS_MEETING: yes or no
PERSON_NAME: first name of sender or "unknown"
PROPOSED_DATE: YYYY-MM-DD if mentioned or "not specified"
PROPOSED_TIME: HH:MM in 24hr format if mentioned or "not specified"
DURATION_MINUTES: number if mentioned or "30"
SUMMARY: one sentence about this email`

        let aiText = ""
        try {
          const aiResult = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.1-8b-instant",
            max_tokens: 120,
            temperature: 0.1
          })
          aiText = aiResult.choices[0].message.content
        } catch (aiError) {
          console.log("AI error for email:", subject, aiError.message)
          continue
        }

        const isMeetingRequest = aiText.toLowerCase().includes("is_meeting: yes")
        const summaryMatch = aiText.match(/SUMMARY:\s*(.+)/i)
        const aiSummary = summaryMatch ? summaryMatch[1].trim() : ""
        const nameMatch = aiText.match(/PERSON_NAME:\s*(.+)/i)
        const personName = nameMatch ? nameMatch[1].trim() : "unknown"
        const dateMatch = aiText.match(/PROPOSED_DATE:\s*(.+)/i)
        const proposedDate = dateMatch ? dateMatch[1].trim() : "not specified"
        const timeMatch = aiText.match(/PROPOSED_TIME:\s*(.+)/i)
        const proposedTime = timeMatch ? timeMatch[1].trim() : "not specified"
        const durationMatch = aiText.match(/DURATION_MINUTES:\s*(.+)/i)
        const durationMinutes = durationMatch
          ? parseInt(durationMatch[1].trim()) || 30
          : 30

        // Log this email as processed
        await supabase
          .from("email_logs")
          .upsert({
            user_id: user.id,
            gmail_message_id: msg.id,
            subject,
            sender_email: from,
            is_meeting_request: isMeetingRequest,
            ai_response: aiSummary,
            processed_at: new Date().toISOString()
          }, {
            onConflict: "gmail_message_id",
            ignoreDuplicates: true
          })

        // Save to meetings if it is a meeting request
        if (isMeetingRequest) {
          let scheduledAt = null

          if (
            proposedDate !== "not specified" &&
            proposedTime !== "not specified"
          ) {
            try {
              const userTz = user.timezone || "America/New_York"
              const dateTimeStr = `${proposedDate}T${proposedTime}:00`
              const tempDate = new Date(dateTimeStr)
              const utcDate = new Date(
                new Date(dateTimeStr).toLocaleString("en-US", {
                  timeZone: "UTC"
                })
              )
              const localDate = new Date(
                new Date(dateTimeStr).toLocaleString("en-US", {
                  timeZone: userTz
                })
              )
              const offsetMs = localDate.getTime() - utcDate.getTime()
              const correctedDate = new Date(tempDate.getTime() - offsetMs)
              if (!isNaN(correctedDate.getTime())) {
                scheduledAt = correctedDate.toISOString()
              }
            } catch (e) {
              console.log("Timezone error:", e.message)
            }
          }

          // Insert meeting — skip if duplicate thread
          const { error: insertError } = await supabase
            .from("meetings")
            .upsert({
              user_id: user.id,
              title: subject,
              attendee_name: personName,
              attendee_email: from,
              status: "pending_review",
              brief: aiSummary,
              gmail_thread_id: threadId,
              scheduled_at: scheduledAt,
              duration_minutes: durationMinutes
            }, {
              onConflict: "gmail_thread_id,user_id",
              ignoreDuplicates: true
            })

          if (insertError) {
            console.log("Insert error:", insertError.message)
          } else {
            existingThreadIds.add(threadId)
          }
        }

        results.push({
          subject,
          from,
          snippet,
          isMeetingRequest,
          aiSummary,
          personName,
          proposedDate,
          proposedTime
        })

      } catch (emailError) {
        console.error("Error processing email:", emailError.message)
        continue
      }
    }

    return Response.json({ emails: results })

  } catch (error) {
    console.error("Scan emails error:", error)
    return Response.json({
      error: error.message,
      emails: []
    }, { status: 500 })
  }
}