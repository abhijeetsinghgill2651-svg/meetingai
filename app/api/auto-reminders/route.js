import { createClient } from "@supabase/supabase-js"
import { sendEmail } from "../../lib/sendEmail"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET(request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const now = new Date()
    const in24hrs = new Date(now.getTime() + 24 * 60 * 60000)
    const in25hrs = new Date(now.getTime() + 25 * 60 * 60000)

    const { data: meetings } = await supabase
      .from("meetings")
      .select("*")
      .eq("status", "approved")
      .gte("scheduled_at", in24hrs.toISOString())
      .lte("scheduled_at", in25hrs.toISOString())

    if (!meetings || meetings.length === 0) {
      return Response.json({ message: "No reminders needed", sent: 0 })
    }

    let sent = 0

    for (const meeting of meetings) {
      const { data: user } = await supabase
        .from("users")
        .select("email, name, timezone")
        .eq("id", meeting.user_id)
        .single()

      if (!user) continue

      const tz = user.timezone || "America/New_York"
      const meetingTime = new Date(meeting.scheduled_at).toLocaleTimeString("en-US", {
        hour: "2-digit", minute: "2-digit", hour12: true, timeZone: tz
      })
      const meetingDate = new Date(meeting.scheduled_at).toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric", timeZone: tz
      })

      await sendEmail({
        to: meeting.attendee_email,
        subject: `Reminder: ${meeting.title} is tomorrow at ${meetingTime}`,
        body: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <h2 style="color:#4F46E5">Your meeting is tomorrow</h2>
            <p>Hi ${meeting.attendee_name},</p>
            <p>Just a reminder about your upcoming meeting:</p>
            <div style="background:#EEF2FF;padding:20px;border-radius:10px;margin:20px 0">
              <p style="margin:0 0 8px"><strong>${meeting.title}</strong></p>
              <p style="margin:0 0 8px;color:#6B7280">${meetingDate} at ${meetingTime}</p>
              <p style="margin:0;color:#6B7280">Duration: ${meeting.duration_minutes || 30} minutes</p>
            </div>
            <p>Looking forward to speaking with you!</p>
            <p style="color:#9CA3AF;font-size:12px">Sent by MeetingAI</p>
          </div>
        `
      })

      sent++
    }

    return Response.json({ success: true, remindersSent: sent })

  } catch (error) {
    console.error("Auto reminders error:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}