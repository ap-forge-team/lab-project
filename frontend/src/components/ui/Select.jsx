import React, { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronDown, Check } from 'lucide-react'

const Select = ({
  label,
  icon: Icon,
  error,
  children,
  className = '',
  containerClassName = '',
  name,
  id: idProp,
  required = false,
  value,
  defaultValue,
  onChange,
  placeholder,
  options = [],
  size = 'default',
  disabled = false,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(value ?? defaultValue ?? '')
  const containerRef = useRef(null)
  const buttonRef = useRef(null)

  const generatedId = React.useId()
  const selectId = idProp || (name ? `select-${name}` : generatedId)

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value)
    }
  }, [value])

  const allOptions = React.useMemo(() => {
    if (options.length > 0) return options
    return React.Children.toArray(children)
      .filter((child) => React.isValidElement(child) && child.type === 'option')
      .map((child) => ({
        value: child.props.value,
        label: child.props.children,
      }))
  }, [options, children])

  const selectedOption = allOptions.find((opt) => String(opt.value) === String(selectedValue))
  const displayText = selectedOption?.label || placeholder || 'Select'

  const sizeClasses = {
    sm: 'h-7 text-xs px-2.5 pr-7',
    default: 'h-10 text-sm px-3 pr-8',
  }

  const handleSelect = useCallback(
    (optionValue) => {
      setSelectedValue(optionValue)
      setIsOpen(false)
      if (onChange) {
        const syntheticEvent = {
          target: { name, value: optionValue },
        }
        onChange(syntheticEvent)
      }
    },
    [name, onChange]
  )

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const handleScroll = () => setIsOpen(false)
    window.addEventListener('scroll', handleScroll, true)
    return () => window.removeEventListener('scroll', handleScroll, true)
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  return (
    <div className={containerClassName} ref={containerRef}>
      {label && (
        <label
          htmlFor={selectId}
          className={`text-sm font-medium text-foreground mb-1.5 block ${error ? 'text-destructive' : ''}`}
        >
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground">
            <Icon size={16} />
          </span>
        )}
        <button
          ref={buttonRef}
          id={selectId}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`
            w-full flex items-center justify-between border rounded-lg bg-white text-left
            outline-none focus:border-primary focus:ring-1 focus:ring-primary
            transition
            ${sizeClasses[size] || sizeClasses.default}
            ${Icon ? 'pl-9' : ''}
            ${error ? 'border-destructive focus:border-destructive focus:ring-destructive' : 'border-border'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${!selectedOption ? 'text-muted-foreground' : 'text-foreground'}
            ${className}
          `}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          {...props}
        >
          <span className="truncate">{displayText}</span>
        </button>
        <ChevronDown
          size={16}
          className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />

        {isOpen && (
          <div className="absolute z-50 bottom-full mb-1 right-0 min-w-full bg-white border border-border rounded-lg shadow-lg max-h-60 overflow-auto animate-in fade-in-0 zoom-in-95">
            <ul role="listbox" className="py-1">
              {allOptions.length === 0 ? (
                <li className="px-3 py-2 text-sm text-muted-foreground text-center">No options</li>
              ) : (
                allOptions.map((opt) => {
                  const isSelected = String(opt.value) === String(selectedValue)
                  return (
                    <li
                      key={opt.value}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(opt.value)}
                      className={`
                        flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition whitespace-nowrap
                        ${isSelected ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-accent'}
                      `}
                    >
                      <span className="flex-1">{opt.label}</span>
                      {isSelected && <Check size={14} className="text-primary shrink-0" />}
                    </li>
                  )
                })
              )}
            </ul>
          </div>
        )}
      </div>
      {error && <p className="text-destructive text-xs mt-1.5 font-medium">{error}</p>}
    </div>
  )
}

export default Select
