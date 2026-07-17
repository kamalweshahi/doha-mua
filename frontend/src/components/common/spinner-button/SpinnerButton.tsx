import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import useLanguage from '../../../hooks/use-language'
import './SpinnerButton.css'

type Props = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }>

export default function SpinnerButton({ loading, children, disabled, ...props }: Props) {
  const { t } = useLanguage()
  return (
    <button {...props} disabled={disabled || loading}>
      <span className="spinner-button-label">{loading ? t('Please wait...', 'يرجى الانتظار...') : children}</span>
    </button>
  )
}
