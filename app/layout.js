import { getServerSession } from "next-auth"
import { authOptions } from "./api/auth/[...nextauth]/route"
import SessionProvider from "./components/SessionProvider"
import "./globals.css"

export const metadata = {
  title: "MeetingAI — AI Meeting Management",
  description: "AI powered meeting management for small businesses"
}

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}