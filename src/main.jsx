import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { apiRequest, isApiConfigured } from './api'
import './styles.css'
import './styles-dashboard.css'
import './styles-super-admin.css'

const GOOGLE_REVIEWS_URL = 'https://maps.app.goo.gl/FbuvhHwrtZFqLMwH7'

const services = [
  { icon: '◌', title: 'Skin & Hair Care', copy: 'Gentle, natural treatment for Eczema, Psoriasis, Acne, and Hair Loss in Pimple Saudagar.' },
  { icon: '⌁', title: 'Chronic Disorders', copy: 'Root-cause relief for Thyroid Imbalance, Joint Pain, Arthritis, and Chronic Migraines.' },
  { icon: '✦', title: 'Women & Child Care', copy: 'Targeted homeopathic solutions for PCOS/PCOD, Menstrual Health, and Pediatric Immunity.' },
]

const navItems = ['Home', 'About Us', 'Services', 'Get Appointment', 'Contact Us']
const APPOINTMENTS_KEY = 'shelkes-aurum-appointments'
const STAFF_SESSION_KEY = 'shelkes-aurum-staff-user'
const SYSTEM_STATUS_KEY = 'shelkes-aurum-system-status'
const clinicTimeSlots = [
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM'
]
const STAFF_USERS = {
  doctor: { username: 'doctor', password: 'doctor123', role: 'doctor' },
  admin: { username: 'admin', password: 'admin123', role: 'super_admin' },
}

// Get dynamic API base URL - uses PHP backend on Hostinger
function getApiBaseUrl() {
  const hostname = window.location.hostname
  const protocol = window.location.protocol
  
  console.log('🔍 [getApiBaseUrl] Hostname:', hostname, 'Protocol:', protocol)
  
  // For localhost development - use production backend for testing
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const url = 'https://aurumhomeopathy.com/backend.php'
    console.log('✅ [getApiBaseUrl] Using production backend for local test:', url)
    return url
  }
  
  // For production on aurumhomeopathy.com
  if (hostname === 'aurumhomeopathy.com' || hostname === 'www.aurumhomeopathy.com') {
    const url = `${protocol}//${hostname}/backend.php`
    console.log('✅ [getApiBaseUrl] Using production PHP backend:', url)
    return url
  }
  
  // For other hostnames (mobile/tablet on same network)
  const url = `${protocol}//${hostname}/backend.php`
  console.log('✅ [getApiBaseUrl] Using PHP backend:', url)
  return url
}

function getSystemStatusDefault() {
  return { isOnline: true, maintenanceMode: false, comment: '' }
}

function getAppointments() {
  try {
    return JSON.parse(localStorage.getItem(APPOINTMENTS_KEY)) || []
  } catch {
    return []
  }
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(STAFF_SESSION_KEY)) || null
  } catch {
    return null
  }
}

