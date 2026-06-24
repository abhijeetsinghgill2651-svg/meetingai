import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export const authOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/calendar",
          access_type: "offline",
          prompt: "consent"
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.access_token = account.access_token
        token.refresh_token = account.refresh_token
        token.expires_at = account.expires_at
        token.email = user?.email
      }

      if (Date.now() < (token.expires_at * 1000) - 60000) {
        return token
      }

      try {
        const response = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            grant_type: "refresh_token",
            refresh_token: token.refresh_token
          })
        })

        const refreshed = await response.json()

        if (!response.ok) throw refreshed

        await supabase
          .from("users")
          .update({ google_access_token: refreshed.access_token })
          .eq("email", token.email)

        return {
          ...token,
          access_token: refreshed.access_token,
          expires_at: Math.floor(Date.now() / 1000 + refreshed.expires_in)
        }
      } catch (error) {
        console.error("Token refresh error:", error)
        return { ...token, error: "RefreshTokenError" }
      }
    },

    async session({ session, token }) {
      session.user.id = token.sub
      session.error = token.error
      return session
    },

    async signIn({ user, account }) {
      try {
        const { data: existingUser } = await supabase
          .from("users")
          .select("*")
          .eq("email", user.email)
          .single()

        if (!existingUser) {
          await supabase.from("users").insert({
            email: user.email,
            name: user.name,
            avatar_url: user.image,
            google_access_token: account.access_token,
            google_refresh_token: account.refresh_token,
            plan: "trial",
            trial_ends_at: new Date(
              Date.now() + 14 * 24 * 60 * 60 * 1000
            ).toISOString()
          })
        } else {
          await supabase
            .from("users")
            .update({
              google_access_token: account.access_token,
              google_refresh_token: account.refresh_token
            })
            .eq("email", user.email)
        }
        return true
      } catch (error) {
        console.error("Sign in error:", error)
        return false
      }
    }
  },
  pages: {
    signIn: "/login"
  },
  secret: process.env.NEXTAUTH_SECRET
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }