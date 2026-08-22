import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import CheckoutModal from '../components/ui/CheckoutModal'

const pkg = { id: 2, name: 'Logikraf Business', price: 4999000, formatted_price: 'Rp 4.999.000' }

describe('CheckoutModal', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    // antd Modal uses getComputedStyle scroll-lock; jsdom lacks it
    // @ts-expect-error test shim
    window.getComputedStyle = window.getComputedStyle || (() => ({}) as unknown)
  })

  it('does not render when closed', () => {
    render(<CheckoutModal open={false} pkg={null} onClose={() => {}} />)
    expect(screen.queryByText(/Konfirmasi Pembayaran/i)).toBeNull()
  })

  it('shows package name and price when open', async () => {
    render(<CheckoutModal open pkg={pkg} onClose={() => {}} />)
    expect(await screen.findByText('Pesan Logikraf Business')).toBeInTheDocument()
    expect(screen.getByText('Rp 4.999.000')).toBeInTheDocument()
  })

  it('submits to ipaymu snap endpoint and redirects on success', async () => {
    const fetchMock = vi.fn()
    // first call (gateways) returns empty -> fallback ipaymu; second call is snap
    fetchMock.mockImplementation(async (url: string) => {
      if (url === '/api/payment-gateways') {
        return { ok: true, json: async () => [] }
      }
      return { ok: true, json: async () => ({ redirect_url: 'https://pay.ipaymu.com/abc' }) }
    })
    vi.stubGlobal('fetch', fetchMock)
    Object.defineProperty(window, 'location', { value: { href: '' }, writable: true })

    render(<CheckoutModal open pkg={pkg} onClose={() => {}} />)
    fireEvent.change(screen.getByLabelText(/Nama Lengkap PIC/i), { target: { value: 'Budi' } })
    fireEvent.change(screen.getByLabelText(/Email Aktif/i), { target: { value: 'budi@x.com' } })
    fireEvent.change(screen.getByLabelText(/WhatsApp/i), { target: { value: '08123' } })
    fireEvent.click(screen.getByText(/Lanjut Bayar QRIS/i))

    await waitFor(() => expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(2))
    const [url, opts] = fetchMock.mock.calls[1]
    expect(url).toBe('/api/payment/ipaymu/snap')
    expect(opts.method).toBe('POST')
    const body = JSON.parse(opts.body)
    expect(body.amount).toBe(4999000)
    expect(body.first_name).toBe('Budi')
  })

  it('shows error banner when payment fails', async () => {
    const fetchMock = vi.fn()
    fetchMock.mockImplementation(async (url: string) => {
      if (url === '/api/payment-gateways') return { ok: true, json: async () => [] }
      return { ok: false, json: async () => ({ error: 'Gagal' }) }
    })
    vi.stubGlobal('fetch', fetchMock)
    render(<CheckoutModal open pkg={pkg} onClose={() => {}} />)
    fireEvent.change(screen.getByLabelText(/Nama Lengkap PIC/i), { target: { value: 'Budi' } })
    fireEvent.change(screen.getByLabelText(/Email Aktif/i), { target: { value: 'budi@x.com' } })
    fireEvent.change(screen.getByLabelText(/WhatsApp/i), { target: { value: '08123' } })
    fireEvent.click(screen.getByText(/Lanjut Bayar QRIS/i))
    expect(await screen.findByText('Gagal')).toBeInTheDocument()
  })
})
