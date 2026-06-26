"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

export default function PaymentSuccess() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const plan = searchParams.get("plan") || "starter"
  const [upgrading, setUpgrading] = useState(true)

  useEffect(() => {
    if (session?.user?.email) {
      upgradePlan()
    }
  }, [session])

  const upgradePlan = async () => {
    try {
      await fetch("/api/upgrade-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan })
      })
    } catch (error) {
      console.error("Upgrade error:", error)
    } finally {
      setUpgrading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F9FAFB",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-sans)"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 20,
        padding: "56px 48px",
        textAlign: "center",
        border: "1px solid #E5E7EB",
        maxWidth: 480,
        width: "100%"
      }}>
        <div style={{
          width: 72, height: 72,
          background: "#ECFDF5",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 32,
          margin: "0 auto 24px"
        }}>
          🎉
        </div>

        <h1 style={{
          fontSize: 28, fontWeight: 700,
          color: "#111827", marginBottom: 12
        }}>
          Payment successful!
        </h1>

        <p style={{
          fontSize: 16, color: "#6B7280",
          marginBottom: 8, lineHeight: 1.6
        }}>
          Welcome to MeetingAI{" "}
          {plan === "starter" ? "Starter" : "Growth"} plan.
        </p>

        <p style={{
          fontSize: 14, color: "#9CA3AF",
          marginBottom: 32
        }}>
          Your account has been upgraded and is ready to use.
        </p>

        <div style={{
          background: "#F5F3FF",
          borderRadius: 12,
          padding: "16px 20px",
          marginBottom: 28,
          textAlign: "left"
        }}>
          <div style={{
            fontSize: 13, fontWeight: 600,
            color: "#4338CA", marginBottom: 8
          }}>
            What happens next:
          </div>
          {[
            "Your Gmail is connected and ready",
            "AI will detect meeting requests automatically",
            "You will receive pre-meeting briefs",
            "Meeting notes generated after every call"
          ].map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center",
              gap: 8, fontSize: 13,
              color: "#4338CA", marginBottom: 6
            }}>
              <span>✓</span> {item}
            </div>
          ))}
        </div>

        <Link href="/dashboard" style={{
          display: "block",
          background: "#4F46E5",
          color: "#fff",
          padding: "14px 24px",
          borderRadius: 10,
          textDecoration: "none",
          fontSize: 15,
          fontWeight: 500
        }}>
          Go to dashboard →
        </Link>
      </div>
    </div>
  )
}