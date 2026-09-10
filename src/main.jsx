import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const services = [
  { icon: '◌', title: 'Pathology testing', copy: 'Accurate diagnostics, from routine blood work to specialist panels.' },
  { icon: '⌁', title: 'Health screenings', copy: 'Thoughtful preventive checkups designed around your everyday health.' },
  { icon: '✦', title: 'Home collection', copy: 'A trained phlebotomist comes to you, at a time that suits your day.' },
]

const navItems = ['Home', 'About Us', 'Services', 'Get Appointment', 'Contact Us']
const APPOINTMENTS_KEY = 'shelkes-aurum-appointments'
const STAFF_USERS = {
  doctor: { username: 'doctor', password: 'doctor123', role: 'Doctor' },
  admin: { username: 'admin', password: 'admin123', role: 'Super Admin' },
}

function getAppointments() {
  try {
    return JSON.parse(localStorage.getItem(APPOINTMENTS_KEY)) || []
  } catch {
    return []
  }
}

function App() {
  const [screen, setScreen] = useState('Home')
  const [submitted, setSubmitted] = useState(false)
  const [appointments, setAppointments] = useState(getAppointments)
  const [currentUser, setCurrentUser] = useState(null)

  const goTo = (nextScreen) => {
    setSubmitted(false)
    setScreen(nextScreen)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const saveAppointments = (nextAppointments) => {
    setAppointments(nextAppointments)
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(nextAppointments))
  }

  const addAppointment = (details) => {
    const appointment = { ...details, id: Date.now(), createdAt: new Date().toISOString(), status: 'New' }
    saveAppointments([appointment, ...appointments])
    setSubmitted(true)
  }

  const login = (username, password) => {
    const user = Object.values(STAFF_USERS).find((candidate) => candidate.username === username && candidate.password === password)
    if (!user) return false
    setCurrentUser(user)
    goTo('Staff Dashboard')
    return true
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => goTo('Home')} aria-label="Go to home">
          <img className="brand-logo" src="/assets/aurum-logo.png.png" alt="Dr. Shelke's Aurum Homeopathy" />
        </button>
        <nav className="desktop-nav" aria-label="Main navigation">
          {navItems.map((item) => <button className={screen === item ? 'active' : ''} onClick={() => goTo(item)} key={item}>{item}</button>)}
        </nav>
        <div className="header-actions"><button className="staff-link" onClick={() => currentUser ? goTo('Staff Dashboard') : goTo('Staff Login')}>{currentUser ? currentUser.role : 'Staff Login'}</button><button className="header-cta" onClick={() => goTo('Get Appointment')}>Book Appointment <span>↗</span></button></div>
      </header>

      <main>
        {screen === 'Home' && <Home goTo={goTo} />}
        {screen === 'About Us' && <About goTo={goTo} />}
        {screen === 'Services' && <Services goTo={goTo} />}
        {screen === 'Get Appointment' && <Appointment submitted={submitted} setSubmitted={setSubmitted} addAppointment={addAppointment} />}
        {screen === 'Contact Us' && <Contact />}
        {screen === 'Staff Login' && <StaffLogin login={login} />}
        {screen === 'Staff Dashboard' && currentUser && <StaffDashboard user={currentUser} appointments={appointments} saveAppointments={saveAppointments} logout={() => { setCurrentUser(null); goTo('Home') }} />}
      </main>

      <footer><span>© 2026 Dr. Shelke's Aurum Homeopathic Clinic</span><span>Care that makes clarity possible.</span><button onClick={() => goTo('Contact Us')}>Find our clinic ↗</button></footer>
    </div>
  )
}

