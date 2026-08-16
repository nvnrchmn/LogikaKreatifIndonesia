import { useEffect, useState } from 'react'

interface PageView {
  id: number
  slug: string
  title: string
  sections: { id: number; type: string; content_json: string }[]
}

export default function Admin() {
  const [pages, setPages] = useState<PageView[]>([])
  const [tenantId, setTenantId] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    // admin: list pages for a tenant (pass ?tenant_id=)
    const tid = new URLSearchParams(location.search).get('tenant_id') || '1'
    setTenantId(tid)
    fetch(`/api/pages?tenant_id=${tid}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } })
      .then((r) => r.json())
      .then(setPages)
      .catch(() => setMsg('Gagal load pages'))
  }, [])

  async function saveSection(sectionId: number, content: any) {
    const res = await fetch(`/api/sections/${sectionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      body: JSON.stringify({ content_json: JSON.stringify(content) }),
    })
    setMsg(res.ok ? 'Tersimpan' : 'Gagal simpan')
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">CMS Admin — Tenant #{tenantId}</h1>
      {msg && <p className="text-sm text-green-600 mb-3">{msg}</p>}
      {pages.map((p) => (
        <div key={p.id} className="border rounded-xl p-4 mb-4">
          <h2 className="font-semibold mb-2">{p.title} <span className="text-xs text-slate-400">({p.slug})</span></h2>
          {p.sections.map((s) => (
            <SectionEditor key={s.id} section={s} onSave={(c) => saveSection(s.id, c)} />
          ))}
        </div>
      ))}
    </div>
  )
}

function SectionEditor({ section, onSave }: { section: any; onSave: (c: any) => void }) {
  const [content, setContent] = useState(() => {
    try { return JSON.parse(section.content_json) } catch { return {} }
  })
  return (
    <div className="mb-3 pl-3 border-l-2">
      <label className="text-xs text-slate-500 block mb-1">{section.type}</label>
      <input
        className="w-full border rounded p-2 text-sm mb-2"
        value={content.heading || ''}
        placeholder="Heading"
        onChange={(e) => setContent({ ...content, heading: e.target.value })}
      />
      <textarea
        className="w-full border rounded p-2 text-sm mb-2"
        value={content.subheading || content.body || ''}
        placeholder="Subheading / Body"
        onChange={(e) => setContent({ ...content, subheading: e.target.value })}
      />
      <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm" onClick={() => onSave(content)}>
        Simpan
      </button>
    </div>
  )
}
