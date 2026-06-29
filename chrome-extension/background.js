const APP_URL = "http://localhost:3000"

chrome.runtime.onInstalled.addListener(() => {
  console.log("MeetingAI extension installed")

  chrome.alarms.create("checkMeetings", {
    periodInMinutes: 30
  })
})

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "checkMeetings") {
    try {
      const res = await fetch(`${APP_URL}/api/get-meetings`, {
        credentials: "include"
      })

      if (!res.ok) return

      const data = await res.json()
      const pending = (data.meetings || []).filter(
        m => m.status === "pending_review"
      )

      if (pending.length > 0) {
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icons/icon48.png",
          title: "MeetingAI",
          message: `You have ${pending.length} meeting request${pending.length > 1 ? "s" : ""} waiting for approval`,
          priority: 1
        })
      }
    } catch (e) {
      console.log("Background check failed:", e.message)
    }
  }
})

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: `${APP_URL}/dashboard` })
})