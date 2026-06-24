"use client"
import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [emails, setEmails] = useState([])
  const [meetings, setMeetings] = useState([])
  const [activeTab, setActiveTab] = useState("meetings")
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    if (session) {
      saveTimezone()
      loadMeetings()
    }
  }, [session])

  const showNotification = (msg, type = "success") => {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 4000)
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

  const scanEmails = async () => {
    setLoading(true)
    const res = await fetch("/api/scan-emails")
    const data = await res.json()
    setEmails(data.emails || [])
    setLoading(false)
    await new Promise(r => setTimeout(r, 1000))
    loadMeetings()
    showNotification("Inbox scanned successfully")
  }

  const approveMeeting = async (meetingId) => {
    const res = await fetch("/api/approve-meeting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meetingId })
    })
    const data = await res.json()
    if (data.conflict) {
      showNotification("Conflict found — you already have something at this time", "error")
    } else if (data.calendarCreated) {
      showNotification("Meeting approved and added to your Google Calendar")
    } else {
      showNotification(data.message || "Meeting approved")
    }
    loadMeetings()
  }

  if (status === "loading") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#F9FAFB" }}>
        <div style={{ fontSize: 14, color: "#6B7280" }}>Loading...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <Link href="/login" style={{ color: "#4F46E5" }}>Please log in</Link>
      </div>
    )
  }

  const pending = meetings.filter(m => m.status === "pending_review")
  const approved = meetings.filter(m => m.status === "approved" || m.status === "completed")

  return (
    <div style={{ background: "#F9FAFB", minHeight: "100vh", fontFamily: "var(--font-sans)" }}>

      {/* Notification */}
      {notification && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 1000,
          background: notification.type === "error" ? "#FEF2F2" : "#F0FDF4",
          border: `1px solid ${notification.type === "error" ? "#FECACA" : "#BBF7D0"}`,
          color: notification.type === "error" ? "#991B1B" : "#166534",
          padding: "12px 20px", borderRadius: 10, fontSize: 14,
          fontWeight: 500, boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}>
          {notification.type === "error" ? "⚠️" : "✅"} {notification.msg}
        </div>
      )}

      {/* Top navbar */}
      <div style={{
        background: "#fff", borderBottom: "1px solid #E5E7EB",
        padding: "0 24px", position: "sticky", top: 0, zIndex: 40
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          display: "flex", justifyContent: "space-between",
          alignItems: "center", height: 60
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 28, height: 28, background: "#4F46E5",
              borderRadius: 7, display: "flex",
              alignItems: "center", justifyContent: "center"
            }}>
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>M</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>MeetingAI</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "#EEF2FF", display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 600, color: "#4338CA"
            }}>
              {session.user.name?.[0]?.toUpperCase()}
            </div>
            <span style={{ fontSize: 13, color: "#374151" }}>{session.user.name}</span>
            <span style={{ color: "#E5E7EB", margin: "0 8px" }}>|</span>
            <Link href="/settings" style={{ fontSize: 13, color: "#6B7280", textDecoration: "none" }}>Settings</Link>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              style={{
                marginLeft: 8, fontSize: 13, color: "#6B7280",
                background: "none", border: "none", cursor: "pointer", padding: 0
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#111827", marginBottom: 4 }}>
            Dashboard
          </h1>
          <p style={{ fontSize: 14, color: "#6B7280" }}>
            Good to see you, {session.user.name?.split(" ")[0]}. Here's your meeting overview.
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Total meetings", val: meetings.length, color: "#4F46E5", bg: "#EEF2FF" },
            { label: "Pending review", val: pending.length, color: "#D97706", bg: "#FFFBEB" },
            { label: "Approved", val: approved.length, color: "#059669", bg: "#ECFDF5" },
            { label: "Emails scanned", val: emails.length, color: "#7C3AED", bg: "#F5F3FF" }
          ].map((s, i) => (
            <div key={i} style={{
              background: "#fff", border: "1px solid #E5E7EB",
              borderRadius: 12, padding: "18px 20px"
            }}>
              <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 6 }}>{s.label}</div>
              <div style={{
                fontSize: 32, fontWeight: 700, color: s.color,
                display: "flex", alignItems: "center", gap: 8
              }}>
                <span style={{
                  background: s.bg, borderRadius: 8,
                  width: 40, height: 40, display: "inline-flex",
                  alignItems: "center", justifyContent: "center",
                  fontSize: 18
                }}>{s.val}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
          <button
            onClick={scanEmails}
            disabled={loading}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: loading ? "#A5B4FC" : "#4F46E5",
              color: "#fff", border: "none",
              padding: "10px 20px", borderRadius: 8,
              fontSize: 14, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "⏳ Scanning inbox..." : "📧 Scan inbox for meetings"}
          </button>

          <button
            onClick={async () => {
              const res = await fetch("/api/send-briefs")
              const data = await res.json()
              showNotification(data.message || `${data.briefsSent || 0} briefs sent`)
            }}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "#fff", color: "#374151",
              border: "1px solid #E5E7EB",
              padding: "10px 20px", borderRadius: 8,
              fontSize: 14, fontWeight: 500, cursor: "pointer"
            }}
          >
            📋 Send pre-meeting briefs
          </button>

          <button
            onClick={async () => {
              const res = await fetch("/api/post-meeting")
              const data = await res.json()
              showNotification(data.message || `Processed ${data.processed || 0} meetings`)
            }}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "#fff", color: "#374151",
              border: "1px solid #E5E7EB",
              padding: "10px 20px", borderRadius: 8,
              fontSize: 14, fontWeight: 500, cursor: "pointer"
            }}
          >
            📝 Generate meeting notes
          </button>
          <button
  onClick={async () => {
    const res = await fetch("/api/send-reminders")
    const data = await res.json()
    showNotification(data.message || `${data.reminders || 0} reminder emails sent`)
  }}
  style={{
    display: "flex", alignItems: "center", gap: 8,
    background: "#fff", color: "#374151",
    border: "1px solid #E5E7EB",
    padding: "10px 20px", borderRadius: 8,
    fontSize: 14, fontWeight: 500, cursor: "pointer"
  }}
