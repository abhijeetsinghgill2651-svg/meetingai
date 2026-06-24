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
    return Response.json({ meetings: [] })
  }

  try {
    const { data: user } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", session.user.email)
      .single()

    if (!user) {
      return Response.json({ meetings: [] })
    }

    const { data: meetings } = await supabase
      .from("meetings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)

    return Response.json({ meetings: meetings || [] })

  } catch (error) {
    console.error("Get meetings error:", error)
    return Response.json({ meetings: [] })
  }
}