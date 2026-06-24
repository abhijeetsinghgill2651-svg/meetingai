import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
})

export async function sendEmail({ to, subject, body }) {
  try {
    await transporter.sendMail({
      from: `"MeetingAI" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html: body
    })
    console.log("Email sent to:", to)
    return { success: true }
  } catch (error) {
    console.error("Email send error:", error)
    return { success: false, error: error.message }
  }
}