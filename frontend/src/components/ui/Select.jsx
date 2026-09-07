import React, { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
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
  onClick: onClickProp,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(value ?? defaultValue ?? '')
  const [dropdownStyle, setDropdownStyle] = useState({})
  const containerRef = useRef(null)
  const dropdownRef = useRef(null)
  const buttonRef = useRef(null)

  const generatedId = React.useId()
  const selectId = idProp || (name ? `select-${name}` : generatedId)

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value)
    }
  }, [value])

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownStyle({
        top: rect.bottom + 4,
        left: rect.left,
        minWidth: rect.width,
      })
    }
  }, [isOpen])

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
    default: 'h-12 text-sm px-3 pr-8',
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
      if (
        containerRef.current && !containerRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const handleScroll = (e) => {
      if (
        containerRef.current && !containerRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false)
      }
    }
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
          onClick={(e) => { if (!disabled) { setIsOpen(!isOpen); onClickProp?.(e) } }}
          className={`
            peer w-full flex items-center justify-between border rounded-lg bg-white text-left
            outline-none focus:border-primary focus:ring-1 focus:ring-primary
            transition
            ${sizeClasses[size] || sizeClasses.default}
            ${Icon ? 'pl-9' : ''}
            ${label ? 'pt-4 pb-2' : ''}
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
        {label && (
          <label
            htmlFor={selectId}
            className={`
              pointer-events-none absolute z-10 bg-white px-1 type-primary-body-b3 text-muted-foreground transition-all
              ${Icon ? 'left-9' : 'left-3'}
              ${selectedOption ? 'top-0 -translate-y-1/2 text-primary' : 'top-1/2 -translate-y-1/2 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-primary'}
              ${error ? 'text-destructive peer-focus:text-destructive' : ''}
            `}
          >
            {label}
            {required && <span className="ml-0.5">*</span>}
          </label>
        )}
        <ChevronDown
          size={16}
          className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />

        {isOpen && createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[9999] bg-white border border-border rounded-lg shadow-lg max-h-60 overflow-auto animate-in fade-in-0 zoom-in-95"
            style={dropdownStyle}
          >
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
          </div>,
          document.body
        )}
      </div>
      {error && <p className="text-destructive text-xs mt-1.5 font-medium">{error}</p>}
    </div>
  )
}

export default Select
