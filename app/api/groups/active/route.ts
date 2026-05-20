import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { ACTIVE_GROUP_COOKIE } from "@/lib/active-group"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { groupId } = await request.json()
  const value = groupId ?? "personal"

  const res = NextResponse.json({ ok: true })
  res.cookies.set(ACTIVE_GROUP_COOKIE, value, {
    path: "/",
    httpOnly: false, // needs to be readable client-side for optimistic updates
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  })
  return res
}
