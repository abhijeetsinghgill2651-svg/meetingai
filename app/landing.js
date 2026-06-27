import Link from "next/link"

export default function LandingPage() {
  return (
    <div style={{ fontFamily: "var(--font-sans)", background: "#fff", color: "#111827" }}>

      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #F3F4F6",
        padding: "0 32px"
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          display: "flex", justifyContent: "space-between",
          alignItems: "center", height: 64
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, background: "#4F46E5",
              borderRadius: 9, display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: 16
            }}>🤖</div>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>
              MeetingAI
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href="/pricing" style={{
              padding: "8px 16px", fontSize: 14,
              color: "#6B7280", textDecoration: "none"
            }}>Pricing</Link>
            <Link href="/login" style={{
              padding: "8px 16px", fontSize: 14,
              color: "#6B7280", textDecoration: "none"
            }}>Sign in</Link>
            <Link href="/login" style={{
              padding: "9px 20px", fontSize: 14, fontWeight: 500,
              color: "#fff", background: "#4F46E5",
              textDecoration: "none", borderRadius: 8
            }}>Get started free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(180deg, #F5F3FF 0%, #fff 70%)",
        padding: "90px 32px 100px", textAlign: "center"
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#EEF2FF", border: "1px solid #C7D2FE",
            borderRadius: 100, padding: "6px 16px",
            fontSize: 13, color: "#4338CA", marginBottom: 28
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "#4F46E5", display: "inline-block"
            }}></span>
            Works automatically from your Gmail — no setup needed
          </div>

          <h1 style={{
            fontSize: 56, fontWeight: 700, lineHeight: 1.1,
            color: "#111827", marginBottom: 24, letterSpacing: -1
          }}>
            Your AI meeting manager
            <br />
            <span style={{ color: "#4F46E5" }}>that never misses a request</span>
          </h1>

          <p style={{
            fontSize: 19, color: "#6B7280", lineHeight: 1.7,
            maxWidth: 580, margin: "0 auto 40px"
          }}>
            MeetingAI reads your Gmail, detects meeting requests,
            checks your calendar, and books meetings automatically.
            You just click Approve.
          </p>

          <div style={{
            display: "flex", gap: 12,
            justifyContent: "center", flexWrap: "wrap"
          }}>
            <Link href="/login" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#4F46E5", color: "#fff",
              padding: "15px 30px", borderRadius: 10,
              fontSize: 16, fontWeight: 500, textDecoration: "none"
            }}>
              Start free — no card needed →
            </Link>
            <Link href="/pricing" style={{
              display: "inline-flex", alignItems: "center",
              border: "1.5px solid #E5E7EB", color: "#374151",
              padding: "15px 30px", borderRadius: 10,
              fontSize: 16, fontWeight: 500, textDecoration: "none",
              background: "#fff"
            }}>
              See pricing
            </Link>
          </div>
          <p style={{ fontSize: 13, color: "#9CA3AF", marginTop: 14 }}>
            14 days free · No credit card · Cancel anytime
          </p>
        </div>
      </div>

      {/* Dark banner */}
      <div style={{ background: "#111827", padding: "18px 32px" }}>
        <div style={{
          maxWidth: 900, margin: "0 auto",
          display: "flex", justifyContent: "center",
          gap: 48, flexWrap: "wrap"
        }}>
          {[
            { icon: "❌", text: "No booking links to share" },
            { icon: "❌", text: "No forms for clients to fill" },
            { icon: "✅", text: "Works from any email automatically" },
            { icon: "✅", text: "AI understands natural language" }
          ].map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center",
              gap: 8, fontSize: 14, color: "#D1D5DB"
            }}>
              <span>{item.icon}</span><span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ padding: "100px 32px", background: "#fff" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <h2 style={{ fontSize: 38, fontWeight: 700, color: "#111827", marginBottom: 12 }}>
              How MeetingAI works
            </h2>
            <p style={{ fontSize: 17, color: "#6B7280" }}>
              Set up in 3 minutes. Works silently forever.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 28
          }}>
            {[
              {
                step: "01", icon: "📧",
                title: "Connect Gmail",
                desc: "Sign in with Google. MeetingAI gets secure read access to your inbox. Takes 60 seconds.",
                bg: "#EEF2FF"
              },
              {
                step: "02", icon: "🤖",
                title: "AI reads every email",
                desc: "AI scans your inbox and identifies meeting requests — even casual ones like 'can we hop on a call?'",
                bg: "#F0FDF4"
              },
              {
                step: "03", icon: "✅",
                title: "Approve with one click",
                desc: "Review detected meetings on your dashboard. Click Approve — calendar updated, confirmation sent.",
                bg: "#FFF7ED"
              }
            ].map((item, i) => (
              <div key={i} style={{
                background: "#FAFAFA",
                border: "1px solid #F3F4F6",
                borderRadius: 16, padding: "32px 28px"
              }}>
                <div style={{
                  fontSize: 11, fontWeight: 600,
                  color: "#9CA3AF", letterSpacing: 2, marginBottom: 16
                }}>STEP {item.step}</div>
                <div style={{
                  width: 52, height: 52, background: item.bg,
                  borderRadius: 12, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  fontSize: 24, marginBottom: 18
                }}>{item.icon}</div>
                <h3 style={{
                  fontSize: 19, fontWeight: 600,
                  color: "#111827", marginBottom: 8
                }}>{item.title}</h3>
                <p style={{
                  fontSize: 14, color: "#6B7280", lineHeight: 1.7
                }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: "80px 32px", background: "#F9FAFB" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <h2 style={{
              fontSize: 38, fontWeight: 700,
              color: "#111827", marginBottom: 12
            }}>
              Everything handled automatically
            </h2>
            <p style={{ fontSize: 17, color: "#6B7280" }}>
              From detection to follow-up — your complete meeting lifecycle
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 18
          }}>
            {[
              { icon: "🔍", title: "Smart email detection", desc: "AI reads every email and instantly identifies meeting requests regardless of how they are phrased" },
              { icon: "⚡", title: "Conflict prevention", desc: "Checks your Google Calendar before confirming — you will never get double booked again" },
              { icon: "📋", title: "Pre-meeting briefs", desc: "1 hour before every meeting receive an AI brief — who you are meeting, what to prepare" },
              { icon: "📝", title: "Auto meeting notes", desc: "After every meeting AI generates notes with summary, action items and next steps" },
              { icon: "✉️", title: "Confirmation emails", desc: "Professional emails sent automatically to attendees — you never have to type them" },
              { icon: "🔒", title: "Privacy first", desc: "Emails never stored permanently. We process and discard. Your inbox stays private." }
            ].map((item, i) => (
              <div key={i} style={{
                background: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: 14, padding: "24px"
              }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{item.icon}</div>
                <h3 style={{
                  fontSize: 16, fontWeight: 600,
                  color: "#111827", marginBottom: 8
                }}>{item.title}</h3>
                <p style={{
                  fontSize: 14, color: "#6B7280", lineHeight: 1.7
                }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* vs Calendly */}
      <div style={{ padding: "80px 32px", background: "#fff" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{
              fontSize: 36, fontWeight: 700,
              color: "#111827", marginBottom: 12
            }}>
              Different from Calendly
            </h2>
            <p style={{ fontSize: 16, color: "#6B7280" }}>
              Calendly waits for people to book you.
              MeetingAI detects and handles meetings automatically.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{
              background: "#F9FAFB",
              border: "1px solid #E5E7EB",
              borderRadius: 14, padding: 28
            }}>
              <div style={{
                fontSize: 13, fontWeight: 600,
                color: "#9CA3AF", marginBottom: 16
              }}>CALENDLY</div>
              {[
                "You share a booking link",
                "Client must click and fill form",
                "Client picks a slot",
                "No email intelligence",
                "No meeting briefs",
                "No meeting notes"
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center",
                  gap: 10, fontSize: 14, color: "#6B7280", marginBottom: 10
                }}>
                  <span style={{ color: "#EF4444" }}>✗</span>{item}
                </div>
              ))}
            </div>

            <div style={{
              background: "#F5F3FF",
              border: "2px solid #4F46E5",
              borderRadius: 14, padding: 28
            }}>
              <div style={{
                fontSize: 13, fontWeight: 600,
                color: "#4F46E5", marginBottom: 16
              }}>MEETINGAI</div>
              {[
                "AI reads emails automatically",
                "No link or form needed",
                "AI extracts date and time",
                "Understands natural language",
                "AI brief 1hr before meeting",
                "AI notes after every meeting"
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center",
                  gap: 10, fontSize: 14, color: "#4338CA", marginBottom: 10
                }}>
                  <span style={{ color: "#4F46E5" }}>✓</span>{item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div style={{ padding: "80px 32px", background: "#F9FAFB" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h2 style={{
            fontSize: 36, fontWeight: 700,
            color: "#111827", textAlign: "center", marginBottom: 48
          }}>
            Built for busy professionals worldwide
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20
          }}>
            {[
              {
                quote: "I used to spend 2 hours every morning managing meeting emails. MeetingAI handles all of it now.",
                name: "Sarah K.", role: "Freelance Consultant, USA", initials: "SK"
              },
              {
                quote: "The pre-meeting briefs alone are worth the subscription. I walk into every call fully prepared.",
                name: "Mike R.", role: "Real Estate Agent, Canada", initials: "MR"
              },
              {
                quote: "Set it up in 3 minutes and completely forgot about it. My calendar manages itself now.",
                name: "Emma L.", role: "Agency Owner, Australia", initials: "EL"
              }
            ].map((item, i) => (
              <div key={i} style={{
                background: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: 16, padding: 28
              }}>
                <div style={{
                  fontSize: 32, color: "#4F46E5", marginBottom: 14
                }}>"</div>
                <p style={{
                  fontSize: 15, color: "#374151",
                  lineHeight: 1.7, marginBottom: 24
                }}>{item.quote}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: "#EEF2FF", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 600, color: "#4338CA"
                  }}>{item.initials}</div>
                  <div>
                    <div style={{
                      fontSize: 14, fontWeight: 600, color: "#111827"
                    }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: "#9CA3AF" }}>
                      {item.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: "100px 32px", background: "#4F46E5" }}>
        <div style={{
          maxWidth: 600, margin: "0 auto", textAlign: "center"
        }}>
          <h2 style={{
            fontSize: 42, fontWeight: 700,
            color: "#fff", marginBottom: 16, lineHeight: 1.2
          }}>
            Start saving 3 hours every day
          </h2>
          <p style={{
            fontSize: 18, color: "#C7D2FE", marginBottom: 36
          }}>
            Join professionals worldwide who let MeetingAI handle
            their meeting management automatically.
          </p>
          <Link href="/login" style={{
            display: "inline-block",
            background: "#fff", color: "#4F46E5",
            padding: "16px 36px", borderRadius: 10,
            fontSize: 16, fontWeight: 600, textDecoration: "none"
          }}>
            Start your free trial →
          </Link>
          <p style={{
            fontSize: 13, color: "#A5B4FC", marginTop: 16
          }}>
            14 days free · No credit card required
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        background: "#111827",
        padding: "40px 32px"
      }}>
        <div style={{
          maxWidth: 1000, margin: "0 auto",
          display: "flex", justifyContent: "space-between",
          alignItems: "center", flexWrap: "wrap", gap: 16
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8
          }}>
            <div style={{
              width: 26, height: 26, background: "#4F46E5",
              borderRadius: 6, display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: 12
            }}>🤖</div>
            <span style={{ color: "#fff", fontWeight: 500, fontSize: 15 }}>
              MeetingAI
            </span>
            <span style={{
              color: "#6B7280", fontSize: 13, marginLeft: 8
            }}>
              © 2026 All rights reserved
            </span>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {[
              { href: "/pricing", label: "Pricing" },
              { href: "/privacy", label: "Privacy" },
              { href: "/terms", label: "Terms" },
              { href: "/login", label: "Sign in" }
            ].map((link, i) => (
              <Link key={i} href={link.href} style={{
                color: "#9CA3AF", textDecoration: "none", fontSize: 13
              }}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>

    </div>
  )
}