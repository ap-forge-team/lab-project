import React from 'react'
import { Eye, EyeOff } from 'lucide-react'

const Input = ({
  label,
  icon: Icon,
  error,
  className = '',
  containerClassName = '',
  name,
  id: idProp,
  placeholder,
  required = false,
  type,
  ...props
}) => {
  const generatedId = React.useId()
  const inputId = idProp || (name ? `input-${name}` : generatedId)
  const floatingLabel = label || placeholder
  const hasFloatingLabel = Boolean(floatingLabel)
  const isDateField = type === 'date'
  const isPasswordField = type === 'password'
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false)

  return (
    <div className={containerClassName}>
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground">
            <Icon size={16} />
          </span>
        )}
        <input
          id={inputId}
          name={name}
          type={isPasswordField && isPasswordVisible ? 'text' : type}
          required={required}
          placeholder={hasFloatingLabel ? ' ' : placeholder}
          className={`
            peer w-full border border-border rounded-lg px-4 py-3
            outline-none focus:border-primary focus:ring-1 focus:ring-primary type-primary-body-b2 md:type-primary-body-b1 placeholder:type-primary-body-b2 md:placeholder:type-primary-body-b1 text-foreground bg-card transition
            ${hasFloatingLabel ? 'pt-4 pb-2' : ''}
            ${Icon ? 'pl-10' : ''}
            ${isPasswordField ? 'pr-10' : ''}
            ${error ? 'border-destructive focus:border-destructive focus:ring-destructive' : ''}
            ${className}
          `}
          {...props}
        />
        {hasFloatingLabel && (
          <label
            htmlFor={inputId}
            className={`
              pointer-events-none absolute z-10 bg-card px-1 type-primary-body-b3 text-muted-foreground transition-all
              ${Icon ? 'left-9' : 'left-3'}
              ${isDateField ? 'top-0 -translate-y-1/2 text-primary' : 'top-1/2 -translate-y-1/2 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-primary peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:-translate-y-1/2'}
              ${error ? 'text-destructive peer-focus:text-destructive' : ''}
            `}
          >
            {floatingLabel}
            {required && <span className="ml-0.5">*</span>}
          </label>
        )}
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setIsPasswordVisible((visible) => !visible)}
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground transition hover:text-primary"
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
          >
            {isPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p className="text-destructive type-primary-body-b3 mt-1.5 font-medium">{error}</p>}
    </div>
  )
}

export default Input
