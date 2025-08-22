import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/auth/student",
  },
})

export const config = {
  matcher: [
    "/teacher/:path*",
    "/admin/:path*",
  ],
}


