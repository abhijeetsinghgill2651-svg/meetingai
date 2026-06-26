import Link from "next/link"

export default function Terms() {
  return (
    <div style={{ fontFamily: "var(--font-sans)", maxWidth: 720, margin: "0 auto", padding: "60px 24px" }}>
      <Link href="/" style={{ color: "#4F46E5", textDecoration: "none", fontSize: 14 }}>
        ← Back to home
      </Link>

      <h1 style={{ fontSize: 36, fontWeight: 700, color: "#111827", margin: "24px 0 8px" }}>
        Terms of Service
      </h1>
      <p style={{ fontSize: 14, color: "#9CA3AF", marginBottom: 40 }}>
        Last updated: June 2026
      </p>

      {[
        {
          title: "Acceptance of terms",
          content: "By using MeetingAI, you agree to these terms. If you do not agree, please do not use our service."
        },
        {
          title: "Service description",
          content: "MeetingAI is an AI-powered meeting management tool that reads your Gmail to detect meeting requests and helps manage your calendar. We are not a law firm and do not provide legal advice."
        },
        {
          title: "User responsibilities",
          content: "You are responsible for maintaining the security of your account. You must not use MeetingAI for any unlawful purpose. You must not attempt to gain unauthorized access to our systems."
        },
        {
          title: "Subscription and payment",
          content: "Subscriptions are billed monthly. You can cancel at any time. No refunds are provided for partial months. We reserve the right to change pricing with 30 days notice."
        },
        {
          title: "Limitation of liability",
          content: "MeetingAI is provided as is. We are not liable for any missed meetings, scheduling errors, or data loss. Our maximum liability is limited to the amount you paid in the last 30 days."
        },
        {
          title: "Contact",
          content: "For any questions about these terms, contact us at legal@meetingai.app"
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