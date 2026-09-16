const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export const isApiConfigured = Boolean(API_BASE_URL)

export async function apiRequest(action, options = {}) {
  if (!isApiConfigured) return null
  
  // Build the URL based on whether we're using Node.js or PHP backend
  let url
  if (API_BASE_URL.includes('localhost')) {
    // Node.js backend: use direct routes like /appointments
    url = `${API_BASE_URL}/${action}`
  } else {
    // PHP backend: use query parameters like ?action=appointments
    url = `${API_BASE_URL}?action=${encodeURIComponent(action)}`
  }
  
  console.log('📡 API Request:', { url, method: options.method || 'GET', body: options.body })
  
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
    body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body,
  })
  
  console.log('📡 API Response:', { status: response.status, ok: response.ok })
  
  const payload = await response.json().catch(() => ({}))
  
  console.log('📡 API Payload:', payload)
  
  if (!response.ok) throw new Error(payload.error || 'The server request failed.')
  return payload
}