function App() {
  const [currentUser, setCurrentUser] = useState(getStoredUser)
  const [screen, setScreen] = useState(currentUser ? 'Staff Dashboard' : 'Home')
  const [submitted, setSubmitted] = useState(false)
  const [appointments, setAppointments] = useState(getAppointments)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showAppointmentPopup, setShowAppointmentPopup] = useState(false)
  const [systemStatus, setSystemStatus] = useState(getSystemStatusDefault)
  const appointmentRedirectTimerRef = useRef(null)

  const goTo = (nextScreen) => {
    setSubmitted(false)
    setScreen(nextScreen)
    setMobileMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const triggerAppointmentPopup = () => {
    if (appointmentRedirectTimerRef.current) {
      window.clearTimeout(appointmentRedirectTimerRef.current)
    }

    setShowAppointmentPopup(true)
    appointmentRedirectTimerRef.current = window.setTimeout(() => {
      setShowAppointmentPopup(false)
      goTo('Get Appointment')
    }, 1500)
  }

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STAFF_SESSION_KEY, JSON.stringify(currentUser))
    } else {
      localStorage.removeItem(STAFF_SESSION_KEY)
    }
  }, [currentUser])

  useEffect(() => {
    if (!currentUser) return
    // Direct database query to backend
    fetch(getApiBaseUrl() + '?action=appointments')
      .then((response) => response.ok ? response.json() : Promise.reject('Failed'))
      .then((result) => setAppointments(result.appointments || result || []))
      .catch(() => console.warn('⚠️ Could not fetch appointments'))
  }, [currentUser])

  useEffect(() => {
    return () => {
      if (appointmentRedirectTimerRef.current) {
        window.clearTimeout(appointmentRedirectTimerRef.current)
      }
    }
  }, [])

  // Fetch system status directly from backend database on mount
  useEffect(() => {
    const fetchSystemStatus = async () => {
      try {
        // Direct query to Node.js backend endpoint (uses direct database queries)
        const response = await fetch(getApiBaseUrl() + '?action=system-status')
        if (!response.ok) throw new Error('Failed to fetch system status')
        const result = await response.json()
        setSystemStatus(result)
      } catch (error) {
        console.warn('⚠️ System status fetch failed, using default:', error.message)
        // Use default (system online) if backend is down
        setSystemStatus(getSystemStatusDefault())
      }
    }
    
    fetchSystemStatus()
  }, [])

  const saveAppointments = (nextAppointments) => {
    setAppointments(nextAppointments)
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(nextAppointments))
  }

  const addAppointment = async (details) => {
    try {
      // Convert field names to backend format
      const appointmentData = {
        name: details.name,
        phone: details.phone,
        email: details.email,
        date: details.date,
        time_slot: details.timeSlot, // Convert timeSlot to time_slot
        service: details.service || 'General consultation',
        status: 'New'
      }
      
      // Direct backend database query
      try {
        const response = await fetch(getApiBaseUrl() + '?action=appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(appointmentData)
        })
        if (response.ok) {
          const result = await response.json()
          console.log('✅ Backend Response:', result)
        }
      } catch (error) {
        console.warn('⚠️ Backend save failed, saving locally only:', error.message)
      }
      
      // Also save locally for offline support
      const appointment = { ...appointmentData, id: Date.now(), createdAt: new Date().toISOString() }
      saveAppointments([appointment, ...appointments])
      setSubmitted(true)
      return true
    } catch (error) {
      console.error('❌ Appointment Error:', error)
      alert('Error booking appointment: ' + error.message)
      return false
    }
  }

  const login = async (username, password) => {
    console.log('🔐 [LOGIN] Attempting login with username:', username)
    
    // Always try backend first (direct database queries)
    try {
      const apiUrl = getApiBaseUrl() + '?action=login'
      console.log('📤 [LOGIN] Sending POST request to:', apiUrl)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      console.log('📥 [LOGIN] Response status:', response.status, response.statusText)
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ [LOGIN] Login successful! User:', result.user)
        setCurrentUser(result.user)
        localStorage.setItem(STAFF_SESSION_KEY, JSON.stringify(result.user))
        localStorage.setItem('backendAvailable', 'true')
        console.log('💾 [LOGIN] User saved to localStorage')
        goTo('Staff Dashboard')
        return true
      } else {
        const errorText = await response.text()
        console.warn('❌ [LOGIN] Response not OK. Status:', response.status, 'Body:', errorText)
      }
    } catch (err) {
      console.error('❌ [LOGIN] Backend error:', err.message, err.stack)
      console.warn('⚠️ [LOGIN] Backend unavailable, using local demo users')
      localStorage.setItem('backendAvailable', 'false')
    }
    
    // Fallback to local demo users when backend unavailable
    console.log('🔄 [LOGIN] Trying local demo users...')
    const user = Object.values(STAFF_USERS).find((candidate) => candidate.username === username && candidate.password === password)
    if (!user) {
      console.error('❌ [LOGIN] Invalid credentials - user not found')
      alert('❌ Invalid credentials.\n\nTry demo credentials:\nUsername: demo\nPassword: demo123\n\nOr:\nUsername: admin\nPassword: admin123')
      return false
    }
    console.log('✅ [LOGIN] Using demo user:', user)
    setCurrentUser(user)
    localStorage.setItem(STAFF_SESSION_KEY, JSON.stringify(user))
    localStorage.setItem('backendAvailable', 'false')
    goTo('Staff Dashboard')
    return true
  }

  const updateSystemStatus = (updates) => {
    if (!currentUser) return
    
    const newStatus = { ...systemStatus, ...updates }
    
    // Direct database query to backend endpoint
    fetch(getApiBaseUrl() + '?action=system-status', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isOnline: newStatus.isOnline,
        maintenanceMode: newStatus.maintenanceMode,
        comment: newStatus.comment || '',
        userId: currentUser.id
      })
    }).then((response) => {
      if (response.ok) {
        setSystemStatus(newStatus)
      } else {
        console.error('Failed to update system status')
      }
    }).catch((error) => {
      console.error('❌ Error updating system status:', error.message)
    })
  }

  return (
    <div className="app-shell">
      <div className="galaxy-bg" aria-hidden="true">
        <span className="star star-1" />
        <span className="star star-2" />
        <span className="star star-3" />
        <span className="star star-4" />
        <span className="star star-5" />
      </div>

      {(!systemStatus.isOnline || systemStatus.maintenanceMode) && (!currentUser || currentUser.role !== 'super_admin') && screen !== 'Staff Login' ? (
        <OfflineScreen systemStatus={systemStatus} goTo={goTo} />
      ) : (
        <>
      <header className="topbar">
        <button className="brand" onClick={() => goTo('Home')} aria-label="Go to home">
          <img className="brand-logo" src="/assets/aurum-logo-transparent.png" alt="Dr. Shelke's Aurum Homeopathy" />
        </button>

        <nav className="desktop-nav" aria-label="Main navigation">
          {navItems.map((item) => <button className={screen === item ? 'active' : ''} onClick={() => goTo(item)} key={item}>{item}</button>)}
        </nav>

        <div className="header-actions">
          <button className="staff-link" onClick={() => currentUser ? goTo('Staff Dashboard') : goTo('Staff Login')}>{currentUser ? currentUser.role : 'Staff Login'}</button>
          <button className="header-cta" onClick={triggerAppointmentPopup}>Book Appointment <span>↗</span></button>
        </div>

        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </header>

      <nav className="mobile-quick-links" aria-label="Quick mobile navigation">
        <button className={screen === 'Home' ? 'active' : ''} onClick={() => goTo('Home')}>Home</button>
        <button className={screen === 'About Us' ? 'active' : ''} onClick={() => goTo('About Us')}>About Us</button>
        <button className={screen === 'Services' ? 'active' : ''} onClick={() => goTo('Services')}>Services</button>
        <button className={screen === 'Get Appointment' ? 'active' : ''} onClick={() => goTo('Get Appointment')}>Appointment</button>
        <button className={screen === 'Contact Us' ? 'active' : ''} onClick={() => goTo('Contact Us')}>Contact</button>
      </nav>

      {mobileMenuOpen && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          <button className={screen === 'Home' ? 'active' : ''} onClick={() => goTo('Home')}>Home</button>
          <button className={screen === 'About Us' ? 'active' : ''} onClick={() => goTo('About Us')}>About Us</button>
          <button className={screen === 'Services' ? 'active' : ''} onClick={() => goTo('Services')}>Services</button>
          <button className={screen === 'Get Appointment' ? 'active' : ''} onClick={() => goTo('Get Appointment')}>Get Appointment</button>
          <button className={screen === 'Contact Us' ? 'active' : ''} onClick={() => goTo('Contact Us')}>Contact Us</button>
          <button className="mobile-staff-link" onClick={() => currentUser ? goTo('Staff Dashboard') : goTo('Staff Login')}>
            {currentUser ? currentUser.role : 'Staff Login'}
          </button>
          <button className="mobile-cta" onClick={triggerAppointmentPopup}>Book Appointment <span>↗</span></button>
        </nav>
      )}

      {showAppointmentPopup && (
        <div className="appointment-popup-backdrop" aria-modal="true" role="dialog">
          <div className="appointment-popup-modal">
            <img className="appointment-popup-image" src="/assets/doctor-popup.svg.jfif" alt="Doctor illustration" />
            <p className="appointment-popup-text">Redirecting you to schedule your consultation...</p>
          </div>
        </div>
      )}

      {!localStorage.getItem('backendAvailable') && currentUser && (
        <div style={{backgroundColor: '#fff3cd', color: '#856404', padding: '12px 20px', margin: '10px 20px', borderRadius: '6px', border: '1px solid #ffeaa7', textAlign: 'center', fontSize: '14px'}}>
          ⚠️ <strong>Demo Mode:</strong> Backend server is currently unavailable. Using local demo data. Contact administrator if this persists.
        </div>
      )}

      <main>
        {screen === 'Home' && <Home goTo={goTo} triggerAppointmentPopup={triggerAppointmentPopup} />}
        {screen === 'About Us' && <About goTo={goTo} />}
        {screen === 'Services' && <Services goTo={goTo} triggerAppointmentPopup={triggerAppointmentPopup} />}
        {screen === 'Get Appointment' && <Appointment submitted={submitted} setSubmitted={setSubmitted} addAppointment={addAppointment} />}
        {screen === 'Contact Us' && <Contact />}
        {screen === 'Staff Login' && <StaffLogin login={login} />}
        {screen === 'Staff Dashboard' && currentUser && currentUser.role === 'super_admin' && <SuperAdminDashboard user={currentUser} appointments={appointments} saveAppointments={saveAppointments} apiEnabled={isApiConfigured} logout={() => { setCurrentUser(null); localStorage.removeItem(STAFF_SESSION_KEY); goTo('Home') }} goTo={goTo} updateSystemStatus={updateSystemStatus} systemStatus={systemStatus} />}
        {screen === 'Staff Dashboard' && currentUser && currentUser.role !== 'super_admin' && <StaffDashboard user={currentUser} appointments={appointments} saveAppointments={saveAppointments} apiEnabled={isApiConfigured} logout={() => { setCurrentUser(null); localStorage.removeItem(STAFF_SESSION_KEY); goTo('Home') }} goTo={goTo} />}
        {screen === 'Create User' && currentUser && (currentUser.role === 'super_admin' || currentUser.role === 'admin') && <CreateUser goTo={goTo} />}
        {screen === 'Manage Users' && currentUser && currentUser.role === 'super_admin' && <ManageUsers users={appointments} goTo={goTo} apiEnabled={isApiConfigured} />}
      </main>
        </>
      )}

      <footer><span>© 2026 Dr. Shelke's Aurum Homeopathic Clinic</span><span>Holistic & Safe Homeopathic Care in Pimple Saudagar, Pune</span><a href="#contact" onClick={(event) => { event.preventDefault(); goTo('Contact Us'); window.location.hash = '#contact'; }}>Find our clinic ↗</a></footer>
    </div>
  )
}

