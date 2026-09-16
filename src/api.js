const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

let API_BASE_URL = VITE_API_BASE_URL
let USE_PHP_BACKEND = true
let API_VERIFIED = false

export const isApiConfigured = Boolean(VITE_API_BASE_URL || VITE_BACKEND_URL)

// Verify if PHP API is available, fall back to Node.js if not
async function verifyApiBackend() {
  if (API_VERIFIED) return

  // Try 1: PHP API at /api/index.php (folder structure)
  try {
    if (VITE_API_BASE_URL && !VITE_API_BASE_URL.includes('localhost')) {
      const response = await fetch(`${VITE_API_BASE_URL}?action=health`, { 
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      })
      if (response.ok) {
        API_BASE_URL = VITE_API_BASE_URL
        USE_PHP_BACKEND = true
        API_VERIFIED = true
        console.log('✅ PHP API verified at:', VITE_API_BASE_URL)
        return
      }
    }
  } catch (error) {
    console.warn('⚠️  PHP API at /api/index.php unavailable')
  }

  // Try 2: PHP unified API at /api.php (root fallback)
  try {
    const domain = window.location.origin
    const apiUrl = `${domain}/api.php`
    const response = await fetch(`${apiUrl}?action=health`, {
      signal: AbortSignal.timeout(3000)
    })
    if (response.ok) {
      API_BASE_URL = apiUrl
      USE_PHP_BACKEND = true
      API_VERIFIED = true
      console.log('✅ PHP API verified at:', apiUrl)
      return
    }
  } catch (error) {
    console.warn('⚠️  PHP API at /api.php unavailable:', error.message)
  }

  // Try 3: Node.js backend fallback
  try {
    const response = await fetch(`${VITE_BACKEND_URL}/system-status`, {
      signal: AbortSignal.timeout(3000)
    })
    if (response.ok) {
      API_BASE_URL = VITE_BACKEND_URL
      USE_PHP_BACKEND = false
      API_VERIFIED = true
      console.log('✅ Node.js API verified at:', VITE_BACKEND_URL)
      return
    }
  } catch (error) {
    console.error('❌ Node.js API unavailable:', error.message)
  }

  API_VERIFIED = true
}

export async function apiRequest(action, options = {}) {
  if (!isApiConfigured) return null

  // Verify backend on first call
  if (!API_VERIFIED) {
    await verifyApiBackend()
  }

  // Build the URL based on backend type
  let url
  if (USE_PHP_BACKEND) {
    // PHP backend: use query parameters like ?action=appointments
    url = `${API_BASE_URL}?action=${encodeURIComponent(action)}`
  } else {
    // Node.js backend: use direct routes like /appointments
    url = `${API_BASE_URL}/${action}`
  }

  console.log('📡 API Request:', { url, method: options.method || 'GET', backend: USE_PHP_BACKEND ? 'PHP' : 'Node.js', body: options.body })

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
