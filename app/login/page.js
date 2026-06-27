"use client"
import { signIn, useSession } from "next-auth/react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div style={{
        minHeight: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center",
        background: "#F9FAFB", fontFamily: "var(--font-sans)"
      }}>
        <div style={{ fontSize: 14, color: "#6B7280" }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #F5F3FF 0%, #EFF6FF 100%)",
      display: "flex", alignItems: "center",
      justifyContent: "center", fontFamily: "var(--font-sans)",
      padding: "24px"
    }}>
      <div style={{
        background: "#fff", borderRadius: 20,
        padding: "48px 40px", width: "100%",
        maxWidth: 420, textAlign: "center",
        boxShadow: "0 4px 40px rgba(0,0,0,0.08)"
      }}>

        <div style={{
          width: 52, height: 52,
          background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
          borderRadius: 14, display: "flex",
          alignItems: "center", justifyContent: "center",
          fontSize: 24, margin: "0 auto 20px"
        }}>
          🤖
        </div>

        <h1 style={{
          fontSize: 26, fontWeight: 700,
          color: "#111827", marginBottom: 8
        }}>
          Welcome to MeetingAI
        </h1>

        <p style={{
          fontSize: 15, color: "#6B7280",
          marginBottom: 32, lineHeight: 1.6
        }}>
          Your AI assistant that automatically manages meeting requests from your Gmail
        </p>

        <div style={{
          background: "#F9FAFB", borderRadius: 12,
          padding: "16px", marginBottom: 28, textAlign: "left"
        }}>
          {[
            "Detects meeting requests automatically",
            "Checks calendar for conflicts",
            "Sends confirmation emails",
            "Generates meeting notes"
          ].map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center",
              gap: 8, fontSize: 13, color: "#374151",
              marginBottom: i < 3 ? 8 : 0
            }}>
              <span style={{ color: "#4F46E5", fontSize: 16 }}>✓</span>
              {item}
            </div>
          ))}
        </div>

        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          style={{
            width: "100%", display: "flex",
            alignItems: "center", justifyContent: "center",
            gap: 12, background: "#fff",
            border: "1.5px solid #E5E7EB",
            borderRadius: 10, padding: "13px 20px",
            fontSize: 15, fontWeight: 500,
            color: "#374151", cursor: "pointer",
            marginBottom: 16
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <p style={{ fontSize: 12, color: "#9CA3AF" }}>
          14 days free · No credit card required · Cancel anytime
        </p>

        <p style={{ fontSize: 11, color: "#D1D5DB", marginTop: 16 }}>
          By continuing you agree to our{" "}
          <a href="/terms" style={{ color: "#9CA3AF" }}>Terms</a>
          {" "}and{" "}
          <a href="/privacy" style={{ color: "#9CA3AF" }}>Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}