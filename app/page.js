import Link from "next/link"
import Nav from "./components/Nav"

export default function Home() {
  return (
    <div style={{ fontFamily: "var(--font-sans)", background: "#fff", color: "#111827" }}>
      <Nav />

      {/* Hero */}
      <div style={{ background: "linear-gradient(180deg, #F5F3FF 0%, #fff 100%)", padding: "80px 24px 100px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#EEF2FF", border: "1px solid #C7D2FE",
            borderRadius: 100, padding: "6px 16px",
            fontSize: 13, color: "#4338CA", marginBottom: 28
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4F46E5", display: "inline-block" }}></span>
            AI powered · works automatically from your Gmail
          </div>

          <h1 style={{
            fontSize: 58, fontWeight: 700, lineHeight: 1.1,
            color: "#111827", marginBottom: 24, letterSpacing: -1.5
          }}>
            Your AI meeting manager
            <br />
            <span style={{ color: "#4F46E5" }}>that never sleeps</span>
          </h1>

          <p style={{
            fontSize: 20, color: "#6B7280", lineHeight: 1.7,
            maxWidth: 600, margin: "0 auto 40px"
          }}>
            MeetingAI reads your Gmail, detects meeting requests, checks your
            calendar for conflicts, and books meetings automatically —
            saving you 3+ hours every day.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/login" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#4F46E5", color: "#fff",
              padding: "14px 28px", borderRadius: 10,
              fontSize: 16, fontWeight: 500, textDecoration: "none"
            }}>
              Start free — no card needed
              <span style={{ fontSize: 18 }}>→</span>
            </Link>
            <Link href="/pricing" style={{
              display: "inline-flex", alignItems: "center",
              border: "1px solid #E5E7EB", color: "#374151",
              padding: "14px 28px", borderRadius: 10,
              fontSize: 16, fontWeight: 500, textDecoration: "none",
              background: "#fff"
            }}>
              See pricing
            </Link>
          </div>

          <p style={{ fontSize: 13, color: "#9CA3AF", marginTop: 16 }}>
            14 days free · No credit card · Cancel anytime
          </p>
        </div>
      </div>

      {/* VS Calendly banner */}
      <div style={{ background: "#111827", padding: "20px 24px" }}>
        <div style={{
          maxWidth: 900, margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 40, flexWrap: "wrap"
        }}>
          {[
            { icon: "❌", text: "No booking links to share" },
            { icon: "❌", text: "No forms to fill" },
            { icon: "✅", text: "Works from any email automatically" },
            { icon: "✅", text: "AI reads intent, not just clicks" }
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#D1D5DB" }}>
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ padding: "100px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <h2 style={{ fontSize: 40, fontWeight: 700, color: "#111827", marginBottom: 12 }}>
              How MeetingAI works
            </h2>
            <p style={{ fontSize: 18, color: "#6B7280" }}>
              Set up in 3 minutes. Works silently in the background forever.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32 }}>
            {[
              {
                step: "01",
                icon: "📧",
                title: "Connect your Gmail",
                desc: "Sign in with Google. MeetingAI gets read access to your inbox and calendar. Takes 60 seconds.",
                color: "#EEF2FF",
                textColor: "#4338CA"
              },
              {
                step: "02",
                icon: "🤖",
                title: "AI reads every email",
                desc: "Our AI scans incoming emails and identifies meeting requests — even casual ones like 'can we hop on a call?'",
                color: "#F0FDF4",
                textColor: "#166534"
              },
              {
                step: "03",
                icon: "✅",
                title: "Approve with one click",
                desc: "Review detected meetings on your dashboard. Click Approve — calendar event created, confirmation email sent.",
                color: "#FFF7ED",
                textColor: "#9A3412"
              }
            ].map((item, i) => (
              <div key={i} style={{
                background: "#FAFAFA",
                border: "1px solid #F3F4F6",
                borderRadius: 16, padding: 32
              }}>
                <div style={{
                  fontSize: 11, fontWeight: 600, color: "#9CA3AF",
                  letterSpacing: 2, marginBottom: 16
                }}>STEP {item.step}</div>
                <div style={{
                  width: 52, height: 52,
                  background: item.color,
                  borderRadius: 12,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24, marginBottom: 20
                }}>{item.icon}</div>
                <h3 style={{ fontSize: 20, fontWeight: 600, color: "#111827", marginBottom: 10 }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features grid */}
      <div style={{ padding: "80px 24px", background: "#F9FAFB" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <h2 style={{ fontSize: 40, fontWeight: 700, color: "#111827", marginBottom: 12 }}>
              Everything handled automatically
            </h2>
            <p style={{ fontSize: 18, color: "#6B7280" }}>
              From detection to follow-up — your complete meeting lifecycle on autopilot
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {[
              { icon: "🔍", title: "Smart email detection", desc: "AI reads every email and identifies meeting requests regardless of how they're phrased" },
              { icon: "⚡", title: "Conflict prevention", desc: "Checks your Google Calendar before confirming — you'll never get double booked again" },
              { icon: "📋", title: "Pre-meeting briefs", desc: "1 hour before every meeting, receive an AI brief — who you're meeting, what to prepare" },
              { icon: "📝", title: "Auto meeting notes", desc: "After every meeting, AI generates notes with summary, action items and next steps" },
              { icon: "✉️", title: "Confirmation emails", desc: "Professional confirmation emails sent automatically to attendees — you never type them" },
              { icon: "🔒", title: "Privacy first", desc: "Emails never stored permanently. We process and discard. Your inbox stays private." }
            ].map((item, i) => (
              <div key={i} style={{
                background: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: 14, padding: "24px 24px"
              }}>
                <div style={{ fontSize: 28, marginBottom: 14 }}>{item.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginBottom: 8 }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison vs Calendly */}
      <div style={{ padding: "80px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: 36, fontWeight: 700, color: "#111827", marginBottom: 12 }}>
              How we're different from Calendly
            </h2>
            <p style={{ fontSize: 16, color: "#6B7280" }}>
              Calendly waits for people to book you. We detect and handle meetings automatically.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{
              background: "#F9FAFB", border: "1px solid #E5E7EB",
              borderRadius: 14, padding: 28
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#9CA3AF", marginBottom: 16 }}>
                CALENDLY
              </div>
              {[
                "You share a booking link",
                "Client must click and fill form",
                "Client picks a time slot",
                "No email intelligence",
                "No meeting briefs",
                "No meeting notes"
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  fontSize: 14, color: "#6B7280", marginBottom: 10
                }}>
                  <span style={{ color: "#EF4444", fontSize: 16 }}>✗</span>
                  {item}
                </div>
              ))}
            </div>

            <div style={{
              background: "#F5F3FF", border: "2px solid #4F46E5",
              borderRadius: 14, padding: 28
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#4F46E5", marginBottom: 16 }}>
                MEETINGAI
              </div>
              {[
                "AI reads emails automatically",
                "No link or form needed",
                "AI extracts date and time",
                "Understands natural language",
                "AI brief 1hr before meeting",
                "AI notes after every meeting"
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  fontSize: 14, color: "#4338CA", marginBottom: 10
                }}>
                  <span style={{ color: "#4F46E5", fontSize: 16 }}>✓</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div style={{ padding: "80px 24px", background: "#F9FAFB" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: "#111827", textAlign: "center", marginBottom: 48 }}>
            Built for busy professionals
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {[
              {
                quote: "I used to spend 2 hours every morning just managing meeting emails. MeetingAI handles all of it now. I just open my dashboard and approve.",
                name: "Sarah K.",
                role: "Freelance Consultant, USA",
                initials: "SK"
              },
              {
                quote: "The pre-meeting briefs alone are worth the subscription. I walk into every call fully prepared without doing any research myself.",
                name: "Mike R.",
                role: "Real Estate Agent, Canada",
                initials: "MR"
              },
              {
                quote: "Set it up in 3 minutes and completely forgot about it. My calendar manages itself now. This is what AI tools should be like.",
                name: "Emma L.",
                role: "Marketing Agency Owner, Australia",
                initials: "EL"
              }
            ].map((item, i) => (
              <div key={i} style={{
                background: "#fff", border: "1px solid #E5E7EB",
                borderRadius: 16, padding: 28
              }}>
                <div style={{ fontSize: 28, color: "#4F46E5", marginBottom: 16 }}>"</div>
                <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.7, marginBottom: 24 }}>
                  {item.quote}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: "#EEF2FF", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 600, color: "#4338CA"
                  }}>
                    {item.initials}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: "#9CA3AF" }}>{item.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: "100px 24px", background: "#4F46E5" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 42, fontWeight: 700, color: "#fff", marginBottom: 16, lineHeight: 1.2 }}>
            Start saving 3 hours every day
          </h2>
          <p style={{ fontSize: 18, color: "#C7D2FE", marginBottom: 36 }}>
            Join professionals worldwide who let MeetingAI handle their meeting management automatically.
          </p>
          <Link href="/login" style={{
            display: "inline-block",
            background: "#fff", color: "#4F46E5",
            padding: "16px 36px", borderRadius: 10,
            fontSize: 16, fontWeight: 600, textDecoration: "none"
          }}>
            Start your free trial →
          </Link>
          <p style={{ fontSize: 13, color: "#A5B4FC", marginTop: 16 }}>
            14 days free · No credit card required
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        background: "#111827", padding: "40px 24px",
        color: "#9CA3AF", fontSize: 13
      }}>
        <div style={{
          maxWidth: 1000, margin: "0 auto",
          display: "flex", justifyContent: "space-between",
          alignItems: "center", flexWrap: "wrap", gap: 16
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 24, height: 24,
              background: "#4F46E5", borderRadius: 6,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <span style={{ color: "#fff", fontSize: 12 }}>M</span>
            </div>
            <span style={{ color: "#fff", fontWeight: 500 }}>MeetingAI</span>
            <span style={{ marginLeft: 12 }}>© 2026 All rights reserved.</span>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            <Link href="/pricing" style={{ color: "#9CA3AF", textDecoration: "none" }}>Pricing</Link>
            <Link href="/privacy" style={{ color: "#9CA3AF", textDecoration: "none" }}>Privacy</Link>
            <Link href="/terms" style={{ color: "#9CA3AF", textDecoration: "none" }}>Terms</Link>
            <Link href="/login" style={{ color: "#9CA3AF", textDecoration: "none" }}>Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}