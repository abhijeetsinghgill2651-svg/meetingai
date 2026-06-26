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
    return Response.json({ expired: true, reason: "not_logged_in" })
  }

  const { data: user } = await supabase
    .from("users")
    .select("plan, trial_ends_at")
    .eq("email", session.user.email)
    .single()

  if (!user) {
    return Response.json({ expired: false })
  }

  if (user.plan === "starter" || user.plan === "growth") {
    return Response.json({ expired: false, plan: user.plan })
  }

  if (user.trial_ends_at) {
    const trialEnd = new Date(user.trial_ends_at)
    const now = new Date()
    const daysLeft = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24))

    if (now > trialEnd) {
      return Response.json({ expired: true, reason: "trial_ended", daysLeft: 0 })
    }

    return Response.json({ expired: false, plan: "trial", daysLeft })
  }

  return Response.json({ expired: false, plan: "trial" })
}