function Home({ goTo, triggerAppointmentPopup }) {
  return <>
    <Reveal className="hero page-width">
      <div className="hero-copy">
        <p className="eyebrow"><span className="pulse-dot" /> Trusted by 2000+ families</p>
        <h1><span className="hero-word-black">Welcome to</span><br /><span className="hero-word-red">Dr. Shelke's Aurum</span><br /><span className="hero-word-black">Homeopathic Clinic</span></h1>
        <p className="hero-text">Holistic Homeopathic Care for Long-Term Healing</p>
        <p className="subheadline">Individualized care tailored to your unique health story. Experience safe, natural, and effective holistic treatment.</p>
        <div className="hero-actions"><button className="primary-btn" onClick={triggerAppointmentPopup}>Book an appointment <span>↗</span></button><a className="hero-call-btn" href="tel:+919145692117">Call 9145692117 <span>↗</span></a><button className="secondary-btn text-btn" onClick={() => goTo('Services')}>Explore services <span>→</span></button></div>
        <div className="trust-row"><div className="avatars"><span>R</span><span>M</span><span>S</span></div><p><strong>4.9/5</strong> from 2,000+ patient visits</p></div>
      </div>
      <div className="hero-art">
        <div className="hero-photo" />
        <div className="floating-note"><span className="check">✓</span><div><strong>100% Natural &amp; Safe Remedies</strong></div></div>
        <div className="doctor-signature">Dr. Jayesh Shelke</div>
      </div>
    </Reveal>

    <section className="trust-strip" aria-label="Clinic trust highlights">
      <div className="page-width trust-grid">
        <div className="trust-item"><strong>6+ Years</strong><span>Clinical Experience</span></div>
        <div className="trust-item"><strong>2,000+</strong><span>Satisfied Patients</span></div>
        <div className="trust-item"><strong>100% Safe</strong><span>Individualized Remedies</span></div>
        <div className="trust-item"><strong>In-Clinic</strong><span>Consultations Available</span></div>
      </div>
    </section>

    <Reveal className="intro-band"><div className="page-width intro-grid"><p className="section-kicker">01 / COMPASSIONATE CARE IN Pimple saidagar</p><div><h2>Healthcare that starts with <em>listening.</em></h2><p className="muted">From your initial detailed case-taking to your personalized remedy plan, every step is tailored around your complete health story to treat the root cause naturally.</p><button className="text-btn" onClick={() => goTo('About Us')}>Our story <span>→</span></button></div></div></Reveal>
    <Reveal className="home-story page-width">
      <div className="story-copy"><p className="section-kicker">02 / A calmer kind of care</p><h2>People first.<br /><em>Always.</em></h2><p className="muted">Experience compassionate medical care where every concern is heard, every detail of your health history is valued, and every remedy is chosen for lasting relief.</p><button className="text-btn" onClick={() => goTo('About Us')}>Meet Dr. Jayesh <span>→</span></button></div>
      <div className="story-photo story-photo-main" /><div className="story-photo story-photo-detail" />
    </Reveal>
    <Reveal className="service-preview page-width"><div className="section-heading"><div><p className="section-kicker">03 / OUR SPECIALIZATION IN Pimple saudagar </p><h2>Root-Cause Homeopathic Treatments</h2></div><button className="round-arrow" onClick={() => goTo('Services')}>↗</button></div><div className="service-grid">{services.map((service) => <article className="service-card" key={service.title}><span className="service-icon">{service.icon}</span><h3>{service.title}</h3><p>{service.copy}</p><span className="card-arrow">↗</span></article>)}</div></Reveal>

    <section className="google-reviews-section page-width" aria-labelledby="google-reviews-heading">
      <div className="google-reviews-shell">
        <div className="google-reviews-header">
          <div>
            <h2 id="google-reviews-heading">What Our Patients Say</h2>
          </div>
          <a className="google-rating-inline" href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" aria-label="4.9 Google Rating - open Google Maps reviews">
            <span className="google-star">★</span>
            <span className="google-rating-value">4.9</span>
            <span className="google-rating-label">Google Rating</span>
          </a>
        </div>
        <p className="google-reviews-support">Trusted by our patients for personalised homeopathic care.</p>

        <div className="google-review-grid">
          <a className="google-review-card" href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" aria-label="Read review by Krushna Kathar on Google Maps">
            <div className="google-review-stars">★★★★★</div>
            <h3>Krushna Kathar</h3>
            <p>...hai aur Sinusitis ki problem bhi lagbhag khatam ho chuki hai. Dr. Shelke bahut hi calm, patient aur knowledgeable hain. Allergic conditions aur homeopathy ke liye Pimple Saudagar mein ye best clinic hai. Highly re...</p>
            <span className="google-review-link">Read full review on Google →</span>
          </a>

          <a className="google-review-card" href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" aria-label="Read review by Aryan Giri on Google Maps">
            <div className="google-review-stars">★★★★★</div>
            <h3>Aryan Giri</h3>
            <p>Dr. Shelke’s Aurum Homeopathy is an excellent clinic for chronic health issues. The doctor is knowledgeable, listens carefully, and provides effective natural treatments. Patients often see good improvement,...</p>
            <span className="google-review-link">Read full review on Google →</span>
          </a>

          <a className="google-review-card" href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" aria-label="Read review by Vishal Yamgar on Google Maps">
            <div className="google-review-stars">★★★★★</div>
            <h3>Vishal Yamgar</h3>
            <p>Very good experience with dr jayesh very knowledgeable doctor I consult him for my acidity indigestion issues continue antacid lena padta tha now having much re...</p>
            <span className="google-review-link">Read full review on Google →</span>
          </a>
        </div>

        <div className="google-reviews-cta-wrap">
          <a className="google-reviews-cta" href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer">Read More Reviews on Google →</a>
        </div>
      </div>
    </section>
  </>
}

function Reveal({ className, children }) {
  const elementRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
        observer.disconnect()
      }
    }, { threshold: 0.12 })

    observer.observe(elementRef.current)
    return () => observer.disconnect()
  }, [])

  return <div ref={elementRef} className={`reveal ${className}`}>{children}</div>
}

function Subpage({ eyebrow, title, children }) { return <section className="subpage page-width"><p className="section-kicker">{eyebrow}</p><h1>{title}</h1>{children}</section> }

function About({ goTo }) { return <Subpage eyebrow="02 / ABOUT DR. SHELKE'S AURUM HOMEOPATHY" title={<><span className="title-black">A Better Standard of</span> <span className="title-accent">Natural Care in Pimple Saudagar</span></>}><div className="about-layout"><div className="about-gallery"><figure className="about-photo-card about-photo-main"><img src="/assets/dr.imagre.png" alt="Dr. Jayesh Shelke - Homeopathic Doctor in Pimple Saudagar Pune" /></figure></div><div className="about-copy"><p className="lead">We believe true healing begins with understanding the complete individual.</p><p>Led by Dr. Jayesh Shelke, Aurum Homeopathy provides compassionate, root-cause healing for patients across Pimple Saudagar and Pune. Our practice focuses on thorough constitutional case-taking to deliver safe, personalized, and 100% natural care.</p><div className="stats stats-two"><div><strong>6+</strong><small>Years of Clinical Excellence</small></div><div><strong>98%</strong><small>Patient Satisfaction</small></div></div><a className="primary-btn cta-link" href="#contact" onClick={(event) => { event.preventDefault(); goTo('Contact Us'); window.location.hash = '#contact'; }}>Book a Consultation <span>↗</span></a></div></div></Subpage> }

