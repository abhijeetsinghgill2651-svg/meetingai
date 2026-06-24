"use client"
import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function Settings() {
  const { data: session, status } = useSession()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [preferences, setPreferences] = useState({
    working_hours_start: "09:00",
    working_hours_end: "18:00",
    timezone: "America/New_York"
  })

  useEffect(() => {
    if (session) {
      loadPreferences()
    }
  }, [session])

  const loadPreferences = async () => {
    const res = await fetch("/api/get-preferences")
    const data = await res.json()
    if (data.preferences) {
      setPreferences(data.preferences)
    }
  }

  const savePreferences = async () => {
    setSaving(true)
    await fetch("/api/save-preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preferences)
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (status === "loading") {
    return <div className="p-10">Loading...</div>
  }

  if (!session) {
    return <div className="p-10">Please log in first.</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">

        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/dashboard" className="text-sm text-indigo-600 hover:underline">
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">Settings</h1>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Sign out
          </button>
        </div>

        {/* Profile */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Profile</h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg">
              {session.user.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-900">{session.user.name}</p>
              <p className="text-sm text-gray-500">{session.user.email}</p>
            </div>
          </div>
        </div>

        {/* Working Hours */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Working Hours</h2>
          <p className="text-sm text-gray-500 mb-4">
            MeetingAI will only suggest meeting times within these hours
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={preferences.working_hours_start}
                onChange={(e) => setPreferences({
                  ...preferences,
                  working_hours_start: e.target.value
                })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                End Time
              </label>
              <input
                type="time"
                value={preferences.working_hours_end}
                onChange={(e) => setPreferences({
                  ...preferences,
                  working_hours_end: e.target.value
                })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Timezone */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Timezone</h2>
          <select
            value={preferences.timezone}
            onChange={(e) => setPreferences({
              ...preferences,
              timezone: e.target.value
            })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="America/New_York">Eastern Time (US)</option>
            <option value="America/Chicago">Central Time (US)</option>
            <option value="America/Denver">Mountain Time (US)</option>
            <option value="America/Los_Angeles">Pacific Time (US)</option>
            <option value="America/Toronto">Toronto (Canada)</option>
            <option value="America/Vancouver">Vancouver (Canada)</option>
            <option value="Europe/London">London (UK)</option>
            <option value="Europe/Paris">Paris (Europe)</option>
            <option value="Australia/Sydney">Sydney (Australia)</option>
            <option value="Australia/Melbourne">Melbourne (Australia)</option>
            <option value="Asia/Kolkata">India (IST)</option>
            <option value="Asia/Dubai">Dubai (UAE)</option>
            <option value="Asia/Singapore">Singapore</option>
            <option value="Asia/Tokyo">Tokyo (Japan)</option>
          </select>
        </div>

        {/* Subscription */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Subscription</h2>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-900">Free Trial</p>
              <p className="text-xs text-gray-500">14 days remaining</p>
            </div>
            <Link href="/pricing" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
              Upgrade Plan
            </Link>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6 border border-red-100">
          <h2 className="font-semibold text-red-600 mb-4">Danger Zone</h2>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Disconnect Google Account
              </p>
              <p className="text-xs text-gray-500">
                Removes all access to your Gmail and Calendar
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="border border-red-300 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50"
            >
              Disconnect
            </button>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={savePreferences}
          disabled={saving}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : saved ? "Saved! ✓" : "Save Settings"}
        </button>

      </div>
    </div>
  )
}