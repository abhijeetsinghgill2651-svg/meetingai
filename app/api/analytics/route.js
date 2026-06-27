import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return Response.json({ error: "Not logged in" }, { status: 401 })
  }

  try {
    const { data: user } = await supabase
      .from("users")
      .select("id, plan, trial_ends_at, created_at")
      .eq("email", session.user.email)
      .single()

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 })
    }

    const { data: meetings } = await supabase
      .from("meetings")
      .select("*")
      .eq("user_id", user.id)

    const { data: emailLogs } = await supabase
      .from("email_logs")
      .select("*")
      .eq("user_id", user.id)

    const total = meetings?.length || 0
    const pending = meetings?.filter(m => m.status === "pending_review").length || 0
    const approved = meetings?.filter(m => m.status === "approved" || m.status === "brief_sent").length || 0
    const completed = meetings?.filter(m => m.status === "completed").length || 0
    const conflicts = meetings?.filter(m => m.status === "conflict").length || 0
    const totalEmails = emailLogs?.length || 0
    const meetingEmails = emailLogs?.filter(e => e.is_meeting_request).length || 0

    const hoursSaved = total * 0.5

    const trialDaysLeft = user.trial_ends_at
      ? Math.max(0, Math.ceil(
          (new Date(user.trial_ends_at) - new Date()) / (1000 * 60 * 60 * 24)
        ))
      : 0

    return Response.json({
      total,
      pending,
      approved,
      completed,
      conflicts,
      totalEmails,
      meetingEmails,
      hoursSaved,
      plan: user.plan,
      trialDaysLeft,
      memberSince: user.created_at
    })

  } catch (error) {
    console.error("Analytics error:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}