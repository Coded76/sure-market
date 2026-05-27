import Cookies from 'js-cookie'

const TOKEN_KEY = 'sm_token'
const USER_KEY = 'sm_user'

export function setToken(token: string) {
  Cookies.set(TOKEN_KEY, token, { expires: 7, secure: true, sameSite: 'strict' })
}

export function getToken(): string | undefined {
  return Cookies.get(TOKEN_KEY)
}

export function removeToken() {
  Cookies.remove(TOKEN_KEY)
  Cookies.remove(USER_KEY)
}

export function setUser(user: object) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getUser<T = unknown>(): T | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export function clearAuth() {
  removeToken()
  if (typeof window !== 'undefined') localStorage.removeItem(USER_KEY)
}

export function isAuthenticated(): boolean {
  return !!getToken()
}
