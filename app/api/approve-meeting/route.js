import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { createClient } from "@supabase/supabase-js"
import { google } from "googleapis"
import { sendEmail } from "../../lib/sendEmail"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return Response.json({ error: "Not logged in" }, { status: 401 })
  }

  const { meetingId } = await request.json()

  try {
    const { data: meeting } = await supabase
      .from("meetings")
      .select("*")
      .eq("id", meetingId)
      .single()

    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("email", session.user.email)
      .single()

    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({
      access_token: user.google_access_token,
      refresh_token: user.google_refresh_token
    })
    const calendar = google.calendar({ version: "v3", auth: oauth2Client })

    if (!meeting.scheduled_at) {
      await supabase
        .from("meetings")
        .update({ status: "approved" })
        .eq("id", meetingId)

      return Response.json({
        success: true,
        calendarCreated: false,
        message: "Approved but no specific time was found to add to calendar"
      })
    }

    const startTime = new Date(meeting.scheduled_at)
    const duration = meeting.duration_minutes || 30
    const endTime = new Date(startTime.getTime() + duration * 60000)

    const existingEvents = await calendar.events.list({
      calendarId: "primary",
      timeMin: startTime.toISOString(),
      timeMax: endTime.toISOString(),
      singleEvents: true
    })

    const hasConflict = existingEvents.data.items &&
      existingEvents.data.items.length > 0

    if (hasConflict) {
      await supabase
        .from("meetings")
        .update({ status: "conflict" })
        .eq("id", meetingId)

      return Response.json({
        success: true,
        calendarCreated: false,
        conflict: true,
        message: "Conflict found! You already have something at this time."
      })
    }

   const event = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: 1,
      requestBody: {
        summary: meeting.title,
        description: meeting.brief,
        start: { dateTime: startTime.toISOString() },
        end: { dateTime: endTime.toISOString() },
        attendees: [{ email: meeting.attendee_email }],
        conferenceData: {
          createRequest: {
            requestId: meetingId,
            conferenceSolutionKey: { type: "hangoutsMeet" }
          }
        }
      }
    })

    const meetLink = event.data.conferenceData?.entryPoints?.[0]?.uri || null
    console.log("Meet link:",meetLink)

    await supabase
      .from("meetings")
      .update({
        status: "approved",
        meeting_link: event.data.htmlLink,
        brief:meeting.brief+(meetLink ? `\n\nGoogle Meet: ${meetLink}` : "")
      })
      .eq("id", meetingId)

    const userTimezone = user.timezone || "Asia/Kolkata"

    const meetingDate = startTime.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: userTimezone
    })

    const meetingTime = startTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: userTimezone
    })

    await sendEmail({
      to: meeting.attendee_email,
      subject: `Meeting Confirmed: ${meeting.title}`,
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Meeting Confirmed!</h2>
          <p>Hi ${meeting.attendee_name},</p>
          <p>Your meeting has been confirmed. Here are the details:</p>
          <div style="background: #F3F4F6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Subject:</strong> ${meeting.title}</p>
            <p><strong>Date:</strong> ${meetingDate}</p>
            <p><strong>Time:</strong> ${meetingTime}</p>
            <p><strong>Duration:</strong> ${duration} minutes</p>
${meetLink ? `<p><strong>Google Meet:</strong> <a href="${meetLink}" style="color:#4F46E5">${meetLink}</a></p>` : ""}

          </div>
          <p>A calendar invite has been sent to your email.</p>
          <p>Looking forward to speaking with you!</p>
          <p style="color: #6B7280; font-size: 12px;">
            This email was sent automatically by MeetingAI
          </p>
        </div>
      `
    })

    return Response.json({
      success: true,
      calendarCreated: true,
      eventLink: event.data.htmlLink
    })

  } catch (error) {
    console.error("Approve meeting error:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}