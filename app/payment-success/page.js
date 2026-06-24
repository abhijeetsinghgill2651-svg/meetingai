"use client"
import { useEffect } from "react"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"
import { useSession } from "next-auth/react"

export default function PaymentSuccess() {
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.user?.email) {
      upgradePlan()
    }
  }, [session])

  const upgradePlan = async () => {
    await fetch("/api/upgrade-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: "growth" })
    })
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#F9FAFB",
      display: "flex", alignItems: "center",
      justifyContent: "center", fontFamily: "var(--font-sans)"
    }}>
      <div style={{
        background: "#fff", borderRadius: 16,
        padding: "48px 40px", textAlign: "center",
        border: "1px solid #E5E7EB", maxWidth: 460
      }}>
        <div style={{
          width: 64, height: 64, background: "#ECFDF5",
          borderRadius: "50%", display: "flex",
          alignItems: "center", justifyContent: "center",
          fontSize: 28, margin: "0 auto 20px"
        }}>✅</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: 8 }}>
          Payment successful!
        </h1>
        <p style={{ fontSize: 15, color: "#6B7280", marginBottom: 28 }}>
          Welcome to MeetingAI. Your account has been upgraded and is ready to use.
        </p>
        <Link href="/dashboard" style={{
          display: "block", background: "#4F46E5",
          color: "#fff", padding: "12px 24px",
          borderRadius: 8, textDecoration: "none",
          fontSize: 14, fontWeight: 500
        }}>
          Go to dashboard →
        </Link>
      </div>
    </div>
  )
}