function Services({ goTo, triggerAppointmentPopup }) {
  const serviceCards = [
    {
      title: 'Skin & Hair Care',
      badge: 'SPECIALTY',
      description: 'Personalized care for visible skin concerns and long-term scalp health.',
      conditions: ['Acne / Pimples', 'Eczema', 'Psoriasis', 'Vitiligo', 'Urticaria', 'Fungal Infections', 'Warts', 'Hair Fall', 'Alopecia', 'Dandruff'],
    },
    {
      title: 'Chronic Diseases',
      badge: 'SPECIALTY',
      description: 'Root-cause treatments that support immunity, relief, and sustainable recovery.',
      conditions: ['Asthma', 'Allergic Rhinitis', 'Sinusitis', 'Bronchitis', 'Chronic Cough', 'Recurrent Cold & Cough', 'Tonsillitis', 'Dust Allergy'],
    },
    {
      title: 'Women’s Health & PCOS',
      badge: 'SPECIALTY',
      description: 'Gentle, hormone-aware treatment plans for feminine wellness and balance.',
      conditions: ['PCOS/PCOD', 'Irregular Periods', 'Painful Periods', 'PMS', 'Menopause', 'Leucorrhea', 'Hormonal complaints'],
    },
    {
      title: 'Joint, Bone & Arthritis',
      badge: 'SPECIALTY',
      description: 'Supportive, non-invasive care for long-standing bone and joint discomfort.',
      conditions: ['Arthritis', 'Rheumatoid Arthritis', 'Osteoarthritis', 'Knee Pain', 'Back Pain', 'Neck Pain', 'Sciatica', 'Spondylitis', 'Gout'],
    },
    {
      title: 'Migraine, Headache & Vertigo',
      badge: 'SPECIALTY',
      description: 'Targeted support for recurring headaches, neurological discomfort, and balance-related issues.',
      conditions: ['Migraine', 'Headache', 'Tension Headache', 'Vertigo', 'Neuralgia'],
    },
    {
      title: 'Child & Pediatric Care',
      badge: 'SPECIALTY',
      description: 'Safe, natural support for children’s immunity, skin health, and common illness patterns.',
      conditions: ['Recurrent Cold/Cough', 'Allergies', 'Asthma', 'Tonsillitis', 'Adenoids', 'Eczema', 'Digestive problems', 'Bedwetting'],
    },
    {
      title: 'Digestive & Gastrointestinal',
      badge: 'SPECIALTY',
      description: 'Holistic support for digestive discomfort, gut imbalance, and daily wellness.',
      conditions: ['Acidity', 'GERD', 'Gastritis', 'IBS', 'Constipation', 'Gas/Bloating', 'Indigestion', 'Diarrhea'],
    },
    {
      title: 'Piles, Fissure & Anorectal Problems',
      badge: 'SPECIALTY',
      description: 'Comfort-focused care for anorectal discomfort and associated bowel issues.',
      conditions: ['Piles/Hemorrhoids', 'Anal Fissure', 'Fistula-related complaints', 'Constipation-associated complaints'],
    },
    {
      title: 'Thyroid & Hormonal Disorders',
      badge: 'SPECIALTY',
      description: 'Personalized care for endocrine balance and daily energy regulation.',
      conditions: ['Hypothyroidism', 'Hyperthyroidism', 'Thyroid-related complaints', 'Hormonal imbalance'],
    },
    {
      title: 'Weight & Lifestyle Disorders',
      badge: 'SPECIALTY',
      description: 'Supportive care for metabolic balance, weight concerns, and active living.',
      conditions: ['Weight Management', 'Obesity', 'Metabolic concerns', 'Lifestyle-related complaints'],
    },
    {
      title: 'Anxiety, Stress & Sleep',
      badge: 'SPECIALTY',
      description: 'Mind-body care designed to calm stress, improve sleep, and restore emotional balance.',
      conditions: ['Anxiety', 'Stress', 'Insomnia', 'Phobias', 'Exam Stress', 'Emotional concerns'],
    },
    {
      title: 'Men’s Health',
      badge: 'SPECIALTY',
      description: 'Confidential, individualized care focused on male wellness and hormonal confidence.',
      conditions: ['Male Infertility', 'Sexual-health concerns', 'Erectile difficulties', 'Premature Ejaculation', 'Prostate-related complaints'],
    },
    {
      title: 'Kidney & Urinary Problems',
      badge: 'SPECIALTY',
      description: 'Support for the urinary tract, kidney health, and recurring discomfort.',
      conditions: ['Kidney Stones', 'Recurrent UTI symptoms', 'Burning Urination', 'Frequent Urination', 'Bedwetting'],
    },
    {
      title: 'ENT & Throat Problems',
      badge: 'SPECIALTY',
      description: 'Relief-oriented treatment for recurring throat, sinus, and ear discomfort.',
      conditions: ['Tonsillitis', 'Nasal Polyps', 'Sinusitis', 'Ear-related complaints', 'Sore Throat', 'Adenoids'],
    },
    {
      title: 'Hair & Scalp Problems',
      badge: 'SPECIALTY',
      description: 'Supportive scalp and hair restoration care for everyday confidence and health.',
      conditions: ['Hair Fall', 'Alopecia', 'Dandruff', 'Premature Greying', 'Scalp Conditions'],
    },
    {
      title: 'Chronic & Autoimmune Conditions',
      badge: 'SPECIALTY',
      description: 'Gentle care for persistent inflammatory and autoimmune patterns affecting daily life.',
      conditions: ['Chronic Psoriasis', 'Eczema', 'Rheumatoid Arthritis', 'Chronic Allergies', 'Chronic inflammatory complaints'],
    },
    {
      title: 'Female Fertility & Gynecological Care',
      badge: 'SPECIALTY',
      description: 'Compassionate wellness care for reproductive health, hormonal balance, and cycles.',
      conditions: ['Infertility-related concerns', 'Fibroids', 'Ovarian cyst-related concerns', 'Menstrual disorders', 'Menopause'],
    },
    {
      title: 'Child Development & Behavioral Concerns',
      badge: 'SPECIALTY',
      description: 'Supportive care for emotional, behavioral, and developmental growth in children.',
      conditions: ['ADHD', 'Behavioral concerns', 'Learning difficulties', 'Sleep problems', 'Developmental concerns'],
    },
    {
      title: 'Musculoskeletal & Pain Management',
      badge: 'SPECIALTY',
      description: 'Personalized relief for joints, muscles, and chronic pain patterns.',
      conditions: ['Cervical Spondylosis', 'Lumbar Spondylosis', 'Muscle Pain', 'Sports-related pain', 'Stiffness'],
    },
    {
      title: 'General & Chronic Health Conditions',
      badge: 'SPECIALTY',
      description: 'Comprehensive care for recurrent illness, low immunity, and lasting constitutional concerns.',
      conditions: ['Recurrent infections', 'Low immunity concerns', 'Chronic fatigue', 'General constitutional complaints', 'Recurring health problems'],
    }
  ]

  return <>
    <section className="services-page-shell">
      <div className="services-grid-wrap">
        <div className="services-grid">
          {serviceCards.map((service) => (
            <article className="service-box" key={service.title}>
              <span className="service-tag">{service.badge}</span>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <ul>
                {service.conditions.map((condition) => (
                  <li key={condition}>{condition}</li>
                ))}
              </ul>
              <button className="service-btn" onClick={triggerAppointmentPopup}>Book Consultation</button>
            </article>
          ))}
        </div>
      </div>
    </section>
  </>
}

function Appointment({ submitted, setSubmitted, addAppointment }) { return <Subpage eyebrow="Get appointment / 03" title={<>Make time for<br /><em>your health.</em></>}><div className="appointment-layout"><div className="appointment-note"><span className="big-icon">✦</span><h2>One small step<br />toward feeling good.</h2><p>Complete the form and our care team will call you within one working hour to confirm your visit.</p><div className="contact-mini"><span>⏱</span><p><strong>Mon – Sat</strong><br />10:00 am to 2:00 pm, 4:00 pm to 9:00 pm<br /><strong>Sunday</strong><br />11:00 am to 4:00 pm</p></div></div>{submitted ? <div className="success-box"><span className="success-mark">✓</span><h2>Request received.</h2><p>Your request is saved. Our care team will call you shortly to confirm your appointment.</p><button className="text-btn" onClick={() => setSubmitted(false)}>Send another request <span>→</span></button></div> : <form className="appointment-form" onSubmit={(event) => { event.preventDefault(); addAppointment(Object.fromEntries(new FormData(event.currentTarget))); event.currentTarget.reset() }}><label><span className="form-label-text">Your name</span><input name="name" required placeholder="e.g. Ananya Sharma" /></label><label><span className="form-label-text">Phone number</span><input name="phone" required type="tel" placeholder="+91 98765 43210" /></label><label><span className="form-label-text">Email ID</span><input name="email" required type="email" placeholder="you@example.com" /></label><label><span className="form-label-text">Preferred date</span><input name="date" required type="date" min={new Date().toISOString().split('T')[0]} /></label><label><span className="form-label-text">Preferred time slot</span><select name="timeSlot" defaultValue="" required><option value="" disabled>Select a time slot</option>{clinicTimeSlots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}</select></label><button className="primary-btn" type="submit">BOOK APPOINTMENT <span>↗</span></button></form>}</div></Subpage> }

