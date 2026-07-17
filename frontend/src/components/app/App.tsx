import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AuthProvider from '../auth/auth/AuthProvider'
import AppErrorBoundary from '../common/error-boundary/AppErrorBoundary'
import Layout from '../layout/layout/Layout'
import '../../style.css'
import './App.css'
import { LanguageProvider } from '../../hooks/use-language'
import Intro from '../common/Intro'
import { WebsiteContentProvider } from '../../hooks/use-website-content'

export default function App() {
  return (
    <BrowserRouter>
      <AppErrorBoundary>
        <LanguageProvider><WebsiteContentProvider><AuthProvider>
          <Intro />
          <Toaster position="top-right" />
          <Layout />
        </AuthProvider></WebsiteContentProvider></LanguageProvider>
      </AppErrorBoundary>
    </BrowserRouter>
  )
}
