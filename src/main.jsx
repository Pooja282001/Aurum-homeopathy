import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const services = [
  { icon: '◌', title: 'Skin & Hair Care', copy: 'Gentle, natural treatment for Eczema, Psoriasis, Acne, and Hair Loss in Pimple Saudagar.' },
  { icon: '⌁', title: 'Chronic Disorders', copy: 'Root-cause relief for Thyroid Imbalance, Joint Pain, Arthritis, and Chronic Migraines.' },
  { icon: '✦', title: 'Women & Child Care', copy: 'Targeted homeopathic solutions for PCOS/PCOD, Menstrual Health, and Pediatric Immunity.' },
]

const navItems = ['Home', 'About Us', 'Services', 'Get Appointment', 'Contact Us']
const APPOINTMENTS_KEY = 'shelkes-aurum-appointments'
const STAFF_SESSION_KEY = 'shelkes-aurum-staff-user'
const clinicTimeSlots = [
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM'
]
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
    return () => {
      if (appointmentRedirectTimerRef.current) {
        window.clearTimeout(appointmentRedirectTimerRef.current)
      }
    }
  }, [])

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
    localStorage.setItem(STAFF_SESSION_KEY, JSON.stringify(user))
    goTo('Staff Dashboard')
    return true
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

      <main>
        {screen === 'Home' && <Home goTo={goTo} triggerAppointmentPopup={triggerAppointmentPopup} />}
        {screen === 'About Us' && <About goTo={goTo} />}
        {screen === 'Services' && <Services goTo={goTo} triggerAppointmentPopup={triggerAppointmentPopup} />}
        {screen === 'Get Appointment' && <Appointment submitted={submitted} setSubmitted={setSubmitted} addAppointment={addAppointment} />}
        {screen === 'Contact Us' && <Contact />}
        {screen === 'Staff Login' && <StaffLogin login={login} />}
        {screen === 'Staff Dashboard' && currentUser && <StaffDashboard user={currentUser} appointments={appointments} saveAppointments={saveAppointments} logout={() => { setCurrentUser(null); localStorage.removeItem(STAFF_SESSION_KEY); goTo('Home') }} />}
      </main>

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

function Contact() { return <div id="contact"><Subpage eyebrow="Contact us / 04" title={<>Here when you<br /><em>need us.</em></>}><div className="contact-layout"><div className="contact-detail"><p className="lead">Come by for a visit, call us, or send a note. We are happy to help.</p><div className="detail-block"><small>VISIT</small><p>2nd Floor, Vision Gallaria,<br />Kunal Icon Road, Pimple Saudagar,<br />Pimpri-Chinchwad, Pune 411027</p></div><div className="detail-block"><small>CALL</small><p>+91 9145692117<br />aurumhomeopathy4@gmil.com</p></div><a className="contact-call-btn" href="tel:+919145692117">Call 9145692117 <span>↗</span></a></div><div className="map-card"><div className="map-lines" /><span className="map-pin">+</span><div className="map-label"><strong>Dr. Shelke's Aurum</strong><small>2nd Floor, Vision Gallaria</small></div></div></div></Subpage></div> }

export default App

createRoot(document.getElementById('root')).render(<App />)
