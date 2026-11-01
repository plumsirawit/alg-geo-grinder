import { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth'
import { auth } from './firebase'
import AuthModal from './components/AuthModal'
import HartshorneBook from './assets/978-1-4757-3849-0.webp'
import VakilBook from './assets/9780691268668.jpg'
import './App.css'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [signOutError, setSignOutError] = useState('')
  const [isSigningOut, setIsSigningOut] = useState(false)

  useEffect(() => onAuthStateChanged(auth, (nextUser) => {
    setUser(nextUser)
    setAuthReady(true)
  }), [])

  async function handleSignOut() {
    setIsSigningOut(true)
    setSignOutError('')

    try {
      await signOut(auth)
    } catch (error) {
      console.error('Unable to sign out:', error)
      setSignOutError('We could not sign you out. Please try again.')
    } finally {
      setIsSigningOut(false)
    }
  }

  if (!authReady) {
    return (
      <main className="loading-screen" aria-label="Loading">
        <p>Loading your workspace…</p>
      </main>
    )
  }

  if (user) {
    const displayName = user.displayName || user.email?.split('@')[0] || 'mathematician'
    const initials = displayName
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()

    return (
      <main className="page dashboard-page" id="home">
        <header className="page-header">
          <a className="site-title" href="#home">Algebraic Geometry Grinder</a>
          <div className="account-controls">
            {user.photoURL ? (
              <img className="avatar" src={user.photoURL} alt="" referrerPolicy="no-referrer" />
            ) : (
              <span className="avatar avatar-initials" aria-hidden="true">{initials}</span>
            )}
            <span className="account-name">{displayName}</span>
            <button
              className="link-button"
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              {isSigningOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </header>

        <section className="dashboard-content">
          <h2>Welcome back, {displayName}.</h2>
          <p>A place to grind algebraic geometry, one problem at a time.</p>

          {signOutError && <p className="notice-error" role="alert">{signOutError}</p>}

          <hr />
          <h2>Your progress</h2>
          <ul className="progress-list">
            <li>Problems solved: 0</li>
          </ul>

          <h2>Your practice space</h2>
          <div style={{width: "30%", display: "flex", justifyContent: "space-around", alignItems: "center"}}>
            <a href="#" style={{width: "45.8945%"}}><img src={HartshorneBook} style={{width: "100%"}}/></a>
            <a href="#" style={{width: "49.1055%"}}><img src={VakilBook} style={{width: "100%"}}/></a>
          </div>
        </section>

        <footer className="page-footer">
          Made for curious minds. Built with grit and perseverance. By Sirawit (with Copilot GPT-6 Luna).
        </footer>
      </main>
    )
  }

  return (
    <main className="page landing-page" id="home">
      <header className="page-header">
        <a className="site-title" href="#home">Algebraic Geometry Grinder</a>
        <button className="link-button" type="button" onClick={() => setIsAuthOpen(true)}>
          Log in
        </button>
      </header>

      <section className="landing-content">
        <div className="first-row">
          <div style={{width: "70%"}}>
            <h2>There is no Royal Road to Algebraic Geometry</h2>
            <p>
              Grind. Hard. Push through.
            </p>
            <p style={{margin: "5px", fontSize: "14px", padding: "10px", borderWidth: "0px 0px 0px 5px", borderStyle: "groove"}}>
              Most students in algebraic geometry, of all flavours, go through the rite of passage known as “Hartshorne”: reading Hartshorne’s book, especially chapters 2 and 3, and solving vast numbers of exercises. It is more or less impossible, and in any case probably unwise, to avoid doing this. And once you have solved many/most of the Hartshorne problems, you should have some baseline confidence in algebraic geometry, scheme theory, and cohomology.
              <br />
              <a style={{float: "right"}} href="https://terrytao.wordpress.com/career-advice/learn-and-relearn-your-field/comment-page-1/#comment-32483">—Matthew Emerton</a>
            </p>
          </div>
          <div style={{width: "30%", display: "flex", justifyContent: "space-around", alignItems: "center"}}>
            <img src={HartshorneBook} style={{width: "45.8945%"}} />
            <img src={VakilBook} style={{width: "49.1055%"}} />
          </div>
        </div>
        <br />
        <button className="primary-button" type="button" onClick={() => setIsAuthOpen(true)}>
          Get started
        </button>
      </section>

      <footer className="page-footer">Made for curious minds. Built with grit and perseverance. By Sirawit (with Copilot GPT-6 Luna).</footer>

      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}
    </main>
  )
}

export default App
