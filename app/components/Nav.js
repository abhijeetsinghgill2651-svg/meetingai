"use client"
import Link from "next/link"

import { useState } from "react"

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav style={{
      position: "sticky",
      top: 0,
      zIndex: 50,
      background: "rgba(255,255,255,0.95)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid #F1F0EB",
      padding: "0 24px"
    }}>
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: 64
      }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 32, height: 32,
              background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
              borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <span style={{ color: "#fff", fontSize: 16 }}>M</span>
            </div>
            <span style={{ fontSize: 18, fontWeight: 600, color: "#111827" }}>
              MeetingAI
            </span>
          </div>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/pricing" style={{
            padding: "8px 16px",
            fontSize: 14,
            color: "#6B7280",
            textDecoration: "none",
            borderRadius: 8
          }}>
            Pricing
          </Link>
          <Link href="/login" style={{
            padding: "8px 16px",
            fontSize: 14,
            color: "#6B7280",
            textDecoration: "none",
            borderRadius: 8
          }}>
            Sign in
          </Link>
          <Link href="/login" style={{
            padding: "8px 20px",
            fontSize: 14,
            fontWeight: 500,
            color: "#fff",
            background: "#4F46E5",
            textDecoration: "none",
            borderRadius: 8,
            display: "inline-block"
          }}>
            Get started free
          </Link>
        </div>
      </div>
    </nav>
  )
}