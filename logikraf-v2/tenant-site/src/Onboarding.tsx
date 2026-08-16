import { useState } from 'react'

export default function Onboarding() {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [template, setTemplate] = useState('professional')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  function slugify(s: string) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  async function submit() {
    setLoading(true)
    setMsg('')
    const token = localStorage.getItem('token') || ''
    const res = await fetch('/api/tenants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ slug: slug || slugify(name), business_name: name, template }),
    })
    const data = await res.json()
    if (res.ok) {
      setMsg(`Berhasil! Website: https://${slug || slugify(name)}.logikraf.id`)
    } else {
      setMsg('Gagal: ' + (data.error || 'unknown'))
    }
    setLoading(false)
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Buat Website Bisnis</h1>
      <label className="block text-sm mb-1">Nama Bisnis</label>
      <input
        className="w-full border rounded p-2 mb-3"
        value={name}
        onChange={(e) => { setName(e.target.value); setSlug(slugify(e.target.value)) }}
        placeholder="Bengkel Maju"
      />
      <label className="block text-sm mb-1">Subdomain</label>
      <div className="flex items-center mb-3">
        <input className="w-full border rounded p-2" value={slug} onChange={(e) => setSlug(e.target.value)} />
        <span className="ml-2 text-slate-500">.logikraf.id</span>
      </div>
      <label className="block text-sm mb-1">Template</label>
      <select className="w-full border rounded p-2 mb-4" value={template} onChange={(e) => setTemplate(e.target.value)}>
        <option value="professional">Professional</option>
        <option value="local">Local Business</option>
        <option value="product">Product Business</option>
        <option value="service">Service & Booking</option>
      </select>
      <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={submit} disabled={loading}>
        {loading ? 'Membuat...' : 'Buat Website'}
      </button>
      {msg && <p className="mt-4 text-sm text-green-600">{msg}</p>}
    </div>
  )
}
