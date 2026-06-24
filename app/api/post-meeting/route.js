import { createClient } from "@supabase/supabase-js"
import { sendEmail } from "../../lib/sendEmail"
import Groq from "groq-sdk"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function GET() {
  try {
    const now = new Date()
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60000)
    const ninetyMinutesAgo = new Date(now.getTime() - 90 * 60000)

    // Find meetings that ended 30-90 minutes ago
    const { data: completedMeetings } = await supabase
      .from("meetings")
      .select("*")
      .eq("status", "brief_sent")
      .gte("scheduled_at", ninetyMinutesAgo.toISOString())
      .lte("scheduled_at", thirtyMinutesAgo.toISOString())

    if (!completedMeetings || completedMeetings.length === 0) {
      return Response.json({ message: "No completed meetings to follow up" })
    }

    for (const meeting of completedMeetings) {
      // Generate AI meeting notes
      const notesResult = await groq.chat.completions.create({
        messages: [{
          role: "user",
          content: `You are a professional assistant generating meeting notes.

Meeting title: ${meeting.title}
Attendee: ${meeting.attendee_name}
Original context: ${meeting.brief}

Generate professional meeting notes in this format:

MEETING NOTES
=============
Date: [today's date]
Attendees: [owner name] and ${meeting.attendee_name}
Duration: 30 minutes

SUMMARY:
[2-3 sentences summarizing what this meeting was likely about]

KEY DISCUSSION POINTS:
- [point 1]
- [point 2]
- [point 3]

ACTION ITEMS:
- [action item 1 with owner]
- [action item 2 with timeline]

NEXT STEPS:
[What should happen next based on this meeting type]

Note: These are AI-generated template notes. 
Please edit them to reflect your actual discussion.`
        }],
        model: "llama-3.1-8b-instant"
      })

      const meetingNotes = notesResult.choices[0].message.content

      // Get owner details
      const { data: user } = await supabase
        .from("users")
        .select("email, name")
        .eq("id", meeting.user_id)
        .single()

      const meetingDate = new Date(meeting.scheduled_at).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      })

      // Send follow up email to the attendee
      await sendEmail({
        to: meeting.attendee_email,
        subject: `Follow up: ${meeting.title}`,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Thank You For Your Time!</h2>
            <p>Hi ${meeting.attendee_name},</p>
            <p>Thank you for taking the time to meet today. 
               It was great connecting with you.</p>
            <p>I'll follow up with any relevant details 
               we discussed shortly.</p>
            <p>Please don't hesitate to reach out if you 
               have any questions in the meantime.</p>
            <p>Looking forward to our next steps!</p>
            <p style="color: #6B7280; font-size: 12px; margin-top: 24px;">
              This follow-up was sent automatically by MeetingAI
            </p>
          </div>
        `
      })

      // Send meeting notes to owner
      await sendEmail({
        to: user.email,
        subject: `Meeting Notes: ${meeting.title} — ${meetingDate}`,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Your Meeting Notes Are Ready</h2>
            <p style="color: #6B7280;">
              Meeting with ${meeting.attendee_name} on ${meetingDate}
            </p>
            <div style="background: #F9FAFB; border: 1px solid #E5E7EB; 
                        border-radius: 8px; padding: 20px; margin: 16px 0;">
              <pre style="white-space: pre-wrap; font-family: Arial, 
                          sans-serif; line-height: 1.6; color: #374151; 
                          margin: 0;">
${meetingNotes}
              </pre>
            </div>
            <p style="color: #EF4444; font-size: 13px;">
              ⚠️ These are AI-generated template notes based on the 
              meeting context. Please edit them to reflect your 
              actual conversation.
            </p>
            <p style="color: #6B7280; font-size: 12px;">
              Generated automatically by MeetingAI
            </p>
          </div>
        `
      })

      // Save notes and update status
      await supabase
        .from("meetings")
        .update({ 
          status: "completed",
          brief: meeting.brief + "\n\nMEETING NOTES:\n" + meetingNotes
        })
        .eq("id", meeting.id)
    }

    return Response.json({ 
      success: true, 
      processed: completedMeetings.length 
    })

  } catch (error) {
    console.error("Post meeting error:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}