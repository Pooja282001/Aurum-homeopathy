const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export const isApiConfigured = Boolean(API_BASE_URL)

export async function apiRequest(action, options = {}) {
  if (!isApiConfigured) return null
  const response = await fetch(`${API_BASE_URL}?action=${encodeURIComponent(action)}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
    body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body,
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.error || 'The server request failed.')
  return payload
}
