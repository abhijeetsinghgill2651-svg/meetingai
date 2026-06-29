const APP_URL = "https://meetingai-one.vercel.app"

let panel = null
let checkInterval = null

function createPanel() {
  if (document.getElementById("meetingai-panel")) return

  panel = document.createElement("div")
  panel.id = "meetingai-panel"
  panel.innerHTML = `
    <div id="meetingai-header">
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:18px">🤖</span>
        <span style="font-size:14px;font-weight:700;color:#fff">MeetingAI</span>
      </div>
      <button id="meetingai-close" style="background:none;border:none;color:rgba(255,255,255,0.7);cursor:pointer;font-size:16px;padding:0">×</button>
    </div>
    <div id="meetingai-content">
      <div style="text-align:center;padding:16px;color:#94A3B8;font-size:13px">
        Loading...
      </div>
    </div>
    <div id="meetingai-footer">
      <button id="meetingai-scan">📧 Scan inbox</button>
      <button id="meetingai-open">Open app ↗</button>
    </div>
  `

  document.body.appendChild(panel)

  document.getElementById("meetingai-close").addEventListener("click", () => {
    panel.style.display = "none"
  })

  document.getElementById("meetingai-scan").addEventListener("click", scanEmails)

  document.getElementById("meetingai-open").addEventListener("click", () => {
    window.open(`${APP_URL}/dashboard`, "_blank")
  })

  loadMeetings()
}

function showContent(html) {
  const content = document.getElementById("meetingai-content")
  if (content) content.innerHTML = html
}

async function loadMeetings() {
  try {
    const res = await fetch(`${APP_URL}/api/get-meetings`, {
      credentials: "include"
    })

    if (!res.ok) {
      showContent(`
        <div style="text-align:center;padding:20px">
          <div style="font-size:28px;margin-bottom:10px">🔐</div>
          <div style="font-size:13px;font-weight:600;color:#0F172A;margin-bottom:6px">Sign in required</div>
          <div style="font-size:12px;color:#6B7280;line-height:1.5;margin-bottom:12px">
            Open MeetingAI and sign in to get started
          </div>
          <button onclick="window.open('${APP_URL}/login','_blank')" style="background:#4F46E5;color:#fff;border:none;padding:8px 16px;border-radius:8px;font-size:12px;cursor:pointer;font-family:inherit">
            Sign in to MeetingAI
          </button>
        </div>
      `)
      return
    }

    const data = await res.json()
    const meetings = data.meetings || []
    const pending = meetings.filter(m => m.status === "pending_review")
    const approved = meetings.filter(m =>
      m.status === "approved" || m.status === "brief_sent"
    )

    let html = `
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:12px">
        ${[
          { val: meetings.length, label: "Total", color: "#4F46E5" },
          { val: pending.length, label: "Pending", color: "#F59E0B" },
          { val: approved.length, label: "Approved", color: "#10B981" }
        ].map(s => `
          <div style="background:#fff;border:1px solid #E2E8F0;border-radius:8px;padding:8px;text-align:center">
            <div style="font-size:18px;font-weight:700;color:${s.color}">${s.val}</div>
            <div style="font-size:10px;color:#94A3B8">${s.label}</div>
          </div>
        `).join("")}
      </div>
    `

    if (pending.length > 0) {
      html += `<div style="font-size:10px;font-weight:700;color:#94A3B8;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:6px">Needs approval</div>`
      pending.forEach(m => {
        html += `
          <div style="background:#fff;border:1px solid #E2E8F0;border-radius:10px;padding:12px;margin-bottom:8px">
            <div style="font-size:13px;font-weight:600;color:#0F172A;margin-bottom:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
              ${m.title}
            </div>
            <div style="font-size:11px;color:#94A3B8;margin-bottom:8px">
              ${m.attendee_name || m.attendee_email}
            </div>
            ${m.brief ? `<div style="font-size:11px;color:#64748B;margin-bottom:8px;line-height:1.5">${m.brief.substring(0, 70)}...</div>` : ""}
            <div style="display:flex;gap:6px">
              <button onclick="meetingAIApprove('${m.id}')" style="flex:1;padding:6px;background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#fff;border:none;border-radius:7px;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit">
                ✓ Approve
              </button>
              <button onclick="meetingAIDecline('${m.id}')" style="padding:6px 10px;background:#FEF2F2;color:#EF4444;border:1px solid #FECACA;border-radius:7px;font-size:11px;cursor:pointer;font-family:inherit">
                ✗
              </button>
            </div>
          </div>
        `
      })
    }

    if (approved.length > 0) {
      html += `<div style="font-size:10px;font-weight:700;color:#94A3B8;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:6px;margin-top:${pending.length > 0 ? "10px" : "0"}">Upcoming</div>`
      approved.slice(0, 2).forEach(m => {
        const time = m.scheduled_at
          ? new Date(m.scheduled_at).toLocaleString("en-US", {
              month: "short", day: "numeric",
              hour: "2-digit", minute: "2-digit"
            })
          : "No time set"
        html += `
          <div style="background:#fff;border:1px solid #E2E8F0;border-radius:10px;padding:10px;margin-bottom:6px">
            <div style="font-size:12px;font-weight:600;color:#0F172A;margin-bottom:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
              ${m.title}
            </div>
            <div style="font-size:10px;color:#94A3B8">${time}</div>
          </div>
        `
      })
    }

    if (meetings.length === 0) {
      html += `
        <div style="text-align:center;padding:20px 0;color:#94A3B8">
          <div style="font-size:28px;margin-bottom:8px">📭</div>
          <div style="font-size:12px">No meetings detected yet.<br/>Click "Scan inbox" to check.</div>
        </div>
      `
    }

    showContent(html)

  } catch (error) {
    showContent(`
      <div style="text-align:center;padding:16px;color:#EF4444;font-size:12px">
        Connection error. Is MeetingAI running?
      </div>
    `)
  }
}