function Home({ goTo }) {
  return <>
    <Reveal className="hero page-width">
      <div className="hero-copy">
        <p className="eyebrow"><span className="pulse-dot" /> Trusted by 2000+ families</p>
        <h1>Root-Cause Natural<br /><em>Healing</em></h1>
        <p className="hero-text">Holistic Homeopathic Care for Long-Term Healing</p>
        <p className="subheadline">Individualized care tailored to your unique health story. Experience safe, natural, and effective holistic treatment.</p>
        <div className="hero-actions"><button className="primary-btn" onClick={() => goTo('Get Appointment')}>Book an appointment <span>↗</span></button><button className="secondary-btn text-btn" onClick={() => goTo('Services')}>Explore services <span>→</span></button></div>
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
    <Reveal className="service-preview page-width"><div className="section-heading"><div><p className="section-kicker">03 / What we do</p><h2>Clarity for every<br /><em>step forward.</em></h2></div><button className="round-arrow" onClick={() => goTo('Services')}>↗</button></div><div className="service-grid">{services.map((service) => <article className="service-card" key={service.title}><span className="service-icon">{service.icon}</span><h3>{service.title}</h3><p>{service.copy}</p><span className="card-arrow">↗</span></article>)}</div></Reveal>
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

function About({ goTo }) { return <Subpage eyebrow="About Aurum / 01" title={<>A better standard<br /><em>of care.</em></>}><div className="about-layout"><div className="about-photo" /><div className="about-copy"><p className="lead">We believe good healthcare is equal parts precision and presence.</p><p>Dr. Shelke's Aurum Homeopathic Clinic has grown into a trusted care partner for families seeking thoughtful, personalized homeopathic support. Our team combines compassionate guidance with the kind of attention that helps people feel at ease.</p><div className="stats"><div><strong>25+</strong><small>years of care</small></div><div><strong>40k</strong><small>consultations</small></div><div><strong>98%</strong><small>patient satisfaction</small></div></div><button className="primary-btn" onClick={() => goTo('Get Appointment')}>Meet us for a visit <span>↗</span></button></div></div></Subpage> }

function Services({ goTo }) { return <Subpage eyebrow="Our services / 02" title={<>Care, made<br /><em>clear.</em></>}><div className="large-service-grid">{services.concat([{ icon: '⌂', title: 'Wellness packages', copy: 'Curated annual plans that make preventive care a simple habit.' }, { icon: '◍', title: 'Doctor consultations', copy: 'Speak with a qualified doctor about your results and next steps.' }]).map((service, index) => <article className="large-service" key={service.title}><span className="service-number">0{index + 1}</span><span className="service-icon">{service.icon}</span><h3>{service.title}</h3><p>{service.copy}</p><button className="text-btn" onClick={() => goTo('Get Appointment')}>Book this service <span>→</span></button></article>)}</div></Subpage> }

function Appointment({ submitted, setSubmitted, addAppointment }) { return <Subpage eyebrow="Get appointment / 03" title={<>Make time for<br /><em>your health.</em></>}><div className="appointment-layout"><div className="appointment-note"><span className="big-icon">✦</span><h2>One small step<br />toward feeling good.</h2><p>Complete the form and our care team will call you within one working hour to confirm your visit.</p><div className="contact-mini"><span>⏱</span><p><strong>Mon – Sat</strong><br />7:00 am – 8:00 pm</p></div></div>{submitted ? <div className="success-box"><span className="success-mark">✓</span><h2>Request received.</h2><p>Your request is saved. Our care team will call you shortly to confirm your appointment.</p><button className="text-btn" onClick={() => setSubmitted(false)}>Send another request <span>→</span></button></div> : <form className="appointment-form" onSubmit={(event) => { event.preventDefault(); addAppointment(Object.fromEntries(new FormData(event.currentTarget))); event.currentTarget.reset() }}><label>Your name<input name="name" required placeholder="e.g. Ananya Sharma" /></label><label>Phone number<input name="phone" required type="tel" placeholder="+91 98765 43210" /></label><label>What do you need?<select name="service" defaultValue="" required><option value="" disabled>Select a service</option><option>Pathology testing</option><option>Health screening</option><option>Home collection</option></select></label><button className="primary-btn" type="submit">Request appointment <span>↗</span></button></form>}</div></Subpage> }

function StaffLogin({ login }) {
  const [error, setError] = useState('')
  const submit = (event) => {
    event.preventDefault()
    const values = Object.fromEntries(new FormData(event.currentTarget))
    if (!login(values.username, values.password)) setError('Invalid staff username or password.')
  }

  return <Subpage eyebrow="Staff access / Secure login" title={<>Care team<br /><em>portal.</em></>}><div className="login-layout"><form className="staff-login" onSubmit={submit}><label>Username<input name="username" required autoComplete="username" /></label><label>Password<input name="password" type="password" required autoComplete="current-password" /></label>{error && <p className="form-error">{error}</p>}<button className="primary-btn" type="submit">Sign in <span>↗</span></button></form><div className="login-info"><span className="big-icon">✦</span><h2>One place for incoming appointments.</h2><p>Doctors can review requests. Super admins can update or remove them.</p><p className="demo-credentials"><strong>Doctor:</strong> doctor / doctor123<br /><strong>Super Admin:</strong> admin / admin123</p></div></div></Subpage>
}

function StaffDashboard({ user, appointments, saveAppointments, logout }) {
  const [editingId, setEditingId] = useState(null)
  const [editValues, setEditValues] = useState({})
  const startEdit = (appointment) => { setEditingId(appointment.id); setEditValues(appointment) }
  const updateField = (field, value) => setEditValues((current) => ({ ...current, [field]: value }))
  const saveEdit = () => { saveAppointments(appointments.map((appointment) => appointment.id === editingId ? { ...editValues, updatedAt: new Date().toISOString() } : appointment)); setEditingId(null) }
  const removeAppointment = (id) => saveAppointments(appointments.filter((appointment) => appointment.id !== id))

  return <Subpage eyebrow={`${user.role} / Incoming appointments`} title={<>Manage<br /><em>requests.</em></>}><div className="dashboard-toolbar"><p>{appointments.length} appointment{appointments.length === 1 ? '' : 's'} received</p><button className="text-btn" onClick={logout}>Sign out <span>↗</span></button></div>{appointments.length === 0 ? <div className="empty-state"><span className="big-icon">✓</span><h2>No incoming appointments.</h2><p>New requests submitted through the public appointment form will appear here.</p></div> : <div className="appointment-list">{appointments.map((appointment) => <article className="appointment-item" key={appointment.id}>{editingId === appointment.id ? <div className="appointment-edit"><input value={editValues.name} onChange={(event) => updateField('name', event.target.value)} aria-label="Patient name" /><input value={editValues.phone} onChange={(event) => updateField('phone', event.target.value)} aria-label="Phone number" /><select value={editValues.service} onChange={(event) => updateField('service', event.target.value)} aria-label="Service"><option>Pathology testing</option><option>Health screening</option><option>Home collection</option></select><select value={editValues.status} onChange={(event) => updateField('status', event.target.value)} aria-label="Status"><option>New</option><option>Confirmed</option><option>Completed</option><option>Cancelled</option></select><button className="primary-btn" onClick={saveEdit}>Save</button><button className="text-btn" onClick={() => setEditingId(null)}>Cancel</button></div> : <><div><span className="appointment-status">{appointment.status}</span><h3>{appointment.name}</h3><p>{appointment.service} · {appointment.phone}</p><small>Received {new Date(appointment.createdAt).toLocaleString()}</small></div>{user.role === 'Super Admin' && <div className="appointment-actions"><button className="text-btn" onClick={() => startEdit(appointment)}>Edit</button><button className="text-btn danger-btn" onClick={() => removeAppointment(appointment.id)}>Delete</button></div>}</>}</article>)}</div>}</Subpage>
}

function Contact() { return <Subpage eyebrow="Contact us / 04" title={<>Here when you<br /><em>need us.</em></>}><div className="contact-layout"><div className="contact-detail"><p className="lead">Come by for a visit, call us, or send a note. We are happy to help.</p><div className="detail-block"><small>VISIT</small><p>14 Green Park Avenue<br />New Delhi, 110016</p></div><div className="detail-block"><small>CALL</small><p>+91 11 4567 8900<br />hello@aurumhomeopathy.in</p></div></div><div className="map-card"><div className="map-lines" /><span className="map-pin">+</span><div className="map-label"><strong>Dr. Shelke's Aurum</strong><small>14 Green Park Avenue</small></div></div></div></Subpage> }

export default App

createRoot(document.getElementById('root')).render(<App />)
