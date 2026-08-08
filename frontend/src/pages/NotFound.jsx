import React from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import PublicLayout from '@/components/layout/PublicLayout'
import Button from '@/components/ui/Button'
import { ShieldCheck, AlertCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <PublicLayout>
      <div className="bg-accent min-h-[calc(100vh-100px)] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="absolute top-1/4 -right-20 w-72 h-72 rounded-full border border-border pointer-events-none opacity-50" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full border border-border pointer-events-none opacity-50" />
        
        <div className="inline-flex items-center gap-1.5 bg-tertiary px-3 py-1 rounded-full text-[10px] text-tertiary-foreground w-fit mb-6">
          <AlertCircle size={12} className="text-secondary" />
          404 Error
        </div>
        
        <h1 className="font-serif text-[120px] leading-none text-tertiary tracking-tight mb-4 opacity-10">
          404
        </h1>
        
        <h2 className="font-serif text-3xl text-tertiary mb-3">Page Not Found</h2>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-8 leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        <Link to={ROUTES.HOME}>
          <Button size="lg" className="shadow-[0_8px_30px_rgba(37,99,235,0.3)]">
            Go Back Home
          </Button>
        </Link>
      </div>
    </PublicLayout>
  )
}