window.meetingAIApprove = async function(meetingId) {
  try {
    const res = await fetch(`${APP_URL}/api/approve-meeting`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ meetingId })
    })
    const data = await res.json()
    if (data.calendarCreated) {
      showNotificationBanner("✅ Meeting approved and added to calendar!")
    } else if (data.conflict) {
      showNotificationBanner("⚠️ Time conflict found!", "error")
    } else {
      showNotificationBanner("✅ Meeting approved!")
    }
    loadMeetings()
  } catch (e) {
    showNotificationBanner("⚠️ Failed to approve", "error")
  }
}

window.meetingAIDecline = async function(meetingId) {
  try {
    await fetch(`${APP_URL}/api/approve-meeting`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ meetingId, action: "decline" })
    })
    showNotificationBanner("Meeting declined")
    loadMeetings()
  } catch (e) {
    showNotificationBanner("⚠️ Failed to decline", "error")
  }
}

async function scanEmails() {
  const btn = document.getElementById("meetingai-scan")
  if (btn) {
    btn.textContent = "⏳ Scanning..."
    btn.disabled = true
  }

  try {
    const res = await fetch(`${APP_URL}/api/scan-emails`, {
      credentials: "include"
    })
    const data = await res.json()
    if (data.error) {
      showNotificationBanner("⚠️ " + data.error, "error")
    } else {
      showNotificationBanner(`✅ Scanned ${data.emails?.length || 0} emails`)
      loadMeetings()
    }
  } catch (e) {
    showNotificationBanner("⚠️ Scan failed", "error")
  }

  if (btn) {
    btn.textContent = "📧 Scan inbox"
    btn.disabled = false
  }
}

function showNotificationBanner(msg, type = "success") {
  let banner = document.getElementById("meetingai-banner")
  if (!banner) {
    banner = document.createElement("div")
    banner.id = "meetingai-banner"
    document.body.appendChild(banner)
  }

  banner.textContent = msg
  banner.style.cssText = `
    position: fixed;
    top: 20px;
    right: 320px;
    z-index: 999999;
    padding: 10px 18px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 500;
    font-family: -apple-system, sans-serif;
    background: ${type === "error" ? "#FEF2F2" : "#F0FDF4"};
    color: ${type === "error" ? "#991B1B" : "#166534"};
    border: 1px solid ${type === "error" ? "#FECACA" : "#BBF7D0"};
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    animation: slideIn 0.3s ease;
  `

  setTimeout(() => {
    if (banner) banner.remove()
  }, 3000)
}

function detectEmailPage() {
  const url = window.location.href
  return url.includes("mail.google.com") && (
    url.includes("#inbox") ||
    url.includes("?compose") ||
    url.includes("#") ||
    url.includes("view=cm")
  )
}

function init() {
  if (!document.getElementById("meetingai-panel")) {
    createPanel()
  }

  if (checkInterval) clearInterval(checkInterval)
  checkInterval = setInterval(() => {
    const panel = document.getElementById("meetingai-panel")
    if (!panel) {
      createPanel()
    }
  }, 5000)
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init)
} else {
  setTimeout(init, 2000)
}

const observer = new MutationObserver(() => {
  if (!document.getElementById("meetingai-panel")) {
    setTimeout(createPanel, 1000)
  }
})

observer.observe(document.body, {
  childList: true,
  subtree: false
})