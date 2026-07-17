import axios from 'axios'
import { getStoredJwt } from './auth-storage'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 60000
})

http.interceptors.request.use(config => {
  const jwt = getStoredJwt()

  if (jwt) {
    config.headers.Authorization = `Bearer ${jwt}`
  }

  return config
})

http.interceptors.response.use(
  response => response,
  error => {
    const requestUrl = String(error.config?.url || '')

    const isPublicAuthRequest = [
      '/auth/login',
      '/auth/register',
      '/auth/google',
      '/auth/me'
    ].some(path => requestUrl.endsWith(path))

    if (
      error.response?.status === 401 &&
      getStoredJwt() &&
      !isPublicAuthRequest
    ) {
      window.dispatchEvent(new Event('doha-mua:session-expired'))
    }

    return Promise.reject(error)
  }
)

export default http
