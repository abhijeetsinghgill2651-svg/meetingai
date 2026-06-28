import Link from "next/link"

export default function NotFound() {
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
        textAlign: "center", border: "1px solid #E2E8F0"
      }}>
        <div style={{ fontSize: 52, marginBottom: 20 }}>🔍</div>
        <h1 style={{
          fontSize: 22, fontWeight: 700,
          color: "#0F172A", marginBottom: 10
        }}>
          Page not found
        </h1>
        <p style={{
          fontSize: 14, color: "#6B7280",
          marginBottom: 28, lineHeight: 1.6
        }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/" style={{
          padding: "12px 24px", borderRadius: 8,
          background: "#4F46E5", color: "#fff",
          fontSize: 14, fontWeight: 500,
          textDecoration: "none", display: "inline-block"
        }}>
          Go home
        </Link>
      </div>
    </div>
  )
}