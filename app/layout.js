import { getServerSession } from "next-auth"
import { authOptions } from "./api/auth/[...nextauth]/route"
import SessionProvider from "./components/SessionProvider"
import "./globals.css"

export const metadata = {
  title: "MeetingAI — AI Meeting Management for Professionals",
  description: "MeetingAI automatically detects meeting requests in your Gmail, checks your calendar for conflicts, and books meetings with one click. Save 3+ hours every day.",
  keywords: "meeting management, AI assistant, Gmail integration, calendar automation, meeting scheduler",
  openGraph: {
    title: "MeetingAI — Never miss a meeting request again",
    description: "AI that reads your Gmail, detects meeting requests, and books them automatically",
    type: "website"
  }
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