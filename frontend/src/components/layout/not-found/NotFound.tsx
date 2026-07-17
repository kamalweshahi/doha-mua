import { Link } from 'react-router-dom'
import './NotFound.css'
import useLanguage from '../../../hooks/use-language'

export default function NotFound() {
  const {tr}=useLanguage()
  return (
    <section className="panel center not-found">
      <h1>{tr('pageNotFound')}</h1><p>{tr('pageMissing')}</p><Link className="button-link" to="/">{tr('backHome')}</Link>
    </section>
  )
}
