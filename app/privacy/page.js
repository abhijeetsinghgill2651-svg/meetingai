import Link from "next/link"

export default function Privacy() {
  return (
    <div style={{ fontFamily: "var(--font-sans)", maxWidth: 720, margin: "0 auto", padding: "60px 24px" }}>
      <Link href="/" style={{ color: "#4F46E5", textDecoration: "none", fontSize: 14 }}>
        ← Back to home
      </Link>

      <h1 style={{ fontSize: 36, fontWeight: 700, color: "#111827", margin: "24px 0 8px" }}>
        Privacy Policy
      </h1>
      <p style={{ fontSize: 14, color: "#9CA3AF", marginBottom: 40 }}>
        Last updated: June 2026
      </p>

      {[
        {
          title: "What data we access",
          content: "MeetingAI requests read access to your Gmail inbox and Google Calendar. We use this access only to detect meeting requests in your emails and check for scheduling conflicts. We do not read, store, or share any other email content."
        },
        {
          title: "How we use your data",
          content: "Your email content is processed in real time to detect meeting requests using AI. Email content is never stored permanently on our servers. Only meeting metadata (subject, sender name, proposed time) is saved when a meeting is detected and you choose to save it."
        },
        {
          title: "Data storage",
          content: "We store your name, email address, Google access tokens (encrypted), and meeting records you approve. All data is stored securely on Supabase servers. We never sell your data to third parties."
        },
        {
          title: "Google API usage",
          content: "Our use of Google APIs complies with the Google API Services User Data Policy. We only request the minimum permissions necessary to provide our service. You can revoke access at any time from your Google account settings."
        },
        {
          title: "Your rights",
          content: "You can delete your account and all associated data at any time by contacting us. You can revoke Gmail and Calendar access from your Google account. You can cancel your subscription at any time."
        },
        {
          title: "Contact",
          content: "For any privacy questions or data deletion requests, contact us at privacy@meetingai.app"
        }
      ].map((section, i) => (
        <div key={i} style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "#111827", marginBottom: 8 }}>
            {section.title}
          </h2>
          <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.8 }}>
            {section.content}
          </p>
        </div>
      ))}
    </div>
  )
}