import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Error no controlado:', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="app-shell items-center justify-center px-6 text-center">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
          <AlertTriangle size={28} />
        </span>
        <h1 className="font-display text-lg font-semibold text-ink-900">Algo salió mal</h1>
        <p className="mt-1.5 text-[14px] text-ink-500">
          Ocurrió un error inesperado. Intenta recargar la página.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="tap-scale mt-5 rounded-xl bg-brand-600 px-5 py-3 text-[14px] font-semibold text-white active:bg-brand-700"
        >
          Recargar
        </button>
      </div>
    )
  }
}