>
  🔔 Send reminders
</button>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", borderBottom: "1px solid #E5E7EB", marginBottom: 20
        }}>
          {[
            { id: "meetings", label: `Detected meetings (${meetings.length})` },
            { id: "emails", label: `Scanned emails (${emails.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "10px 20px", fontSize: 14, fontWeight: 500,
                border: "none", background: "none", cursor: "pointer",
                color: activeTab === tab.id ? "#4F46E5" : "#6B7280",
                borderBottom: activeTab === tab.id ? "2px solid #4F46E5" : "2px solid transparent",
                marginBottom: -1
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Meetings tab */}
        {activeTab === "meetings" && (
          <div>
            {pending.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#9CA3AF", letterSpacing: 1, marginBottom: 10, textTransform: "uppercase" }}>
                  Pending approval ({pending.length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {pending.map(meeting => (
                    <MeetingCard key={meeting.id} meeting={meeting} onApprove={() => approveMeeting(meeting.id)} />
                  ))}
                </div>
              </div>
            )}

            {approved.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#9CA3AF", letterSpacing: 1, marginBottom: 10, textTransform: "uppercase" }}>
                  Approved ({approved.length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {approved.map(meeting => (
                    <MeetingCard key={meeting.id} meeting={meeting} />
                  ))}
                </div>
              </div>
            )}

            {meetings.length === 0 && (
              <div style={{
                background: "#fff", border: "1px solid #E5E7EB",
                borderRadius: 12, padding: "60px 40px", textAlign: "center"
              }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>📭</div>
                <div style={{ fontSize: 16, fontWeight: 500, color: "#374151", marginBottom: 8 }}>
                  No meetings detected yet
                </div>
                <div style={{ fontSize: 14, color: "#9CA3AF", marginBottom: 20 }}>
                  Click "Scan inbox for meetings" to check your Gmail
                </div>
                <button
                  onClick={scanEmails}
                  disabled={loading}
                  style={{
                    background: "#4F46E5", color: "#fff", border: "none",
                    padding: "10px 24px", borderRadius: 8,
                    fontSize: 14, fontWeight: 500, cursor: "pointer"
                  }}
                >
                  {loading ? "Scanning..." : "Scan inbox now"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Emails tab */}
        {activeTab === "emails" && (
          <div>
            {emails.length === 0 ? (
              <div style={{
                background: "#fff", border: "1px solid #E5E7EB",
                borderRadius: 12, padding: "60px 40px", textAlign: "center"
              }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>📬</div>
                <div style={{ fontSize: 16, fontWeight: 500, color: "#374151", marginBottom: 8 }}>
                  No emails scanned yet
                </div>
                <div style={{ fontSize: 14, color: "#9CA3AF" }}>
                  Click "Scan inbox" to see your recent emails
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {emails.map((email, i) => (
                  <div key={i} style={{
                    background: "#fff", border: "1px solid #E5E7EB",
                    borderRadius: 12, padding: "16px 20px",
                    display: "flex", justifyContent: "space-between", alignItems: "flex-start"
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 14, fontWeight: 500, color: "#111827",
                        marginBottom: 4, whiteSpace: "nowrap",
                        overflow: "hidden", textOverflow: "ellipsis"
                      }}>
                        {email.subject}
                      </div>
                      <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 6 }}>
                        {email.from}
                      </div>
                      {email.aiSummary && (
                        <div style={{ fontSize: 13, color: "#6B7280" }}>{email.aiSummary}</div>
                      )}
                    </div>
                    <div style={{ marginLeft: 16, flexShrink: 0 }}>
                      <span style={{
                        display: "inline-block",
                        padding: "3px 10px", borderRadius: 20,
                        fontSize: 11, fontWeight: 500,
                        background: email.isMeetingRequest ? "#EEF2FF" : "#F3F4F6",
                        color: email.isMeetingRequest ? "#4338CA" : "#6B7280"
                      }}>
                        {email.isMeetingRequest ? "Meeting detected" : "Not a meeting"}
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

function MeetingCard({ meeting, onApprove }) {
  const statusConfig = {
    pending_review: { label: "Pending review", bg: "#FFFBEB", color: "#92400E", border: "#FDE68A" },
    approved: { label: "Approved", bg: "#ECFDF5", color: "#065F46", border: "#A7F3D0" },
    completed: { label: "Completed", bg: "#F0FDF4", color: "#166534", border: "#BBF7D0" },
    conflict: { label: "Conflict", bg: "#FEF2F2", color: "#991B1B", border: "#FECACA" },
    brief_sent: { label: "Brief sent", bg: "#EFF6FF", color: "#1E40AF", border: "#BFDBFE" }
  }

  const s = statusConfig[meeting.status] || statusConfig.pending_review

  return (
    <div style={{
      background: "#fff",
      border: "1px solid #E5E7EB",
      borderRadius: 12, padding: "18px 20px",
      display: "flex", justifyContent: "space-between",
      alignItems: "center", gap: 16
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "#EEF2FF", display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: 16, flexShrink: 0
          }}>
            📅
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
              {meeting.title}
            </div>
            <div style={{ fontSize: 12, color: "#9CA3AF" }}>
              From: {meeting.attendee_name || meeting.attendee_email}
            </div>
          </div>
        </div>

        {meeting.brief && (
          <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 8, paddingLeft: 46 }}>
            {meeting.brief}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingLeft: 46 }}>
          <span style={{
            display: "inline-block", padding: "3px 10px",
            borderRadius: 20, fontSize: 11, fontWeight: 500,
            background: s.bg, color: s.color, border: `1px solid ${s.border}`
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
              style={{ fontSize: 12, color: "#4F46E5", textDecoration: "none" }}
            >
              View in Google Calendar →
            </a>
          </div>
        )}
      </div>

      {meeting.status === "pending_review" && onApprove && (
        <button
          onClick={onApprove}
          style={{
            background: "#4F46E5", color: "#fff",
            border: "none", padding: "9px 18px",
            borderRadius: 8, fontSize: 13, fontWeight: 500,
            cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap"
          }}
        >
          Approve ✓
        </button>
      )}
    </div>
  )
}