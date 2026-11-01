import { useCallback, useEffect, useState } from 'react'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth'
import HartshorneBook from './assets/978-1-4757-3849-0.webp'
import VakilBook from './assets/9780691268668.jpg'
import AuthModal from './components/AuthModal'
import ExerciseBrowser from './components/ExerciseBrowser'
import ExerciseWorkspace from './components/ExerciseWorkspace'
import { auth } from './firebase'
import { bookDetails, type BookId, type Exercise } from './exercises'
import './App.css'
import 'katex/dist/katex.min.css'

const bookCovers: Record<BookId, string> = {
  hartshorne: HartshorneBook,
  vakil: VakilBook,
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [signOutError, setSignOutError] = useState('')
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [selectedBook, setSelectedBook] = useState<BookId | null>(null)
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)

  useEffect(() => onAuthStateChanged(auth, (nextUser) => {
    setUser(nextUser)
    setAuthReady(true)
  }), [])

  const handleSelectExercise = useCallback((exercise: Exercise | null) => {
    setSelectedExercise(exercise)
  }, [])

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

  function chooseBook(bookId: BookId) {
    setSelectedBook(bookId)
    setSelectedExercise(null)
  }

  function returnToBooks() {
    setSelectedBook(null)
    setSelectedExercise(null)
  }

  if (!authReady) {
    return (
      <main className="loading-screen" aria-label="Loading">
        <p>Loading your workspace…</p>
      </main>
    )
  }

  if (!user) {
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
            <div className="landing-copy">
              <h2>There is no Royal Road to Algebraic Geometry</h2>
              <p>Grind. Hard. Push through.</p>
              <blockquote className="landing-quote">
                Most students in algebraic geometry, of all flavours, go through
                the rite of passage known as “Hartshorne”: reading Hartshorne’s
                book, especially chapters 2 and 3, and solving vast numbers of
                exercises. It is more or less impossible, and in any case
                probably unwise, to avoid doing this. And once you have solved
                many/most of the Hartshorne problems, you should have some
                baseline confidence in algebraic geometry, scheme theory, and
                cohomology.
                <a
                  href="https://terrytao.wordpress.com/career-advice/learn-and-relearn-your-field/comment-page-1/#comment-32483"
                  rel="noreferrer"
                  target="_blank"
                >
                  —Matthew Emerton
                </a>
              </blockquote>
            </div>
            <div className="landing-books" aria-label="Featured books">
              <img src={HartshorneBook} alt="Hartshorne's Algebraic Geometry book cover" />
              <img src={VakilBook} alt="Vakil's The Rising Sea book cover" />
            </div>
          </div>
          <button className="primary-button" type="button" onClick={() => setIsAuthOpen(true)}>
            Get started
          </button>
        </section>

        <footer className="page-footer">
          A noncommercial educational project. Made for curious minds. Built with grit and perseverance.
          <br />
          Exercise sources and rights notices appear alongside each statement.
        </footer>

        {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}
      </main>
    )
  }

  return (
    <main className="page dashboard-page" id="home">
      <header className="page-header">
        <a className="site-title" href="#home" onClick={returnToBooks}>
          Algebraic Geometry Grinder
        </a>
        <div className="account-controls">
          {user.photoURL ? (
            <img className="avatar" src={user.photoURL} alt="" referrerPolicy="no-referrer" />
          ) : (
            <span className="avatar avatar-initials" aria-hidden="true">
              {(user.displayName || user.email || 'U').slice(0, 1).toUpperCase()}
            </span>
          )}
          <span className="account-name">{user.displayName || user.email}</span>
          <button
            className="link-button"
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            {isSigningOut ? 'Signing out…' : 'Log out'}
          </button>
        </div>
      </header>
      {signOutError && <p className="notice-error" role="alert">{signOutError}</p>}

      {!selectedBook ? (
        <section className="dashboard-content book-selection">
          <h1>Your practice space</h1>
          <p>Choose a book to browse its exercises.</p>
          <div className="book-grid">
            {(Object.keys(bookDetails) as BookId[]).map((bookId) => (
              <button
                className="book-card"
                key={bookId}
                type="button"
                onClick={() => chooseBook(bookId)}
              >
                <span className="book-cover">
                  <img src={bookCovers[bookId]} alt="" />
                </span>
                <span className="book-info">
                  <strong>{bookDetails[bookId].title}</strong>
                  <span>{bookDetails[bookId].author}</span>
                </span>
                <span className="book-arrow" aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section className={`dashboard-content book-content${selectedExercise ? ' has-exercise' : ''}`}>
          <nav className="workspace-breadcrumbs" aria-label="Breadcrumb">
            <button type="button" className="link-button" onClick={returnToBooks}>Books</button>
            <span aria-hidden="true">/</span>
            <span>{bookDetails[selectedBook].title}</span>
            {selectedExercise && (
              <>
                <span aria-hidden="true">/</span>
                <span>Exercise {selectedExercise.label}</span>
              </>
            )}
          </nav>

          <div className="book-heading">
            <div>
              <h1>{bookDetails[selectedBook].title}</h1>
              <p>{bookDetails[selectedBook].author}</p>
            </div>
            {selectedExercise && (
              <button
                className="link-button back-to-list"
                type="button"
                onClick={() => setSelectedExercise(null)}
              >
                Back to exercises
              </button>
            )}
          </div>

          <ExerciseBrowser
            key={selectedBook}
            bookId={selectedBook}
            selectedExerciseId={selectedExercise?.id ?? null}
            onSelectExercise={handleSelectExercise}
          />

          {selectedExercise && (
            <ExerciseWorkspace
              key={`${user.uid}:${selectedExercise.id}`}
              userId={user.uid}
              exercise={selectedExercise}
            />
          )}
        </section>
      )}

      <footer className="page-footer">
        A noncommercial educational project. Made for curious minds. Built with grit and perseverance.
        <br />
        Exercise sources and rights notices appear alongside each statement.
      </footer>
    </main>
  )
}

export default App
