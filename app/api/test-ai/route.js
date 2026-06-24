import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function GET() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" })
    const result = await model.generateContent("Say hello in one word")
    const text = result.response.text()
    return Response.json({ success: true, response: text })
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message,
      status: error.status 
    })
  }
}