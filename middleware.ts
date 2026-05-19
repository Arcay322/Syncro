import { auth } from "@/auth"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const isOnLoginPage = nextUrl.pathname.startsWith("/login")
  const isOnApiAuth = nextUrl.pathname.startsWith("/api/auth")
  const isPublicFile = nextUrl.pathname.match(/\.(svg|png|jpg|jpeg|gif|ico|woff|woff2|ttf|eot)$/)

  if (isOnApiAuth || isPublicFile) {
    return
  }

  if (isOnLoginPage) {
    if (isLoggedIn) {
      return Response.redirect(new URL("/", nextUrl))
    }
    return
  }

  if (!isLoggedIn) {
    return Response.redirect(new URL("/login", nextUrl))
  }

  return
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|ico)$).*)"],
}
