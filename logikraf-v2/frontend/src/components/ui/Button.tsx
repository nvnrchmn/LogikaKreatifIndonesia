import type { ButtonHTMLAttributes, ReactNode } from 'react'

/**
 * Reusable button. Wraps the existing .btn-primary / .btn-secondary design
 * tokens (index.css) so every CTA stays visually consistent.
 * Nielsen #1 Visibility: clear affordance + loading state.
 * Nielsen #5 Error prevention: disabled blocks bad submits.
 */
type Variant = 'primary' | 'secondary' | 'ghost'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  loading?: boolean
  block?: boolean
  children: ReactNode
}

const cls: Record<Variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'text-brand-primary hover:underline px-2 py-1',
}

export default function Button({
  variant = 'primary',
  loading = false,
  block = false,
  className = '',
  disabled,
  children,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`${cls[variant]} ${block ? 'w-full' : ''} ${loading ? 'opacity-60 cursor-wait' : ''} ${className}`}
    >
      {loading ? 'Memproses…' : children}
    </button>
  )
}
