import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return Response.json({ error: "Not logged in" }, { status: 401 })
  }

  const { plan } = await request.json()

  try {
    const authResponse = await fetch(
      "https://api-m.sandbox.paypal.com/v1/oauth2/token",
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

    const authData = await authResponse.json()
    const accessToken = authData.access_token

    const amount = plan === "starter" ? "1.00" : "5.00"
    const planName = plan === "starter" ? "MeetingAI Starter" : "MeetingAI Growth"

    const orderResponse = await fetch(
      "https://api-m.sandbox.paypal.com/v2/checkout/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [{
            amount: {
              currency_code: "USD",
              value: amount
            },
            description: planName
          }],
          application_context: {
            return_url: `${process.env.NEXTAUTH_URL}/payment-success`,
            cancel_url: `${process.env.NEXTAUTH_URL}/pricing`
          }
        })
      }
    )

    const orderData = await orderResponse.json()
    const approvalUrl = orderData.links?.find(l => l.rel === "approve")?.href

    return Response.json({ 
      success: true, 
      approvalUrl,
      orderId: orderData.id
    })

  } catch (error) {
    console.error("PayPal error:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}