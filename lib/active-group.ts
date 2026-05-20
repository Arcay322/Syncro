/**
 * Helper to read/write the active group cookie from server-side code.
 * Cookie name: syncro_active_group
 * Value: a groupId string, or "personal" for the personal library.
 */

export const ACTIVE_GROUP_COOKIE = "syncro_active_group"

/**
 * Read the active group id from Next.js cookies() (server component).
 * Returns null for personal library or if no cookie set.
 */
export async function getActiveGroupId(): Promise<string | null> {
  const { cookies } = await import("next/headers")
  const store = await cookies()
  const value = store.get(ACTIVE_GROUP_COOKIE)?.value
  if (!value || value === "personal") return null
  return value
}
