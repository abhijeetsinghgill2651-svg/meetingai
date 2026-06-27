import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function refreshAccessToken(token) {
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken
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
      accessToken: refreshed.access_token,
      accessTokenExpires: Date.now() + refreshed.expires_in * 1000,
      refreshToken: refreshed.refresh_token ?? token.refreshToken
    }
  } catch (error) {
    console.error("Refresh token error:", error)
    return { ...token, error: "RefreshAccessTokenError" }
  }
}

export const authOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60
  },
  jwt: {
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
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at * 1000,
          email: user.email,
          name: user.name,
          picture: user.image
        }
      }

      if (Date.now() < token.accessTokenExpires - 60000) {
        return token
      }

      return refreshAccessToken(token)
    },

    async session({ session, token }) {
      session.user.accessToken = token.accessToken
      session.user.email = token.email
      session.user.name = token.name
      session.user.image = token.picture
      session.error = token.error
      return session
    },

    async signIn({ user, account }) {
      try {
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
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
              google_refresh_token: account.refresh_token,
              name: user.name
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