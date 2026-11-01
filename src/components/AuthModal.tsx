import { useEffect, useRef, useState, type FormEvent } from 'react'
import { FirebaseError } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  type AuthProvider,
} from 'firebase/auth'
import { auth } from '../firebase'

type AuthMode = 'login' | 'signup'
type ProviderName = 'Google' | 'GitHub'

interface AuthModalProps {
  onClose: () => void
}

function getErrorMessage(error: unknown): string {
  if (!(error instanceof FirebaseError)) {
    return 'Something went wrong. Please try again.'
  }

  switch (error.code) {
    case 'auth/invalid-email':
      return 'That email address does not look right.'
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'That email and password combination was not recognized.'
    case 'auth/email-already-in-use':
      return 'An account already exists for that email. Try logging in instead.'
    case 'auth/weak-password':
      return 'Choose a password with at least 6 characters.'
    case 'auth/popup-closed-by-user':
      return 'The sign-in window was closed before you finished.'
    case 'auth/popup-blocked':
      return 'Your browser blocked the sign-in window. Allow pop-ups and try again.'
    case 'auth/unauthorized-domain':
      return 'This site is not authorized for sign-in yet. Add its domain in Firebase Authentication settings.'
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled in Firebase Authentication yet.'
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email. Sign in using its original method.'
    default:
      return 'We could not complete sign-in. Please try again.'
  }
}

function AuthModal({ onClose }: AuthModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isWorking, setIsWorking] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    dialog.showModal()
    return () => dialog.close()
  }, [])

  async function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setIsWorking(true)

    try {
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsWorking(false)
    }
  }

  async function signInWithProvider(providerName: ProviderName) {
    setErrorMessage('')
    setIsWorking(true)

    const provider: AuthProvider = providerName === 'Google'
      ? new GoogleAuthProvider()
      : new GithubAuthProvider()

    try {
      await signInWithPopup(auth, provider)
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsWorking(false)
    }
  }

  function changeMode(nextMode: AuthMode) {
    setErrorMessage('')
    setMode(nextMode)
  }

  return (
    <dialog
      ref={dialogRef}
      className="auth-modal"
      onCancel={(event) => {
        event.preventDefault()
        if (!isWorking) onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !isWorking) onClose()
      }}
    >
      <button
        className="modal-close"
        type="button"
        onClick={onClose}
        aria-label="Close sign-in dialog"
        disabled={isWorking}
      >
        ×
      </button>
      <span className="wordmark-symbol modal-mark" aria-hidden="true">AG</span>
      <p className="eyebrow">{mode === 'login' ? 'WELCOME BACK' : 'A GOOD PLACE TO BEGIN'}</p>
      <h2 id="auth-title">{mode === 'login' ? 'Log in to your workspace.' : 'Make some room for ideas.'}</h2>
      <p className="modal-description">
        {mode === 'login'
          ? 'Pick up where your curiosity left off.'
          : 'Create an account to save your place and progress.'}
      </p>

      <div className="provider-buttons">
        <button
          className="provider-button"
          type="button"
          onClick={() => signInWithProvider('Google')}
          disabled={isWorking}
        >
          <span className="google-mark" aria-hidden="true">G</span>
          {isWorking ? 'Please wait…' : 'Continue with Google'}
        </button>
        <button
          className="provider-button"
          type="button"
          onClick={() => signInWithProvider('GitHub')}
          disabled={isWorking}
        >
          <svg className="github-mark" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.31-3.76-1.31-.5-1.28-1.24-1.62-1.24-1.62-1.01-.7.08-.69.08-.69 1.12.08 1.7 1.15 1.7 1.15 1 .1.73 2.45 3.45 1.85a3.98 3.98 0 0 1 1.18-2.5c-2.48-.28-5.09-1.24-5.09-5.52 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.15a10.6 10.6 0 0 1 5.55 0c2.11-1.45 3.05-1.15 3.05-1.15.61 1.54.23 2.68.11 2.96.72.78 1.15 1.78 1.15 3 0 4.29-2.61 5.24-5.1 5.52.4.35.75 1.03.75 2.08v3.09c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
          </svg>
          {isWorking ? 'Please wait…' : 'Continue with GitHub'}
        </button>
      </div>

      <div className="form-divider"><span>or with email</span></div>

      <form className="email-form" onSubmit={submitEmail}>
        <label htmlFor="auth-email">Email address</label>
        <input
          id="auth-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
          disabled={isWorking}
        />
        <label htmlFor="auth-password">Password</label>
        <input
          id="auth-password"
          type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 6 characters"
          minLength={6}
          required
          disabled={isWorking}
        />
        {errorMessage && <p className="auth-error" role="alert">{errorMessage}</p>}
        <button className="button button-primary email-submit" type="submit" disabled={isWorking}>
          {isWorking
            ? 'One moment…'
            : mode === 'login'
              ? 'Log in with email'
              : 'Create account'}
        </button>
      </form>

      <p className="mode-switch">
        {mode === 'login' ? 'New here?' : 'Already have an account?'}
        {' '}
        <button
          className="inline-button"
          type="button"
          onClick={() => changeMode(mode === 'login' ? 'signup' : 'login')}
          disabled={isWorking}
        >
          {mode === 'login' ? 'Create an account' : 'Log in'}
        </button>
      </p>
      <p className="privacy-note">By continuing, you agree to use this space thoughtfully.</p>
    </dialog>
  )
}

export default AuthModal
