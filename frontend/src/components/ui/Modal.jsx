import React, { useEffect, useRef, useCallback, useId } from 'react'
import { X } from 'lucide-react'

const Modal = ({ open, onClose, title, subtitle, headerActions, children, size = 'md', className = '' }) => {
  const modalRef = useRef(null)
  const previousFocusRef = useRef(null)
  const generatedId = useId()
  const titleId = title ? `modal-title-${generatedId}` : undefined
  const subtitleId = subtitle ? `modal-subtitle-${generatedId}` : undefined

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      previousFocusRef.current = document.activeElement
      setTimeout(() => {
        if (modalRef.current) {
          const focusable = modalRef.current.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
          if (focusable) focusable.focus()
        }
      }, 100)
    } else {
      document.body.style.overflow = 'auto'
      if (previousFocusRef.current && previousFocusRef.current.focus) {
        previousFocusRef.current.focus()
      }
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [open])

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose()
        return
      }
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, handleKeyDown])

  if (!open) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-5xl',
  }

  return (
    <div
      className="fixed inset-0 bg-primary/20 z-50 flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={subtitleId}
    >
      <div
        ref={modalRef}
        className={`bg-white border border-border rounded-xl w-full ${sizeClasses[size] || sizeClasses.md} max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden ${className}`}
      >
        {(title || onClose) && (
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-border rounded-t-xl shrink-0">
            <div className="min-w-0">
              {title && (
                <h2 id={titleId} className="font-serif text-base sm:text-lg text-foreground truncate">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p id={subtitleId} className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 truncate">
                  {subtitle}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              {headerActions}
              {headerActions && onClose && (
                <div className="w-px h-4 bg-border" />
              )}
              {onClose && (
                <button
                  onClick={onClose}
                  aria-label="Close modal"
                  className="text-muted-foreground hover:text-foreground transition p-1"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        )}
        <div className="p-4 sm:p-5 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal
