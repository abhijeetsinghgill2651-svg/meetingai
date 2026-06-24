import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return Response.json({ error: "Not logged in" }, { status: 401 })
  }

  const { plan } = await request.json()

  await supabase
    .from("users")
    .update({ plan })
    .eq("email", session.user.email)

  return Response.json({ success: true })
}