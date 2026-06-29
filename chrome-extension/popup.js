const APP_URL = "https://meetingai-one.vercel.app"

let meetings = []

function showNotification(msg, type = "success") {
  const el = document.getElementById("notification")
  el.textContent = (type === "success" ? "✅ " : "⚠️ ") + msg
  el.className = `notification ${type}`
  el.style.display = "block"
  setTimeout(() => { el.style.display = "none" }, 3000)
}

function formatTime(dateStr) {
  if (!dateStr) return ""
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit"
  })
}

function renderMeetings() {
  const content = document.getElementById("mainContent")
  const pending = meetings.filter(m => m.status === "pending_review")
  const approved = meetings.filter(m =>
    m.status === "approved" || m.status === "brief_sent"
  )

  let html = ""

  // Stats
  html += `
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-val">${meetings.length}</div>
        <div class="stat-label">Total</div>
      </div>
      <div class="stat-card">
        <div class="stat-val" style="color:#F59E0B">${pending.length}</div>
        <div class="stat-label">Pending</div>
      </div>
      <div class="stat-card">
        <div class="stat-val" style="color:#10B981">${approved.length}</div>
        <div class="stat-label">Approved</div>
      </div>
    </div>
  `

  if (pending.length > 0) {
    html += `<div class="section-title">Needs approval (${pending.length})</div>`
    pending.forEach(meeting => {
      html += `
        <div class="meeting-card" data-id="${meeting.id}">
          <div class="meeting-title">${meeting.title}</div>
          <div class="meeting-from">
            From: ${meeting.attendee_name || meeting.attendee_email}
            ${meeting.scheduled_at ? " · " + formatTime(meeting.scheduled_at) : ""}
          </div>
          ${meeting.brief ? `<div style="font-size:11px;color:#64748B;margin-bottom:10px;line-height:1.5">${meeting.brief.substring(0, 80)}...</div>` : ""}
          <div class="meeting-actions">
            <button class="btn-approve" onclick="approveMeeting('${meeting.id}')">
              ✓ Approve
            </button>
            <button class="btn-decline" onclick="declineMeeting('${meeting.id}')">
              ✗
            </button>
          </div>
        </div>
      `
    })
  }

  if (approved.length > 0) {
    html += `<div class="section-title" style="margin-top:${pending.length > 0 ? "12px" : "0"}">Upcoming (${approved.length})</div>`
    approved.slice(0, 2).forEach(meeting => {
      html += `
        <div class="meeting-card">
          <div class="meeting-title">${meeting.title}</div>
          <div class="meeting-from">
            ${meeting.attendee_name || meeting.attendee_email}
            ${meeting.scheduled_at ? " · " + formatTime(meeting.scheduled_at) : ""}
          </div>
          <span style="display:inline-block;background:#EEF2FF;color:#4338CA;font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px">
            Approved
          </span>
        </div>
      `
    })
  }

  if (meetings.length === 0) {
    html += `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <div class="empty-text">
          No meetings detected yet.<br/>
          Click "Scan inbox" to check your Gmail.
        </div>
      </div>
    `
  }

  content.innerHTML = html
}

async function loadMeetings() {
  try {
    const res = await fetch(`${APP_URL}/api/get-meetings`, {
      credentials: "include"
    })
    if (!res.ok) throw new Error("Not authenticated")
    const data = await res.json()
    meetings = data.meetings || []
    renderMeetings()
    document.getElementById("footer").style.display = "flex"
  } catch (error) {
    document.getElementById("mainContent").innerHTML = `
      <div class="not-logged-in">
        <div style="font-size:32px;margin-bottom:12px">🔐</div>
        <div style="font-size:14px;font-weight:600;color:#0F172A;margin-bottom:6px">
          Sign in to MeetingAI
        </div>
        <div style="font-size:12px;color:#6B7280;line-height:1.6">
          Open MeetingAI and sign in to start detecting meeting requests in your Gmail.
        </div>
        <a href="${APP_URL}/login" target="_blank" class="btn-login">
          Open MeetingAI
        </a>
      </div>
    `
  }
}

async function scanEmails() {
  const btn = document.getElementById("scanBtn")
  btn.textContent = "⏳ Scanning..."
  btn.disabled = true

  try {
    const res = await fetch(`${APP_URL}/api/scan-emails`, {
      credentials: "include"
    })
    const data = await res.json()

    if (data.error) {
      showNotification(data.error, "error")
    } else {
      showNotification(`Scanned ${data.emails?.length || 0} emails`)
      await loadMeetings()
    }
  } catch (error) {
    showNotification("Scan failed — are you logged in?", "error")
  }

  btn.textContent = "📧 Scan inbox"
  btn.disabled = false
}

window.approveMeeting = async function(meetingId) {
  try {
    const res = await fetch(`${APP_URL}/api/approve-meeting`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ meetingId })
    })
    const data = await res.json()

    if (data.conflict) {
      showNotification("Time conflict found!", "error")
    } else if (data.calendarCreated) {
      showNotification("Meeting approved + Calendar updated!")
    } else {
      showNotification(data.message || "Meeting approved!")
    }

    await loadMeetings()
  } catch (error) {
    showNotification("Failed to approve", "error")
  }
}

window.declineMeeting = async function(meetingId) {
  try {
    await fetch(`${APP_URL}/api/approve-meeting`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ meetingId, action: "decline" })
    })
    showNotification("Meeting declined")
    await loadMeetings()
  } catch (error) {
    showNotification("Failed to decline", "error")
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadMeetings()

  document.getElementById("scanBtn").addEventListener("click", scanEmails)

  document.getElementById("dashboardBtn").addEventListener("click", () => {
    chrome.tabs.create({ url: `${APP_URL}/dashboard` })
  })
})