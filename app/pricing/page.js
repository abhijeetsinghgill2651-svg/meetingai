"use client"
import{useState} from "react"
import Link from "next/link"
import Nav from "../components/Nav"

export default function Pricing() {
  return (
    <div style={{ fontFamily: "var(--font-sans)", background: "#fff", color: "#111827" }}>
      <Nav />

      <div style={{ padding: "80px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h1 style={{ fontSize: 46, fontWeight: 700, color: "#111827", marginBottom: 16 }}>
            Simple, honest pricing
          </h1>
          <p style={{ fontSize: 18, color: "#6B7280" }}>
            Start free for 14 days. No credit card required. Cancel anytime.
          </p>
        </div>
      </div>

      <div style={{ padding: "0 24px 80px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* Starter */}
          <div style={{
            border: "1px solid #E5E7EB", borderRadius: 18,
            padding: 36, background: "#fff"
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#6B7280", marginBottom: 12 }}>
              STARTER
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
              <span style={{ fontSize: 48, fontWeight: 700, color: "#111827" }}>$1</span>
              <span style={{ fontSize: 16, color: "#9CA3AF" }}>/month</span>
            </div>
            <p style={{ fontSize: 14, color: "#9CA3AF", marginBottom: 28 }}>
              For solo professionals and freelancers
            </p>
            <button
  onClick={async () => {
    const res = await fetch("/api/create-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: "starter" })
    })
    const data = await res.json()
    if (data.approvalUrl) {
      window.location.href = data.approvalUrl
    }
  }}
  style={{
    display: "block", width: "100%",
    border: "1.5px solid #4F46E5", color: "#4F46E5",
    padding: "12px 20px", borderRadius: 10,
    fontSize: 14, fontWeight: 500, cursor: "pointer",
    background: "#fff", marginBottom: 28
  }}
>
  Subscribe — $1/month
</button>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "Gmail integration",
                "AI meeting detection",
                "Google Calendar sync",
                "Conflict detection",
                "Confirmation emails",
                "Pre-meeting briefs",
                "Up to 50 scans/month"
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#374151" }}>
                  <span style={{ color: "#10B981", fontSize: 16 }}>✓</span> {f}
                </div>
              ))}
              {[
                "Meeting notes generation",
                "Outlook integration"
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#D1D5DB" }}>
                  <span style={{ fontSize: 16 }}>—</span> {f}
                </div>
              ))}
            </div>
          </div>

          {/* Growth */}
          <div style={{
            border: "2px solid #4F46E5", borderRadius: 18,
            padding: 36, background: "#fff", position: "relative"
          }}>
            <div style={{
              position: "absolute", top: -14, left: "50%",
              transform: "translateX(-50%)",
              background: "#4F46E5", color: "#fff",
              fontSize: 11, fontWeight: 600, padding: "4px 16px",
              borderRadius: 100, letterSpacing: 1
            }}>
              MOST POPULAR
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#4F46E5", marginBottom: 12 }}>
              GROWTH
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
              <span style={{ fontSize: 48, fontWeight: 700, color: "#111827" }}>$5</span>
              <span style={{ fontSize: 16, color: "#9CA3AF" }}>/month</span>
            </div>
            <p style={{ fontSize: 14, color: "#9CA3AF", marginBottom: 28 }}>
              For busy professionals and small businesses
            </p>
           <button
  onClick={async () => {
    const res = await fetch("/api/create-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: "growth" })
    })
    const data = await res.json()
    if (data.approvalUrl) {
      window.location.href = data.approvalUrl
    }
  }}
  style={{
    display: "block", width: "100%",
    background: "#4F46E5", color: "#fff",
    padding: "12px 20px", borderRadius: 10,
    fontSize: 14, fontWeight: 500, cursor: "pointer",
    border: "none", marginBottom: 28
  }}
>
  Subscribe — $5/month
</button>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "Everything in Starter",
                "Unlimited scans",
                "AI meeting notes generation",
                "Post-meeting follow ups",
                "Outlook integration",
                "Multiple calendars",
                "Priority support"
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#374151" }}>
                  <span style={{ color: "#4F46E5", fontSize: 16 }}>✓</span> {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginTop: 80 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: "#111827", textAlign: "center", marginBottom: 48 }}>
            Frequently asked questions
          </h2>
          <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { q: "Do I need a credit card to start?", a: "No. Your 14 day free trial starts immediately with just your Google account. No payment information needed until you decide to subscribe." },
              { q: "How is this different from Calendly?", a: "Calendly requires you to share a booking link and clients must fill a form. MeetingAI automatically reads your emails, detects meeting requests, and handles booking — no link or form needed." },
              { q: "Is my email data safe?", a: "Absolutely. We read emails only to detect meeting requests and never store email content permanently. Your emails are processed and immediately discarded." },
              { q: "Can I cancel anytime?", a: "Yes. Cancel anytime from your account settings. You keep access until the end of your billing period with no questions asked." },
              { q: "What email providers do you support?", a: "Currently Gmail on all plans. Outlook support is available on the Growth plan." }
            ].map((item, i) => (
              <div key={i} style={{
                borderBottom: "1px solid #F3F4F6",
                padding: "20px 0"
              }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#111827", marginBottom: 8 }}>
                  {item.q}
                </div>
                <div style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.7 }}>
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer style={{
        background: "#F9FAFB", borderTop: "1px solid #E5E7EB",
        padding: "32px 24px", textAlign: "center"
      }}>
        <p style={{ fontSize: 13, color: "#9CA3AF" }}>
          © 2026 MeetingAI · <Link href="/" style={{ color: "#9CA3AF" }}>Home</Link> · <Link href="/login" style={{ color: "#9CA3AF" }}>Sign in</Link>
        </p>
      </footer>
    </div>
  )
}