function StaffLogin({ login }) {
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotForm, setShowForgotForm] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotMessage, setForgotMessage] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    const values = Object.fromEntries(new FormData(event.currentTarget))
    if (!await login(values.username, values.password)) setError('Invalid staff email or password.')
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setForgotMessage('Password reset link will be sent to: ' + forgotEmail)
    setTimeout(() => setForgotMessage(''), 3000)
  }

  const canShowCreateUser = true // Will be checked in main dashboard

  return <Subpage eyebrow="Staff access / Secure login" title={<>Care team<br /><em>portal.</em></>}><div className="login-layout"><form className="staff-login" onSubmit={showForgotForm ? handleForgotPassword : submit}><label>Email<input name="username" type="email" required autoComplete="username" value={showForgotForm ? forgotEmail : undefined} onChange={(e) => setForgotEmail(e.target.value)} /></label>{!showForgotForm && <label className="password-label">Password<div className="password-field"><input name="password" type={showPassword ? "text" : "password"} required autoComplete="current-password" /><button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>👁️</button></div></label>}{error && <p className="form-error">{error}</p>}{forgotMessage && <p className="form-success">{forgotMessage}</p>}<button className="primary-btn" type="submit">{showForgotForm ? 'Send Reset Link' : 'Sign in'} <span>↗</span></button>{!showForgotForm && <button type="button" className="text-btn forgot-link" onClick={() => setShowForgotForm(true)}>Forgot password?</button>}{showForgotForm && <button type="button" className="text-btn" onClick={() => { setShowForgotForm(false); setForgotEmail(''); }}>Back to login</button>}</form><div className="login-info"><span className="big-icon">✦</span><h2>One place for incoming appointments.</h2><p>Doctors can review requests. Super admins can update or remove them.</p><p className="demo-credentials"><strong>Local demo:</strong> doctor / doctor123<br /><strong>Hostinger:</strong> use a user created in the users table</p></div></div></Subpage>
}

