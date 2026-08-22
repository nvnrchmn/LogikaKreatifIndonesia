import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Button from '../components/ui/Button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Pesan</Button>)
    expect(screen.getByText('Pesan')).toBeInTheDocument()
  })

  it('applies primary variant class', () => {
    render(<Button variant="primary">X</Button>)
    expect(screen.getByText('X').className).toContain('btn-primary')
  })

  it('shows loading text and is disabled while loading', () => {
    render(<Button loading>Kirim</Button>)
    const btn = screen.getByText('Memproses…')
    expect(btn).toBeDisabled()
  })

  it('calls onClick', () => {
    const fn = vi.fn()
    render(<Button onClick={fn}>Klik</Button>)
    fireEvent.click(screen.getByText('Klik'))
    expect(fn).toHaveBeenCalledOnce()
  })
})
