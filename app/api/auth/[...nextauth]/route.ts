import NextAuth, { NextAuthOptions, User } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { z } from "zod"

const LoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
})

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/auth", error: "/auth" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        try {
          const parsed = LoginSchema.safeParse(credentials)
          if (!parsed.success) return null

          const { email, password } = parsed.data
          const normalizedEmail = email.toLowerCase().trim()

          const user = await prisma.users.findUnique({ where: { email: normalizedEmail } })
          if (!user) return null

          const ok = await bcrypt.compare(password, user.password_hash)
          if (!ok) return null

          // Important: do NOT block unapproved teachers here; the UI handles pending state
          return {
            id: user.id,
            email: user.email,
            name: user.name ?? undefined,
            role: user.role as any,
          }
        } catch (e) {
          console.error("authorize error", e)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = (user as any).id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.userId as string
        session.user.role = (token.role as any) || "student"
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }


