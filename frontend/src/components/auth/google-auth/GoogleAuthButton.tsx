import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import useAuth from '../../../hooks/use-auth'
import { googleLogin } from '../../../services/auth-service'
import extractError from '../../../services/extract-error'
import { getUserHomePath } from '../../../services/auth-routing'
import './GoogleAuthButton.css'
import useLanguage from '../../../hooks/use-language'

type GoogleCredentialResponse = {
  credential: string
}

type GoogleIdApi = {
  initialize: (options: {
    client_id: string
    callback: (response: GoogleCredentialResponse) => void
  }) => void
  renderButton: (element: HTMLElement, options: Record<string, unknown>) => void
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleIdApi
      }
    }
  }
}

const GOOGLE_CREDENTIAL_EVENT = 'doha-mua:google-credential'
let googleScriptPromise: Promise<void> | undefined
let initializedClientId = ''

function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve()
  if (googleScriptPromise) return googleScriptPromise

  googleScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-doha-mua-google]')
    if (existing) {
      if (window.google?.accounts?.id) {
        resolve()
        return
      }
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Could not load Google sign-in.')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.dataset.dohaMuaGoogle = 'true'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Could not load Google sign-in.'))
    document.head.appendChild(script)
  })

  return googleScriptPromise
}

function initializeGoogleOnce(clientId: string) {
  if (!window.google?.accounts?.id) throw new Error('Google sign-in did not finish loading.')
  if (initializedClientId === clientId) return

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: response => {
      window.dispatchEvent(new CustomEvent<string>(GOOGLE_CREDENTIAL_EVENT, {
        detail: response.credential
      }))
    }
  })

  initializedClientId = clientId
}

export default function GoogleAuthButton() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { saveSession } = useAuth()
  const navigate = useNavigate()
  const {language,t}=useLanguage()

  useEffect(() => {
    if (!clientId || !containerRef.current) return
    let active = true

    const handleCredential = (event: Event) => {
      const credential = (event as CustomEvent<string>).detail
      if (!credential) return

      void googleLogin(credential)
        .then(session => {
          if (!active) return
          saveSession(session.jwt, session.user)
          navigate(getUserHomePath(session.user), { replace: true })
        })
        .catch(error => {
          if (active) toast.error(extractError(error,language))
        })
    }

    window.addEventListener(GOOGLE_CREDENTIAL_EVENT, handleCredential)

    void loadGoogleScript()
      .then(() => {
        if (!active || !containerRef.current || !window.google) return

        initializeGoogleOnce(clientId)
        containerRef.current.replaceChildren()
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          width: 320, locale: language
        })
      })
      .catch(error => {
        if (active) toast.error(extractError(error,language))
      })

    return () => {
      active = false
      window.removeEventListener(GOOGLE_CREDENTIAL_EVENT, handleCredential)
      containerRef.current?.replaceChildren()
    }
  }, [clientId, language, navigate, saveSession])

  if (!clientId) return null

  return (
    <div className="google-auth-section">
      <div className="auth-divider"><span>{t('or continue with','أو المتابعة باستخدام')}</span></div><div className="google-button" ref={containerRef} aria-label={t('Continue with Google','المتابعة باستخدام Google')} />
    </div>
  )
}
