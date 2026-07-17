import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from 'react'
import './AppErrorBoundary.css'

type State = { error?: Error }

export default class AppErrorBoundary extends Component<PropsWithChildren, State> {
  state: State = {}

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('DOHA MUA UI error:', error, info)
  }

  render(): ReactNode {
    if (!this.state.error) return this.props.children

    const ar = localStorage.getItem('doha-mua-language') === 'ar'
    return (
      <main className="app-error-page">
        <section className="panel center">
          <p className="eyebrow">{ar?'حدث خطأ':'Something went wrong'}</p><h1>{ar?'تعذر عرض هذه الصفحة.':'We could not display this page.'}</h1><p>{ar?'يرجى تحديث الصفحة. حسابك ودوراتك ما زالت آمنة.':'Please refresh the page. Your account and course library are still safe.'}</p><button onClick={() => window.location.reload()}>{ar?'تحديث DOHA MUA':'Refresh DOHA MUA'}</button>
        </section>
      </main>
    )
  }
}
