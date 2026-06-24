"use client"
import { signIn } from "next-auth/react"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md text-center">
        
        <h1 className="text-3xl font-bold text-indigo-600">
          MeetingAI
        </h1>
        <p className="text-gray-500 mt-2 text-sm">
          Your AI meeting management assistant
        </p>

        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full mt-8 flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-xl py-3 px-6 text-gray-700 font-medium hover:border-indigo-400"
        >
          Continue with Google
        </button>

        <p className="text-xs text-gray-400 mt-6">
          14 day free trial — no credit card required
        </p>

      </div>
    </div>
  )
}