import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const services = [
  { icon: '◌', title: 'Pathology testing', copy: 'Accurate diagnostics, from routine blood work to specialist panels.' },
  { icon: '⌁', title: 'Health screenings', copy: 'Thoughtful preventive checkups designed around your everyday health.' },
  { icon: '✦', title: 'Home collection', copy: 'A trained phlebotomist comes to you, at a time that suits your day.' },
]

const navItems = ['Home', 'About Us', 'Services', 'Get Appointment', 'Contact Us']

function App() {
  const [screen, setScreen] = useState('Home')
  const [submitted, setSubmitted] = useState(false)

  const goTo = (nextScreen) => {
    setSubmitted(false)
    setScreen(nextScreen)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => goTo('Home')} aria-label="Go to home">
          <span className="brand-mark" aria-hidden="true"><span>+</span></span>
          <span><strong>aruna</strong><small>pathology & health</small></span>
        </button>
        <nav className="desktop-nav" aria-label="Main navigation">
          {navItems.map((item) => <button className={screen === item ? 'active' : ''} onClick={() => goTo(item)} key={item}>{item}</button>)}
        </nav>
        <button className="header-cta" onClick={() => goTo('Get Appointment')}>Book a test <span>↗</span></button>
      </header>

      <main>
        {screen === 'Home' && <Home goTo={goTo} />}
        {screen === 'About Us' && <About goTo={goTo} />}
        {screen === 'Services' && <Services goTo={goTo} />}
        {screen === 'Get Appointment' && <Appointment submitted={submitted} setSubmitted={setSubmitted} />}
        {screen === 'Contact Us' && <Contact />}
      </main>

      <footer><span>© 2026 Aruna Clinic</span><span>Care that makes clarity possible.</span><button onClick={() => goTo('Contact Us')}>Find our clinic ↗</button></footer>
    </div>
  )
}

function Home({ goTo }) {
  return <>
    <Reveal className="hero page-width">
      <div className="hero-copy">
        <p className="eyebrow"><span className="pulse-dot" /> Trusted by families since 1998</p>
        <h1>Know more.<br /><em>Feel better.</em></h1>
        <p className="hero-text">Modern diagnostics and human care, brought together under one calm roof. Your health story deserves clear answers.</p>
        <div className="hero-actions"><button className="primary-btn" onClick={() => goTo('Get Appointment')}>Book an appointment <span>↗</span></button><button className="text-btn" onClick={() => goTo('Services')}>Explore services <span>→</span></button></div>
        <div className="trust-row"><div className="avatars"><span>R</span><span>M</span><span>S</span></div><p><strong>4.9/5</strong> from 2,000+ patient visits</p></div>
      </div>
      <div className="hero-art"><div className="hero-photo" /><div className="floating-note"><span className="check">✓</span><div><strong>Results you can trust</strong><small>ISO certified laboratory</small></div></div><div className="vertical-label">EST. 1998 <i>•</i> ARUNA</div></div>
    </Reveal>
    <Reveal className="intro-band"><div className="page-width intro-grid"><p className="section-kicker">01 / The Aruna difference</p><div><h2>Healthcare that starts with <em>listening.</em></h2><p className="muted">From your first hello to the moment your report arrives, every detail is designed to make care feel simpler, warmer, and more personal.</p><button className="text-btn" onClick={() => goTo('About Us')}>Our story <span>→</span></button></div></div></Reveal>
    <Reveal className="home-story page-width">
      <div className="story-copy"><p className="section-kicker">02 / A calmer kind of care</p><h2>People first.<br /><em>Always.</em></h2><p className="muted">Meet a care team that gives every question room, every sample attention, and every result a clear next step.</p><button className="text-btn" onClick={() => goTo('About Us')}>Meet the team <span>→</span></button></div>
      <div className="story-photo story-photo-main" /><div className="story-photo story-photo-detail" /><span className="story-caption">Precision with presence</span>
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

function About({ goTo }) { return <Subpage eyebrow="About Aruna / 01" title={<>A better standard<br /><em>of care.</em></>}><div className="about-layout"><div className="about-photo" /><div className="about-copy"><p className="lead">We believe good healthcare is equal parts precision and presence.</p><p>Aruna Pathology & Health Clinic has grown from a neighborhood laboratory into a trusted care partner for thousands of families. Our team combines rigorous science with the kind of attention that helps people feel at ease.</p><div className="stats"><div><strong>25+</strong><small>years of care</small></div><div><strong>40k</strong><small>reports delivered</small></div><div><strong>98%</strong><small>on-time reports</small></div></div><button className="primary-btn" onClick={() => goTo('Get Appointment')}>Meet us for a visit <span>↗</span></button></div></div></Subpage> }

function Services({ goTo }) { return <Subpage eyebrow="Our services / 02" title={<>Care, made<br /><em>clear.</em></>}><div className="large-service-grid">{services.concat([{ icon: '⌂', title: 'Wellness packages', copy: 'Curated annual plans that make preventive care a simple habit.' }, { icon: '◍', title: 'Doctor consultations', copy: 'Speak with a qualified doctor about your results and next steps.' }]).map((service, index) => <article className="large-service" key={service.title}><span className="service-number">0{index + 1}</span><span className="service-icon">{service.icon}</span><h3>{service.title}</h3><p>{service.copy}</p><button className="text-btn" onClick={() => goTo('Get Appointment')}>Book this service <span>→</span></button></article>)}</div></Subpage> }

function Appointment({ submitted, setSubmitted }) { return <Subpage eyebrow="Get appointment / 03" title={<>Make time for<br /><em>your health.</em></>}><div className="appointment-layout"><div className="appointment-note"><span className="big-icon">✦</span><h2>One small step<br />toward feeling good.</h2><p>Complete the form and our care team will call you within one working hour to confirm your visit.</p><div className="contact-mini"><span>⏱</span><p><strong>Mon – Sat</strong><br />7:00 am – 8:00 pm</p></div></div>{submitted ? <div className="success-box"><span className="success-mark">✓</span><h2>Request received.</h2><p>Thank you. Our care team will call you shortly to confirm your appointment.</p><button className="text-btn" onClick={() => setSubmitted(false)}>Send another request <span>→</span></button></div> : <form className="appointment-form" onSubmit={(event) => { event.preventDefault(); setSubmitted(true) }}><label>Your name<input required placeholder="e.g. Ananya Sharma" /></label><label>Phone number<input required type="tel" placeholder="+91 98765 43210" /></label><label>What do you need?<select defaultValue=""><option value="" disabled>Select a service</option><option>Pathology testing</option><option>Health screening</option><option>Home collection</option></select></label><button className="primary-btn" type="submit">Request appointment <span>↗</span></button></form>}</div></Subpage> }

function Contact() { return <Subpage eyebrow="Contact us / 04" title={<>Here when you<br /><em>need us.</em></>}><div className="contact-layout"><div className="contact-detail"><p className="lead">Come by for a visit, call us, or send a note. We are happy to help.</p><div className="detail-block"><small>VISIT</small><p>14 Green Park Avenue<br />New Delhi, 110016</p></div><div className="detail-block"><small>CALL</small><p>+91 11 4567 8900<br />hello@arunacare.in</p></div></div><div className="map-card"><div className="map-lines" /><span className="map-pin">+</span><div className="map-label"><strong>Aruna Clinic</strong><small>14 Green Park Avenue</small></div></div></div></Subpage> }

export default App

createRoot(document.getElementById('root')).render(<App />)
