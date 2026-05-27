import { Link } from 'react-router-dom'
import { ArrowLeft, Zap } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center text-center p-8">
      <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center mb-8">
        <Zap className="w-8 h-8 text-white" />
      </div>
      <h1 className="font-display text-8xl font-bold text-white mb-4">404</h1>
      <h2 className="font-display text-2xl font-bold text-white mb-3">Page not found</h2>
      <p className="text-[#8888aa] mb-8 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/dashboard" className="btn-primary flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>
    </div>
  )
}
