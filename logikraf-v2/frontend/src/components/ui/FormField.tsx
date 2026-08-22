import type { InputHTMLAttributes, ReactNode } from 'react'

/**
 * Reusable labelled input with error + required marker.
 * Nielsen #4 Consistency: same look as .form-input everywhere.
 * Nielsen #5 Error prevention: inline error text + aria-invalid.
 * Nielsen #9 Help: placeholder + hint guide the user.
 */
interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export default function FormField({ label, error, hint, required, id, className = '', ...rest }: Props) {
  const fieldId = id || `f-${label.replace(/\s+/g, '-').toLowerCase()}`
  return (
    <div>
      <label htmlFor={fieldId} className="text-xs font-bold text-text-main mb-1 block">
        {label} {required && <span className="text-rose-600">*</span>}
      </label>
      <input
        id={fieldId}
        required={required}
        aria-invalid={!!error}
        className={`form-input text-xs sm:text-sm ${error ? 'form-input-error' : ''} ${className}`}
        {...rest}
      />
      {hint && !error && <p className="text-[11px] text-text-muted mt-1">{hint}</p>}
      {error && <p className="text-[11px] text-rose-600 mt-1">{error}</p>}
    </div>
  )
}