function StaffDashboard({ user, appointments, saveAppointments, apiEnabled, logout, goTo }) {
  const [editingId, setEditingId] = useState(null)
  const [editValues, setEditValues] = useState({})
  const [users, setUsers] = useState([])
  const [editingUserId, setEditingUserId] = useState(null)
  const [editUserValues, setEditUserValues] = useState({})
  const [message, setMessage] = useState('')

  // Load users if Super Admin
  useEffect(() => {
    if (user.role === 'super_admin') {
      fetch(getApiBaseUrl() + '?action=users')
        .then(response => response.ok ? response.json() : Promise.reject('Failed to fetch users'))
        .then(result => setUsers(result.users || result || []))
        .catch(err => console.warn('⚠️ Failed to load users:', err))
    }
  }, [user])

  const startEdit = (appointment) => { setEditingId(appointment.id); setEditValues({ ...appointment }) }
  const updateField = (field, value) => setEditValues((current) => ({ ...current, [field]: value }))
  
  const saveEdit = async () => { 
    try {
      // Direct database query to update appointment
      await fetch(`${getApiBaseUrl()}/appointments/${editingId}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: editValues.status, date: editValues.date, time_slot: editValues.time_slot, name: editValues.name, phone: editValues.phone, service: editValues.service })
      })
      saveAppointments(appointments.map((apt) => apt.id === editingId ? { ...editValues } : apt))
      setMessage('✅ Appointment updated successfully!')
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      console.error('❌ Error updating appointment:', err)
      setMessage('Error updating appointment')
    }
    setEditingId(null) 
  }
  
  const removeAppointment = async (id) => { 
    try {
      // Direct database query to delete appointment
      await fetch(`${getApiBaseUrl()}/appointments/${id}`, { method: 'DELETE' })
      saveAppointments(appointments.filter((apt) => apt.id !== id))
      setMessage('✅ Appointment deleted successfully!')
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      console.error('❌ Error deleting appointment:', err)
      setMessage('Error deleting appointment')
    }
  }
  
  const deleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    try {
      // Direct database query to delete user
      await fetch(`${getApiBaseUrl()}/users/${id}`, { method: 'DELETE' })
      setUsers(users.filter(u => u.id !== id))
      setMessage('✅ User deleted successfully!')
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      console.error('❌ Error deleting user:', err)
      setMessage('Error deleting user')
    }
  }
  
  const updateUser = async (id) => {
    try {
      // Direct database query to update user
      await fetch(`${getApiBaseUrl()}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editUserValues.name,
          email: editUserValues.email,
          role: editUserValues.role,
          ...(editUserValues.password && { password: editUserValues.password })
        })
      })
      setUsers(users.map(u => u.id === id ? { ...u, ...editUserValues } : u))
      setMessage('✅ User updated successfully!')
      setTimeout(() => setMessage(''), 2000)
      setEditingUserId(null)
    } catch (err) {
      console.error('Error updating user:', err)
    }
  }
  
  const canEditAppointments = ['super_admin', 'admin', 'doctor'].includes(user.role)
  const canDeleteAppointments = ['super_admin', 'admin'].includes(user.role)
  const canManageUsers = user.role === 'super_admin'

  return (
    <Subpage eyebrow={`${user.role} / Dashboard`} title={<>Manage your<br /><em>practice.</em></>}>
      <div className="dashboard-container">
        {message && <div className="message-box success">{message}</div>}
        
        <div className="dashboard-toolbar">
          <div>
            <p style={{marginBottom: '10px'}}>{appointments.length} appointment{appointments.length === 1 ? '' : 's'} received</p>
            {canManageUsers && <button className="primary-btn" onClick={() => goTo('Create User')} style={{marginRight: '10px'}}>+ Create User</button>}
            {canManageUsers && <button className="primary-btn" onClick={() => goTo('Manage Users')}>Manage Users</button>}
          </div>
          <button className="text-btn" onClick={logout}>Sign out <span>↗</span></button>
        </div>
        
        {appointments.length === 0 ? (
          <div className="empty-state">
            <span className="big-icon">✓</span>
            <h2>No incoming appointments.</h2>
            <p>New requests submitted through the public appointment form will appear here.</p>
          </div>
        ) : (
          <div className="appointment-list">
            {appointments.map((appointment) => (
              <article className="appointment-item" key={appointment.id}>
                {editingId === appointment.id ? (
                  <div className="appointment-edit">
                    <input value={editValues.name} onChange={(event) => updateField('name', event.target.value)} aria-label="Patient name" />
                    <input value={editValues.phone} onChange={(event) => updateField('phone', event.target.value)} aria-label="Phone number" />
                    <input type="date" value={editValues.date || ''} onChange={(event) => updateField('date', event.target.value)} aria-label="Date" />
                    <select value={editValues.status || 'New'} onChange={(event) => updateField('status', event.target.value)} aria-label="Status">
                      <option>New</option>
                      <option>Confirmed</option>
                      <option>Completed</option>
                      <option>Cancelled</option>
                    </select>
                    <button className="primary-btn" onClick={saveEdit}>Save</button>
                    <button className="text-btn" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                ) : (
                  <>
                    <div>
                      <span className="appointment-status">{appointment.status}</span>
                      <h3>{appointment.name}</h3>
                      <p>{appointment.service} · {appointment.phone}</p>
                      <small>{appointment.date} {appointment.time_slot}</small>
                    </div>
                    {canEditAppointments && (
                      <div className="appointment-actions">
                        <button className="text-btn" onClick={() => startEdit(appointment)}>Edit</button>
                        {canDeleteAppointments && <button className="text-btn danger-btn" onClick={() => removeAppointment(appointment.id)}>Delete</button>}
                      </div>
                    )}
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </Subpage>
  )
}

function ManageUsers({ users: initialUsers, goTo, apiEnabled }) {
  const [users, setUsers] = useState(initialUsers)
  const [editingId, setEditingId] = useState(null)
  const [editValues, setEditValues] = useState({})
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    console.log('📝 [ManageUsers] Component mounted, fetching users...')
    // Direct database query to fetch all users
    const apiUrl = getApiBaseUrl() + '/users'
    console.log('📤 [ManageUsers] GET request to:', apiUrl)
    
    fetch(apiUrl)
      .then(response => {
        console.log('📥 [ManageUsers] Response status:', response.status)
        return response.ok ? response.json() : Promise.reject('Failed to fetch: ' + response.status)
      })
      .then(result => {
        console.log('✅ [ManageUsers] Users received:', result)
        const userList = result.users || result || []
        console.log('📋 [ManageUsers] Setting users state with', userList.length, 'users')
        setUsers(userList)
      })
      .catch(err => {
        console.error('❌ [ManageUsers] Error loading users:', err)
        console.warn('⚠️ [ManageUsers] Could not load users from backend')
      })
  }, [])

  const startEdit = (user) => { setEditingId(user.id); setEditValues({ ...user }) }
  const updateField = (field, value) => setEditValues(prev => ({ ...prev, [field]: value }))
  
  const saveEdit = async () => {
    console.log('💾 [SaveEdit] Saving user ID:', editingId)
    console.log('📝 [SaveEdit] Updated values:', editValues)
    try {
      const apiUrl = `${getApiBaseUrl()}/users/${editingId}`
      console.log('📤 [SaveEdit] PUT request to:', apiUrl)
      
      const payload = {
        name: editValues.name,
        email: editValues.email,
        role: editValues.role,
        ...(editValues.password && { password: editValues.password })
      }
      console.log('📋 [SaveEdit] Payload:', payload)
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      console.log('📥 [SaveEdit] Response status:', response.status)
      
      if (!response.ok) {
        const errorBody = await response.text()
        console.error('❌ [SaveEdit] Server error:', errorBody)
        throw new Error('Server error: ' + response.status)
      }
      
      const result = await response.json()
      console.log('✅ [SaveEdit] Update successful:', result)
      
      setUsers(users.map(u => u.id === editingId ? { ...u, ...editValues } : u))
      console.log('📋 [SaveEdit] Updated users state')
      
      setMessage('✅ User updated successfully!')
      setTimeout(() => setMessage(''), 2000)
      setEditingId(null)
    } catch (err) {
      console.error('❌ [SaveEdit] Error updating user:', err.message, err)
      setMessage('❌ Error updating user: ' + err.message)
      setTimeout(() => setMessage(''), 2000)
    }
  }
  
  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return
    console.log('🗑️ [DeleteUser] Deleting user ID:', id)
    try {
      const apiUrl = `${getApiBaseUrl()}/users/${id}`
      console.log('📤 [DeleteUser] DELETE request to:', apiUrl)
      
      const response = await fetch(apiUrl, { method: 'DELETE' })
      
      console.log('📥 [DeleteUser] Response status:', response.status)
      
      if (!response.ok) {
        const errorBody = await response.text()
        console.error('❌ [DeleteUser] Server error:', errorBody)
        throw new Error('Server error: ' + response.status)
      }
      
      const result = await response.json()
      console.log('✅ [DeleteUser] Delete successful:', result)
      
      setUsers(users.filter(u => u.id !== id))
      console.log('📋 [DeleteUser] Updated users state, user removed')
      
      setMessage('✅ User deleted!')
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      console.error('❌ [DeleteUser] Error deleting user:', err.message, err)
      setMessage('❌ Error: ' + err.message)
    }
  }

  return (
    <Subpage eyebrow="Super Admin / Manage Users" title={<>Manage<br /><em>team members.</em></>}>
      <div className="dashboard-container">
        {message && <div className="message-box success">{message}</div>}
        <button className="text-btn" onClick={() => goTo('Staff Dashboard')} style={{marginBottom: '20px'}}>← Back to Dashboard</button>
        
        <table className="users-table" style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead>
            <tr style={{borderBottom: '2px solid #ddd'}}>
              <th style={{padding: '10px', textAlign: 'left'}}>Name</th>
              <th style={{padding: '10px', textAlign: 'left'}}>Email</th>
              <th style={{padding: '10px', textAlign: 'left'}}>Role</th>
              <th style={{padding: '10px', textAlign: 'left'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{borderBottom: '1px solid #ddd'}}>
                {editingId === user.id ? (
                  <>
                    <td style={{padding: '10px'}}>
                      <input type="text" value={editValues.name} onChange={(e) => updateField('name', e.target.value)} style={{width: '100%'}} />
                    </td>
                    <td style={{padding: '10px'}}>
                      <input type="email" value={editValues.email} onChange={(e) => updateField('email', e.target.value)} style={{width: '100%'}} />
                    </td>
                    <td style={{padding: '10px'}}>
                      <select value={editValues.role} onChange={(e) => updateField('role', e.target.value)}>
                        <option>patient</option>
                        <option>doctor</option>
                        <option>nurse</option>
                        <option>admin</option>
                        <option>super_admin</option>
                      </select>
                    </td>
                    <td style={{padding: '10px'}}>
                      <div style={{marginBottom: '8px'}}>
                        <label style={{display: 'block', marginBottom: '5px'}}>New Password (optional):</label>
                        <div style={{display: 'flex', gap: '5px'}}>
                          <input type={showPassword ? 'text' : 'password'} value={editValues.password || ''} onChange={(e) => updateField('password', e.target.value)} placeholder="Leave empty to keep current" style={{flex: 1}} />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} style={{padding: '5px 10px'}}>Eye</button>
                        </div>
                      </div>
                      <button className="primary-btn" onClick={saveEdit} style={{marginRight: '5px', padding: '5px 10px'}}>Save</button>
                      <button className="text-btn" onClick={() => setEditingId(null)} style={{padding: '5px 10px'}}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{padding: '10px'}}>{user.name}</td>
                    <td style={{padding: '10px'}}>{user.email}</td>
                    <td style={{padding: '10px'}}><strong>{user.role}</strong></td>
                    <td style={{padding: '10px'}}>
                      <button className="text-btn" onClick={() => startEdit(user)} style={{marginRight: '10px'}}>Edit</button>
                      <button className="text-btn danger-btn" onClick={() => deleteUser(user.id)}>Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Subpage>
  )
}

function CreateUser({ goTo }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('patient')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !email || !password) {
      setError('All fields are required')
      return
    }
    try {
      // Direct database query to create user
      const response = await fetch(getApiBaseUrl() + '?action=register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      })
      if (!response.ok) throw new Error('Failed to create user')
      const result = await response.json()
      setMessage(`✅ User ${name} created successfully with role: ${role}`)
      setName('')
      setEmail('')
      setPassword('')
      setRole('patient')
      setTimeout(() => { setMessage(''); goTo('Staff Dashboard') }, 2000)
    } catch (err) {
      setError(err.message || 'Failed to create user')
    }
  }

  return (
    <Subpage eyebrow="Admin / Create new user" title={<>Create<br /><em>staff account.</em></>}>
      <div className="login-layout">
        <form className="staff-login" onSubmit={handleSubmit}>
          <label>
            Full Name
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="password-label">
            Password
            <div className="password-field">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>Eye</button>
            </div>
          </label>
          <label>
            Role
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="nurse">Nurse</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </label>
          {error && <p className="form-error">{error}</p>}
          {message && <p className="form-success">{message}</p>}
          <button className="primary-btn" type="submit">Create User <span>↗</span></button>
          <button type="button" className="text-btn" onClick={() => goTo('Staff Dashboard')}>Back to Dashboard</button>
        </form>
        <div className="login-info">
          <span className="big-icon">✦</span>
          <h2>Manage your team</h2>
          <p>Create new staff accounts and assign roles to manage appointments.</p>
          <p>
            <strong>Available Roles:</strong>
            <br />
            • Patient - View only appointments
            <br />
            • Doctor - Review and edit appointments
            <br />
            • Admin - Full management access
            <br />
            • Super Admin - Complete system control
          </p>
        </div>
      </div>
    </Subpage>
  )
}

function SuperAdminDashboard({ user, appointments, saveAppointments, apiEnabled, logout, goTo, updateSystemStatus, systemStatus }) {
  const [adminSection, setAdminSection] = useState('dashboard')
  const [message, setMessage] = useState('')
  const [users, setUsers] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editValues, setEditValues] = useState({})
  const [newAppointmentForm, setNewAppointmentForm] = useState(false)
  const [newAppointment, setNewAppointment] = useState({ name: '', email: '', phone: '', service: 'General consultation', date: '', time_slot: '' })
  const [showPasswordField, setShowPasswordField] = useState(null)
  const [passwordValue, setPasswordValue] = useState('')
  const [offlineComment, setOfflineComment] = useState(systemStatus?.comment || 'System is under maintenance')

  // Load users - Direct database query
  useEffect(() => {
    fetch(getApiBaseUrl() + '/users')
      .then(response => response.ok ? response.json() : Promise.reject('Failed'))
      .then(result => setUsers(result.users || result || []))
      .catch(err => console.warn('⚠️ Failed to load users:', err))
  }, [])

  const toggleOnline = () => {
    updateSystemStatus({ isOnline: !systemStatus.isOnline })
    setMessage(!systemStatus.isOnline ? '🟢 System is ONLINE' : '🔴 System going OFFLINE')
    setTimeout(() => setMessage(''), 3000)
  }

  const toggleMaintenance = () => {
    updateSystemStatus({ 
      maintenanceMode: !systemStatus.maintenanceMode,
      comment: offlineComment 
    })
    setMessage(systemStatus.maintenanceMode ? 'Maintenance mode disabled' : '🔧 MAINTENANCE MODE ENABLED - Site is offline')
    setTimeout(() => setMessage(''), 3000)
  }

  const createNewAppointment = async () => {
    if (!newAppointment.name || !newAppointment.phone || !newAppointment.date || !newAppointment.time_slot) {
      setMessage('All fields are required')
      return
    }
    try {
      // Direct database query to create appointment
      await fetch(getApiBaseUrl() + '?action=appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppointment)
      })
      const apt = { id: Date.now(), status: 'New', ...newAppointment }
      saveAppointments([...appointments, apt])
      setNewAppointment({ name: '', email: '', phone: '', service: 'General consultation', date: '', time_slot: '' })
      setNewAppointmentForm(false)
      setMessage('✅ Appointment created successfully!')
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      setMessage('❌ Failed to create appointment')
    }
  }

  const updateAppointment = async (id) => {
    try {
      // Direct database query to update appointment
      await fetch(`${getApiBaseUrl()}/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editValues)
      })
      saveAppointments(appointments.map(apt => apt.id === id ? editValues : apt))
      setMessage('✅ Appointment updated!')
      setTimeout(() => setMessage(''), 2000)
      setEditingId(null)
    } catch (err) {
      setMessage('❌ Failed to update appointment')
    }
  }

  const deleteAppointment = async (id) => {
    if (!confirm('Delete this appointment?')) return
    try {
      // Direct database query to delete appointment
      await fetch(`${getApiBaseUrl()}/appointments/${id}`, { method: 'DELETE' })
      saveAppointments(appointments.filter(apt => apt.id !== id))
      setMessage('✅ Appointment deleted!')
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      setMessage('❌ Failed to delete appointment')
    }
  }

  const disableUser = async (id) => {
    if (!confirm('Disable this user? They will not be able to login.')) return
    try {
      // Direct database query to disable user
      await fetch(`${getApiBaseUrl()}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: false })
      })
      setUsers(users.filter(u => u.id !== id))
      setMessage('✅ User disabled!')
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      setMessage('❌ Failed to disable user')
    }
  }

  const updateUser = async (id) => {
    try {
      // Direct database query to update user
      await fetch(`${getApiBaseUrl()}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editValues.name,
          email: editValues.email,
          role: editValues.role,
          ...(editValues.password && { password: editValues.password })
        })
      })
      setUsers(users.map(u => u.id === id ? editValues : u))
      setMessage('✅ User updated!')
      setTimeout(() => setMessage(''), 2000)
      setEditingId(null)
    } catch (err) {
      setMessage('❌ Failed to update user')
    }
  }

  const updatePassword = async (id, newPassword) => {
    if (!newPassword || newPassword.length < 6) {
      setMessage('Password must be at least 6 characters')
      setTimeout(() => setMessage(''), 2000)
      return
    }
    try {
      // Direct database query to update password
      await fetch(`${getApiBaseUrl()}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      })
      setMessage('✅ Password updated successfully!')
      setTimeout(() => setMessage(''), 2000)
      setShowPasswordField(null)
      setPasswordValue('')
    } catch (err) {
      setMessage('❌ Failed to update password')
    }
  }

  const deleteUser = async (id) => {
    if (!confirm('Permanently delete this user?')) return
    try {
      // Direct database query to delete user
      await fetch(`${getApiBaseUrl()}/users/${id}`, { method: 'DELETE' })
      setUsers(users.filter(u => u.id !== id))
      setMessage('✅ User deleted!')
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      setMessage('❌ Failed to delete user')
    }
  }

  return (
    <Subpage eyebrow={`${user.role} / Super Admin Panel`} title={<>System<br /><em>Control.</em></>}>
      <div className="super-admin-container">
        {/* USER WELCOME HEADER */}
        <div className="user-welcome-header">
          <div className="welcome-left">
            <h3>Welcome back, <span className="user-name">{user.name}</span>! 👋</h3>
            <p className="user-info">
              <span className="role-badge" data-role={user.role}>{user.role.replace('_', ' ').toUpperCase()}</span>
              <span className="user-email">{user.email}</span>
            </p>
          </div>
          <div className="welcome-right">
            <button className="logout-btn" onClick={logout}>Sign out <span>↗</span></button>
          </div>
        </div>

        {systemStatus.maintenanceMode && (
          <div className="maintenance-banner">
            🔧 SITE UNDER MAINTENANCE 🔧<br/>
            <small>Only administrators can access the system</small>
          </div>
        )}

        {message && <div className={`message-box ${message.includes('successfully') || message.includes('ONLINE') ? 'success' : 'warning'}`}>{message}</div>}

        {/* ADMIN MENU */}
        <div className="admin-menu">
          <button className={`menu-btn ${adminSection === 'dashboard' ? 'active' : ''}`} onClick={() => setAdminSection('dashboard')}>
            📊 Dashboard
          </button>
          <button className={`menu-btn ${adminSection === 'appointments' ? 'active' : ''}`} onClick={() => setAdminSection('appointments')}>
            📋 Appointments
          </button>
          <button className={`menu-btn ${adminSection === 'users' ? 'active' : ''}`} onClick={() => setAdminSection('users')}>
            👥 Users
          </button>
        </div>

        {/* DASHBOARD SECTION */}
        {adminSection === 'dashboard' && (
          <div className="admin-section">
            <h2>System Control Dashboard</h2>
            <div className="admin-controls">
              <div className="control-group">
                <label>System Status:</label>
                <button className={`status-btn ${systemStatus.isOnline ? 'online' : 'offline'}`} onClick={toggleOnline}>
                  {systemStatus.isOnline ? '🟢 ONLINE' : '🔴 OFFLINE'} - Click to {systemStatus.isOnline ? 'Go Offline' : 'Go Online'}
                </button>
              </div>

              <div className="control-group">
                <label>Maintenance Mode:</label>
                <button className={`maintenance-btn ${systemStatus.maintenanceMode ? 'active' : ''}`} onClick={toggleMaintenance}>
                  {systemStatus.maintenanceMode ? '⚙️ DISABLE MAINTENANCE' : '⚙️ ENABLE MAINTENANCE'}
                </button>
              </div>

              {(systemStatus.maintenanceMode || !systemStatus.isOnline) && (
                <div className="control-group">
                  <label>Offline Reason/Comment:</label>
                  <input 
                    type="text" 
                    placeholder="Why is the system offline?" 
                    value={offlineComment}
                    onChange={(e) => setOfflineComment(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      border: '1px solid #BBDEFB', 
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                  <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>This message will be shown to users when system is offline</small>
                </div>
              )}
            </div>
            
            <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#F0F7FF', borderRadius: '8px', border: '1px solid #BBDEFB' }}>
              <p style={{ color: '#1976D2', fontSize: '14px', lineHeight: '1.6' }}>
                <strong>📊 Dashboard Overview:</strong><br/>
                • System is currently <strong>{systemStatus.isOnline ? 'ONLINE' : 'OFFLINE'}</strong><br/>
                • Maintenance Mode is <strong>{systemStatus.maintenanceMode ? 'ENABLED' : 'DISABLED'}</strong><br/>
                • Total Users: <strong>{users.length}</strong><br/>
                • Total Appointments: <strong>{appointments.length}</strong><br/>
                <br/>
                {!systemStatus.isOnline && <span style={{color: '#d32f2f'}}>⚠️ Regular users cannot access the system</span>}
                {systemStatus.maintenanceMode && <span style={{color: '#ff9800'}}>⚠️ System is in maintenance mode</span>}
                {systemStatus.isOnline && !systemStatus.maintenanceMode && <span style={{color: '#388e3c'}}>✅ System is fully operational</span>}
                <br/>
                Use the menu above to manage appointments or users.
              </p>
            </div>
          </div>
        )}

        {/* APPOINTMENTS SECTION */}
        {adminSection === 'appointments' && (
          <div className="admin-section">
            <h2>📋 Appointments Management</h2>
            <button className="primary-btn" onClick={() => setNewAppointmentForm(!newAppointmentForm)}>
              {newAppointmentForm ? '❌ Cancel' : '➕ Create New Appointment'}
            </button>

            {newAppointmentForm && (
              <div className="form-card">
                <input placeholder="Patient Name" value={newAppointment.name} onChange={(e) => setNewAppointment({...newAppointment, name: e.target.value})} />
                <input placeholder="Email" type="email" value={newAppointment.email} onChange={(e) => setNewAppointment({...newAppointment, email: e.target.value})} />
                <input placeholder="Phone" value={newAppointment.phone} onChange={(e) => setNewAppointment({...newAppointment, phone: e.target.value})} />
                <input placeholder="Service" value={newAppointment.service} onChange={(e) => setNewAppointment({...newAppointment, service: e.target.value})} />
                <input type="date" value={newAppointment.date} onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})} />
                <select value={newAppointment.time_slot} onChange={(e) => setNewAppointment({...newAppointment, time_slot: e.target.value})}>
                  <option value="">Select Time Slot</option>
                  {clinicTimeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                </select>
                <button className="primary-btn" onClick={createNewAppointment}>Create Appointment</button>
              </div>
            )}

            <div className="appointments-list">
              {appointments.length === 0 ? (
                <p>No appointments</p>
              ) : (
                appointments.map((apt) => (
                  <div className="apt-card" key={apt.id}>
                    {editingId === apt.id ? (
                      <div className="edit-form">
                        <input value={editValues.name} onChange={(e) => setEditValues({...editValues, name: e.target.value})} />
                        <input value={editValues.phone} onChange={(e) => setEditValues({...editValues, phone: e.target.value})} />
                        <input type="date" value={editValues.date} onChange={(e) => setEditValues({...editValues, date: e.target.value})} />
                        <select value={editValues.status} onChange={(e) => setEditValues({...editValues, status: e.target.value})}>
                          <option>New</option>
                          <option>Confirmed</option>
                          <option>Completed</option>
                          <option>Cancelled</option>
                        </select>
                        <button className="primary-btn" onClick={() => updateAppointment(apt.id)}>Save</button>
                        <button className="text-btn" onClick={() => setEditingId(null)}>Cancel</button>
                      </div>
                    ) : (
                      <div>
                        <span className="status-badge">{apt.status}</span>
                        <h4>{apt.name}</h4>
                        <small>{apt.phone} · {apt.date} {apt.time_slot}</small>
                        <div className="action-buttons">
                          <button className="text-btn" onClick={() => {setEditingId(apt.id); setEditValues(apt)}}>Edit</button>
                          <button className="text-btn danger-btn" onClick={() => deleteAppointment(apt.id)}>Delete</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* USERS SECTION */}
        {adminSection === 'users' && (
          <div className="admin-section">
            <h2>👥 Users Management</h2>
            <button className="primary-btn" onClick={() => goTo('Create User')}>➕ Create New User</button>

            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    {editingId === u.id ? (
                      <>
                        <td><input value={editValues.name} onChange={(e) => setEditValues({...editValues, name: e.target.value})} /></td>
                        <td><input value={editValues.email} onChange={(e) => setEditValues({...editValues, email: e.target.value})} /></td>
                        <td>
                          <select value={editValues.role} onChange={(e) => setEditValues({...editValues, role: e.target.value})}>
                            <option value="patient">Patient</option>
                            <option value="doctor">Doctor</option>
                            <option value="nurse">Nurse</option>
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super Admin</option>
                          </select>
                        </td>
                        <td>
                          <button className="text-btn" onClick={() => updateUser(u.id)}>Save</button>
                          <button className="text-btn" onClick={() => setEditingId(null)}>Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td><strong>{u.role}</strong></td>
                        <td>
                          <div className="action-group">
                            <button className="text-btn" onClick={() => {setEditingId(u.id); setEditValues(u)}} style={{marginRight: '8px'}}>Edit</button>
                            <button className="text-btn password-btn" onClick={() => {setShowPasswordField(u.id); setPasswordValue('')}} style={{marginRight: '8px'}}>🔐 Password</button>
                            <button className="text-btn" onClick={() => disableUser(u.id)} style={{marginRight: '8px'}}>Disable</button>
                            <button className="text-btn danger-btn" onClick={() => deleteUser(u.id)}>Delete</button>
                          </div>
                          {showPasswordField === u.id && (
                            <div className="password-update-form">
                              <input 
                                type="password" 
                                placeholder="Enter new password (min 6 chars)" 
                                value={passwordValue} 
                                onChange={(e) => setPasswordValue(e.target.value)} 
                                onKeyPress={(e) => e.key === 'Enter' && updatePassword(u.id, passwordValue)}
                              />
                              <button className="primary-btn" onClick={() => updatePassword(u.id, passwordValue)}>Update Password</button>
                              <button className="text-btn" onClick={() => setShowPasswordField(null)}>Cancel</button>
                            </div>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Subpage>
  )
}

function Contact() {
  return (
    <div id="contact">
      <Subpage eyebrow="Contact us / 04" title={<>Here when you<br /><em>need us.</em></>}>
        <div className="contact-layout">
          <div className="contact-detail">
            <p className="lead">Come by for a visit, call us, or send a note. We are happy to help.</p>
            <div className="detail-block">
              <small>VISIT</small>
              <p>2nd Floor, Vision Gallaria,<br />Kunal Icon Road, Pimple Saudagar,<br />Pimpri-Chinchwad, Pune 411027</p>
            </div>
            <div className="detail-block">
              <small>CALL</small>
              <p>+91 9145692117<br />aurumhomeopathy4@gmil.com</p>
            </div>
            <a className="contact-call-btn" href="tel:+919145692117">Call 9145692117 <span>↗</span></a>
          </div>
          <div className="map-card">
            <div className="map-lines" />
            <span className="map-pin">+</span>
            <div className="map-label">
              <strong>Dr. Shelke's Aurum</strong>
              <small>2nd Floor, Vision Gallaria</small>
            </div>
          </div>
        </div>
      </Subpage>
    </div>
  )
}

function OfflineScreen({ systemStatus, goTo }) {
  return (
    <div className="offline-full-screen">
      <div className="offline-center-container">
        {!systemStatus.isOnline ? (
          <>
            <div className="offline-icon-large">🔴</div>
            <h1 className="offline-title">System Offline</h1>
            <p className="offline-message-text">
              {systemStatus.comment || 'Our clinic system is currently offline for maintenance. Please try again in a few moments.'}
            </p>
            <div className="offline-actions">
              <button className="primary-btn" onClick={() => goTo('Staff Login')}>Staff Login</button>
              <div className="offline-contact">
                <p><strong>Need immediate assistance?</strong></p>
                <p>Call us: <a href="tel:+919145692117">+91 9145692117</a></p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="offline-icon-large">🔧</div>
            <h1 className="offline-title">Maintenance Mode</h1>
            <p className="offline-message-text">
              {systemStatus.comment || 'Our clinic is undergoing scheduled maintenance. We will be back online shortly.'}
            </p>
            <div className="offline-actions">
              <button className="primary-btn" onClick={() => goTo('Staff Login')}>Staff Login</button>
              <div className="offline-contact">
                <p><strong>Emergency?</strong></p>
                <p>Call us: <a href="tel:+919145692117">+91 9145692117</a></p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default App

createRoot(document.getElementById('root')).render(<App />)
