"use client"
import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [emails, setEmails] = useState([])
  const [meetings, setMeetings] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [activeTab, setActiveTab] = useState("meetings")
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    if (session) {
      saveTimezone()
      loadMeetings()
      loadAnalytics()
      checkTrial()
    }
  }, [session])

  const showNotification = (msg, type = "success") => {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 5000)
  }

  const saveTimezone = async () => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    await fetch("/api/save-timezone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timezone })
    })
  }

  const loadMeetings = async () => {
    const res = await fetch("/api/get-meetings")
    const data = await res.json()
    setMeetings(data.meetings || [])
  }

  const loadAnalytics = async () => {
    const res = await fetch("/api/analytics")
    const data = await res.json()
    if (!data.error) setAnalytics(data)
  }

  const checkTrial = async () => {
    const res = await fetch("/api/check-trial")
    const data = await res.json()
    if (data.expired) {
      window.location.href = "/pricing?expired=true"
    } else if (data.daysLeft && data.daysLeft <= 3) {
      showNotification(
        `Trial expires in ${data.daysLeft} day${data.daysLeft === 1 ? "" : "s"} — upgrade now!`,
        "warning"
      )
    }
  }

  const scanEmails = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/scan-emails")
      const data = await res.json()
      if (data.error) {
        showNotification(data.error, "error")
      } else {
        setEmails(data.emails || [])
        showNotification(`Scanned ${data.emails?.length || 0} emails successfully`)
        await new Promise(r => setTimeout(r, 1000))
        loadMeetings()
        loadAnalytics()
      }
    } catch (error) {
      showNotification("Scan failed — please try again", "error")
    }
    setLoading(false)
  }

  const approveMeeting = async (meetingId) => {
    try {
      const res = await fetch("/api/approve-meeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId })
      })
      const data = await res.json()
      if (data.conflict) {
        showNotification("Conflict — you already have something at this time", "error")
      } else if (data.calendarCreated) {
        showNotification("Meeting approved and added to Google Calendar!")
      } else {
        showNotification(data.message || "Meeting approved")
      }
      loadMeetings()
      loadAnalytics()
    } catch (error) {
      showNotification("Approval failed — please try again", "error")
    }
  }

  const declineMeeting = async (meetingId) => {
    await fetch("/api/approve-meeting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meetingId, action: "decline" })
    })
    showNotification("Meeting declined")
    loadMeetings()
  }

  if (status === "loading") {
    return (
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "center", minHeight: "100vh",
        background: "#F9FAFB", fontFamily: "var(--font-sans)"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🤖</div>
          <div style={{ fontSize: 14, color: "#6B7280" }}>Loading MeetingAI...</div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "center", minHeight: "100vh"
      }}>
        <Link href="/login" style={{ color: "#4F46E5" }}>
          Please log in
        </Link>
      </div>
    )
  }

  const pending = meetings.filter(m => m.status === "pending_review")
  const active = meetings.filter(m =>
    m.status === "approved" || m.status === "brief_sent"
  )
  const completed = meetings.filter(m => m.status === "completed")

  return (
    <div style={{
      background: "#F9FAFB", minHeight: "100vh",
      fontFamily: "var(--font-sans)"
    }}>

      {/* Notification */}
      {notification && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 1000,
          background: notification.type === "error"
            ? "#FEF2F2"
            : notification.type === "warning"
            ? "#FFFBEB"
            : "#F0FDF4",
          border: `1px solid ${
            notification.type === "error"
              ? "#FECACA"
              : notification.type === "warning"
              ? "#FDE68A"
              : "#BBF7D0"
          }`,
          color: notification.type === "error"
            ? "#991B1B"
            : notification.type === "warning"
            ? "#92400E"
            : "#166534",
          padding: "12px 20px", borderRadius: 10,
          fontSize: 14, fontWeight: 500,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          maxWidth: 380, zIndex: 9999
        }}>
          {notification.type === "error"
            ? "⚠️"
            : notification.type === "warning"
            ? "🕐"
            : "✅"} {notification.msg}
        </div>
      )}

      {/* Navbar */}
      <div style={{
        background: "#fff",
        borderBottom: "1px solid #E5E7EB",
        padding: "0 24px",
        position: "sticky", top: 0, zIndex: 40
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          display: "flex", justifyContent: "space-between",
          alignItems: "center", height: 60
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10
          }}>
            <div style={{
              width: 30, height: 30, background: "#4F46E5",
              borderRadius: 8, display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: 14
            }}>🤖</div>
            <span style={{
              fontSize: 16, fontWeight: 700, color: "#111827"
            }}>MeetingAI</span>
            {analytics && (
              <span style={{
                background: analytics.plan === "trial"
                  ? "#FEF3C7"
                  : "#ECFDF5",
                color: analytics.plan === "trial"
                  ? "#92400E"
                  : "#065F46",
                fontSize: 11, fontWeight: 500,
                padding: "2px 8px", borderRadius: 20, marginLeft: 4
              }}>
                {analytics.plan === "trial"
                  ? `Trial — ${analytics.trialDaysLeft}d left`
                  : analytics.plan}
              </span>
            )}
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: 8
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "#EEF2FF", display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 600, color: "#4338CA"
            }}>
              {session.user.name?.[0]?.toUpperCase()}
            </div>
            <span style={{ fontSize: 13, color: "#374151" }}>
              {session.user.name?.split(" ")[0]}
            </span>
            <span style={{ color: "#E5E7EB", margin: "0 6px" }}>|</span>
            <Link href="/settings" style={{
              fontSize: 13, color: "#6B7280", textDecoration: "none"
            }}>Settings</Link>
            <Link href="/pricing" style={{
              fontSize: 13, color: "#4F46E5",
              textDecoration: "none", fontWeight: 500
            }}>Upgrade</Link>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              style={{
                fontSize: 13, color: "#6B7280",
                background: "none", border: "none",
                cursor: "pointer", padding: 0
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: 1100, margin: "0 auto", padding: "28px 24px"
      }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{
            fontSize: 24, fontWeight: 700,
            color: "#111827", marginBottom: 4
          }}>
            Dashboard
          </h1>
          <p style={{ fontSize: 14, color: "#6B7280" }}>
            Welcome back, {session.user.name?.split(" ")[0]}.
            {analytics
              ? ` You have saved ${analytics.hoursSaved.toFixed(1)} hours so far.`
              : ""}
          </p>
        </div>

        {/* Analytics cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14, marginBottom: 24
        }}>
          {[
            {
              label: "Total meetings",
              val: analytics?.total ?? meetings.length,
              icon: "📅", color: "#4F46E5", bg: "#EEF2FF"
            },
            {
              label: "Pending review",
              val: analytics?.pending ?? pending.length,
              icon: "⏳", color: "#D97706", bg: "#FFFBEB"
            },
            {
              label: "Approved",
              val: analytics?.approved ?? active.length,
              icon: "✅", color: "#059669", bg: "#ECFDF5"
            },
            {
              label: "Hours saved",
              val: analytics?.hoursSaved?.toFixed(1) ?? "0",
              icon: "⏰", color: "#7C3AED", bg: "#F5F3FF"
            }
          ].map((card, i) => (
            <div key={i} style={{
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: 12, padding: "16px 18px"
            }}>
              <div style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between", marginBottom: 8
              }}>
                <span style={{ fontSize: 12, color: "#9CA3AF" }}>
                  {card.label}
                </span>
                <span style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: card.bg, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  fontSize: 15
                }}>{card.icon}</span>
              </div>
              <div style={{
                fontSize: 28, fontWeight: 700, color: card.color
              }}>
                {card.val}
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{
          display: "flex", gap: 10,
          marginBottom: 24, flexWrap: "wrap"
        }}>
          <button
            onClick={scanEmails}
            disabled={loading}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: loading ? "#A5B4FC" : "#4F46E5",
              color: "#fff", border: "none",
              padding: "10px 20px", borderRadius: 8,
              fontSize: 14, fontWeight: 500,
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "⏳ Scanning..." : "📧 Scan inbox for meetings"}
          </button>

          {[
            {
              label: "📋 Send briefs",
              endpoint: "/api/send-briefs",
              key: "briefsSent"
            },
            {
              label: "📝 Meeting notes",
              endpoint: "/api/post-meeting",
              key: "processed"
            },
            {
              label: "🔔 Send reminders",
              endpoint: "/api/send-reminders",
              key: "reminders"
            }
          ].map((btn, i) => (
            <button
              key={i}
              onClick={async () => {
                const res = await fetch(btn.endpoint)
                const data = await res.json()
                showNotification(
                  data.message ||
                  `Done — ${data[btn.key] || 0} processed`
                )
              }}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "#fff", color: "#374151",
                border: "1px solid #E5E7EB",
                padding: "10px 18px", borderRadius: 8,
                fontSize: 14, fontWeight: 500, cursor: "pointer"
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex",
          borderBottom: "1px solid #E5E7EB", marginBottom: 20
        }}>
          {[
            { id: "meetings", label: `Meetings (${meetings.length})` },
            { id: "emails", label: `Scanned emails (${emails.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "10px 20px", fontSize: 14, fontWeight: 500,
                border: "none", background: "none", cursor: "pointer",
                color: activeTab === tab.id ? "#4F46E5" : "#6B7280",
                borderBottom: activeTab === tab.id
                  ? "2px solid #4F46E5"
                  : "2px solid transparent",
                marginBottom: -1
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Meetings Tab */}
        {activeTab === "meetings" && (
          <div>
            {pending.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{
                  fontSize: 11, fontWeight: 600,
                  color: "#9CA3AF", letterSpacing: 1,
                  marginBottom: 10, textTransform: "uppercase"
                }}>
                  Pending approval — {pending.length}
                </div>
                <div style={{
                  display: "flex", flexDirection: "column", gap: 10
                }}>
                  {pending.map(meeting => (
                    <MeetingCard
                      key={meeting.id}
                      meeting={meeting}
                      onApprove={() => approveMeeting(meeting.id)}
                      onDecline={() => declineMeeting(meeting.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {active.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{
                  fontSize: 11, fontWeight: 600,
                  color: "#9CA3AF", letterSpacing: 1,
                  marginBottom: 10, textTransform: "uppercase"
                }}>
                  Upcoming — {active.length}
                </div>
                <div style={{
                  display: "flex", flexDirection: "column", gap: 10
                }}>
                  {active.map(meeting => (
                    <MeetingCard key={meeting.id} meeting={meeting} />
                  ))}
                </div>
              </div>
            )}

            {completed.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{
                  fontSize: 11, fontWeight: 600,
                  color: "#9CA3AF", letterSpacing: 1,
                  marginBottom: 10, textTransform: "uppercase"
                }}>
                  Completed — {completed.length}
                </div>
                <div style={{
                  display: "flex", flexDirection: "column", gap: 10
                }}>
                  {completed.map(meeting => (
                    <MeetingCard key={meeting.id} meeting={meeting} />
                  ))}
                </div>
              </div>
            )}

            {meetings.length === 0 && (
              <div style={{
                background: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: 14, padding: "60px 40px",
                textAlign: "center"
              }}>
                <div style={{ fontSize: 44, marginBottom: 16 }}>📭</div>
                <div style={{
                  fontSize: 17, fontWeight: 500,
                  color: "#374151", marginBottom: 8
                }}>
                  No meetings detected yet
                </div>
                <div style={{
                  fontSize: 14, color: "#9CA3AF", marginBottom: 24
                }}>
                  Click "Scan inbox for meetings" to check your Gmail
                </div>
                <button
                  onClick={scanEmails}
                  disabled={loading}
                  style={{
                    background: "#4F46E5", color: "#fff",
                    border: "none", padding: "11px 24px",
                    borderRadius: 8, fontSize: 14,
                    fontWeight: 500, cursor: "pointer"
                  }}
                >
                  {loading ? "Scanning..." : "Scan inbox now"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Emails Tab */}
        {activeTab === "emails" && (
          <div>
            {emails.length === 0 ? (
              <div style={{
                background: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: 14, padding: "60px 40px",
                textAlign: "center"
              }}>
                <div style={{ fontSize: 44, marginBottom: 16 }}>📬</div>
                <div style={{
                  fontSize: 17, fontWeight: 500,
                  color: "#374151", marginBottom: 8
                }}>
                  No emails scanned yet
                </div>
                <div style={{ fontSize: 14, color: "#9CA3AF" }}>
                  Click "Scan inbox" to see your recent emails
                </div>
              </div>
            ) : (
              <div style={{
                display: "flex", flexDirection: "column", gap: 8
              }}>
                {emails.map((email, i) => (
                  <div key={i} style={{
                    background: "#fff",
                    border: "1px solid #E5E7EB",
                    borderRadius: 12, padding: "14px 18px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start"
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 14, fontWeight: 500,
                        color: "#111827", marginBottom: 3,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                        {email.subject}
                      </div>
                      <div style={{
                        fontSize: 12, color: "#9CA3AF", marginBottom: 4
                      }}>
                        {email.from}
                      </div>
                      {email.aiSummary && (
                        <div style={{ fontSize: 13, color: "#6B7280" }}>
                          {email.aiSummary}
                        </div>
                      )}
                    </div>
                    <div style={{ marginLeft: 16, flexShrink: 0 }}>
                      <span style={{
                        display: "inline-block",
                        padding: "3px 10px", borderRadius: 20,
                        fontSize: 11, fontWeight: 500,
                        background: email.isMeetingRequest
                          ? "#EEF2FF"
                          : "#F3F4F6",
                        color: email.isMeetingRequest
                          ? "#4338CA"
                          : "#6B7280"
                      }}>
                        {email.isMeetingRequest
                          ? "✓ Meeting"
                          : "Not a meeting"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function MeetingCard({ meeting, onApprove, onDecline }) {
  const statusConfig = {
    pending_review: {
      label: "Pending review",
      bg: "#FFFBEB", color: "#92400E", border: "#FDE68A"
    },
    approved: {
      label: "Approved",
      bg: "#ECFDF5", color: "#065F46", border: "#A7F3D0"
    },
    brief_sent: {
      label: "Brief sent",
      bg: "#EFF6FF", color: "#1E40AF", border: "#BFDBFE"
    },
    completed: {
      label: "Completed",
      bg: "#F0FDF4", color: "#166534", border: "#BBF7D0"
    },
    conflict: {
      label: "Time conflict",
      bg: "#FEF2F2", color: "#991B1B", border: "#FECACA"
    }
  }

  const s = statusConfig[meeting.status] || statusConfig.pending_review

  return (
    <div style={{
      background: "#fff",
      border: "1px solid #E5E7EB",
      borderRadius: 12, padding: "16px 18px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center", gap: 16
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: "flex", alignItems: "center",
          gap: 10, marginBottom: 6
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "#EEF2FF", display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: 16, flexShrink: 0
          }}>📅</div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 14, fontWeight: 600, color: "#111827",
              overflow: "hidden", textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}>
              {meeting.title}
            </div>
            <div style={{ fontSize: 12, color: "#9CA3AF" }}>
              From: {meeting.attendee_name || meeting.attendee_email}
            </div>
          </div>
        </div>

        {meeting.brief && (
          <div style={{
            fontSize: 13, color: "#6B7280",
            marginBottom: 8, paddingLeft: 46
          }}>
            {meeting.brief.length > 120
              ? meeting.brief.substring(0, 120) + "..."
              : meeting.brief}
          </div>
        )}

        <div style={{
          display: "flex", alignItems: "center",
          gap: 10, paddingLeft: 46, flexWrap: "wrap"
        }}>
          <span style={{
            display: "inline-block",
            padding: "3px 10px", borderRadius: 20,
            fontSize: 11, fontWeight: 500,
            background: s.bg, color: s.color,
            border: `1px solid ${s.border}`
          }}>
            {s.label}
          </span>

          {meeting.scheduled_at && (
            <span style={{ fontSize: 12, color: "#9CA3AF" }}>
              🕐 {new Date(meeting.scheduled_at).toLocaleString("en-US", {
                month: "short", day: "numeric",
                hour: "2-digit", minute: "2-digit"
              })}
            </span>
          )}

          {meeting.duration_minutes && (
            <span style={{ fontSize: 12, color: "#9CA3AF" }}>
              ⏱ {meeting.duration_minutes} min
            </span>
          )}
        </div>

        {meeting.meeting_link && (
          <div style={{ paddingLeft: 46, marginTop: 6 }}>
            <a
              href={meeting.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 12, color: "#4F46E5",
                textDecoration: "none"
              }}
            >
              View in Google Calendar →
            </a>
          </div>
        )}
      </div>

      {meeting.status === "pending_review" && (
        <div style={{
          display: "flex", flexDirection: "column",
          gap: 6, flexShrink: 0
        }}>
          {onApprove && (
            <button
              onClick={onApprove}
              style={{
                background: "#4F46E5", color: "#fff",
                border: "none", padding: "8px 16px",
                borderRadius: 7, fontSize: 13,
                fontWeight: 500, cursor: "pointer",
                whiteSpace: "nowrap"
              }}
            >
              ✓ Approve
            </button>
          )}
          {onDecline && (
            <button
              onClick={onDecline}
              style={{
                background: "#fff", color: "#EF4444",
                border: "1px solid #FCA5A5",
                padding: "8px 16px", borderRadius: 7,
                fontSize: 13, cursor: "pointer",
                whiteSpace: "nowrap"
              }}
            >
              ✗ Decline
            </button>
          )}
        </div>
      )}
    </div>
  )
}