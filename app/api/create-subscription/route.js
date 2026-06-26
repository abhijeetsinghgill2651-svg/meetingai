import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function getPayPalToken() {
  const response = await fetch(
    process.env.PAYPAL_MODE === "live"
      ? "https://api-m.paypal.com/v1/oauth2/token"
      : "https://api-m.sandbox.paypal.com/v1/oauth2/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${Buffer.from(
          `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
        ).toString("base64")}`
      },
      body: "grant_type=client_credentials"
    }
  )
  const data = await response.json()
  return data.access_token
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return Response.json({ error: "Not logged in" }, { status: 401 })
  }

  const { plan } = await request.json()
  const baseUrl = process.env.NEXTAUTH_URL

  try {
    const accessToken = await getPayPalToken()

    const planId = plan === "starter"
      ? process.env.PAYPAL_STARTER_PLAN_ID
      : process.env.PAYPAL_GROWTH_PLAN_ID

    const response = await fetch(
      process.env.PAYPAL_MODE === "live"
        ? "https://api-m.paypal.com/v1/billing/subscriptions"
        : "https://api-m.sandbox.paypal.com/v1/billing/subscriptions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          plan_id: planId,
          subscriber: {
            email_address: session.user.email,
            name: {
              given_name: session.user.name?.split(" ")[0] || "User",
              surname: session.user.name?.split(" ")[1] || ""
            }
          },
          application_context: {
            brand_name: "MeetingAI",
            locale: "en-US",
            shipping_preference: "NO_SHIPPING",
            user_action: "SUBSCRIBE_NOW",
            return_url: `${baseUrl}/payment-success?plan=${plan}`,
            cancel_url: `${baseUrl}/pricing`
          }
        })
      }
    )

    const data = await response.json()
    const approvalUrl = data.links?.find(l => l.rel === "approve")?.href

    if (!approvalUrl) {
      console.error("PayPal response:", data)
      return Response.json({ 
        error: "Could not create subscription. Please try again." 
      }, { status: 500 })
    }

    return Response.json({ 
      success: true, 
      approvalUrl,
      subscriptionId: data.id
    })

  } catch (error) {
    console.error("PayPal subscription error:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}