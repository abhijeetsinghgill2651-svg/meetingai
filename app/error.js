"use client"
import { useEffect } from "react"
import Link from "next/link"

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "#F8FAFC",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      <div style={{
        background: "#fff", borderRadius: 20,
        padding: "48px 40px", maxWidth: 440,
        textAlign: "center", border: "1px solid #E2E8F0",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)"
      }}>
        <div style={{ fontSize: 52, marginBottom: 20 }}>😕</div>
        <h1 style={{
          fontSize: 22, fontWeight: 700,
          color: "#0F172A", marginBottom: 10
        }}>
          Something went wrong
        </h1>
        <p style={{
          fontSize: 14, color: "#6B7280",
          marginBottom: 28, lineHeight: 1.6
        }}>
          We encountered an unexpected error. This has been logged and we will fix it soon.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button
            onClick={reset}
            style={{
              padding: "10px 20px", borderRadius: 8,
              border: "1px solid #E2E8F0", background: "#fff",
              color: "#374151", fontSize: 14,
              cursor: "pointer", fontFamily: "inherit"
            }}
          >
            Try again
          </button>
          <Link href="/dashboard" style={{
            padding: "10px 20px", borderRadius: 8,
            background: "#4F46E5", color: "#fff",
            fontSize: 14, fontWeight: 500,
            textDecoration: "none"
          }}>
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}