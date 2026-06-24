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

  const { data: user } = await supabase
    .from("users")
    .select("working_hours_start, working_hours_end, timezone")
    .eq("email", session.user.email)
    .single()

  return Response.json({ preferences: user })
}