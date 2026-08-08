import React from 'react'

const variants = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all',
  secondary: 'bg-white hover:bg-accent/80 text-primary border border-primary shadow-sm hover:shadow-md transition-all',
  danger: 'bg-destructive hover:bg-destructive/90 text-white shadow-sm hover:shadow-md transition-all',
  success: 'bg-success hover:bg-success/90 text-white shadow-sm hover:shadow-md transition-all',
  warning: 'bg-warning hover:bg-warning/90 text-white shadow-sm hover:shadow-md transition-all',
  outline: 'border border-primary text-primary hover:bg-primary hover:text-primary-foreground shadow-sm hover:shadow-md transition-all',
  'outline-danger': 'border border-destructive text-destructive hover:bg-destructive hover:text-white shadow-sm hover:shadow-md transition-all',
  ghost: 'text-muted-foreground hover:bg-accent hover:text-foreground',
  dark: 'bg-foreground hover:bg-foreground/90 text-background shadow-sm hover:shadow-md transition-all',
}

const sizes = {
  sm: 'px-4 py-2 type-primary-body-b3 rounded-md lg:rounded-lg',
  md: 'px-5 py-2.5 type-primary-body-b2 md:type-primary-body-b1 rounded-md lg:rounded-lg',
  lg: 'px-6 py-3 type-primary-body-b2 md:type-primary-body-b1 rounded-md lg:rounded-lg',
  icon: 'p-2.5 rounded-md lg:rounded-lg',
  'icon-sm': 'p-2 rounded-md',
}

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  icon = null,
  expandableLabel = null,
  ...props
}) => {
  const isExpandable = !!expandableLabel

  return (
    <button
      disabled={disabled || loading}
      className={`
        font-semibold transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
        inline-flex items-center justify-center
        type-primary-body-b2-medium md:type-primary-body-b1-medium 
        ${variants[variant] || variants.primary}
        ${isExpandable ? 'p-2.5 text-xs rounded-lg group overflow-hidden' : (sizes[size] || sizes.md)}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" fill="none" />
            <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Please Wait...
        </span>
      ) : isExpandable ? (
        <div className="flex items-center justify-center">
          {icon}
          <span className="max-w-0 overflow-hidden opacity-0 whitespace-nowrap transition-all duration-300 ease-in-out group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-2">
            {expandableLabel}
          </span>
        </div>
      ) : (
        children
      )}
    </button>
  )
}

export default Button
