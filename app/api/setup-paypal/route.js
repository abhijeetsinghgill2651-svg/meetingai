export async function GET() {
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

    if (!accessToken) {
      return Response.json({ 
        error: "Cannot get PayPal token",
        details: authData 
      })
    }

    // Create product
    const productResponse = await fetch(
      "https://api-m.sandbox.paypal.com/v1/catalogs/products",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          name: "MeetingAI",
          description: "AI Meeting Management Tool",
          type: "SERVICE",
          category: "SOFTWARE"
        })
      }
    )

    const productData = await productResponse.json()
    const productId = productData.id

    if (!productId) {
      return Response.json({ 
        error: "Cannot create product",
        details: productData 
      })
    }

    // Create Starter Plan
    const starterResponse = await fetch(
      "https://api-m.sandbox.paypal.com/v1/billing/plans",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          product_id: productId,
          name: "MeetingAI Starter",
          description: "AI meeting management starter plan",
          status: "ACTIVE",
          billing_cycles: [
            {
              frequency: {
                interval_unit: "MONTH",
                interval_count: 1
              },
              tenure_type: "REGULAR",
              sequence: 1,
              total_cycles: 0,
              pricing_scheme: {
                fixed_price: {
                  value: "1",
                  currency_code: "USD"
                }
              }
            }
          ],
          payment_preferences: {
            auto_bill_outstanding: true,
            setup_fee_failure_action: "CONTINUE",
            payment_failure_threshold: 3
          }
        })
      }
    )

    const starterData = await starterResponse.json()
    const starterPlanId = starterData.id

    // Create Growth Plan
    const growthResponse = await fetch(
      "https://api-m.sandbox.paypal.com/v1/billing/plans",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          product_id: productId,
          name: "MeetingAI Growth",
          description: "AI meeting management growth plan",
          status: "ACTIVE",
          billing_cycles: [
            {
              frequency: {
                interval_unit: "MONTH",
                interval_count: 1
              },
              tenure_type: "REGULAR",
              sequence: 1,
              total_cycles: 0,
              pricing_scheme: {
                fixed_price: {
                  value: "5",
                  currency_code: "USD"
                }
              }
            }
          ],
          payment_preferences: {
            auto_bill_outstanding: true,
            setup_fee_failure_action: "CONTINUE",
            payment_failure_threshold: 3
          }
        })
      }
    )

    const growthData = await growthResponse.json()
    const growthPlanId = growthData.id

    return Response.json({
      success: true,
      message: "Copy these into your .env.local file",
      product_id: productId,
      PAYPAL_STARTER_PLAN_ID: starterPlanId,
      PAYPAL_GROWTH_PLAN_ID: growthPlanId
    })

  } catch (error) {
    return Response.json({ error: error.message })
  }
}