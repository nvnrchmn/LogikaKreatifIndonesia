import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PublicLayout from '../../components/layout/PublicLayout'

interface Post {
  id: number
  title: string
  slug: string
  excerpt: string
  body: string
  published_at: string
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [q, setQ] = useState('')

  useEffect(() => {
    fetch('/api/posts').then(r => r.json()).then(setPosts)
  }, [])

  const filtered = posts.filter(p => !q || p.title.toLowerCase().includes(q.toLowerCase()) || p.excerpt.toLowerCase().includes(q.toLowerCase()))

  return (
    <PublicLayout>
    <div className="min-h-screen bg-canvas-light">
      <div className="pt-32 pb-20">
        <div className="container-narrow">
          <h1 className="text-4xl font-display font-bold text-text-main mb-6">Pencarian</h1>
          <form onSubmit={e => { e.preventDefault() }} className="mb-10">
            <div className="flex gap-3">
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Cari artikel, layanan, portofolio..." className="input flex-1" />
              <button type="submit" className="btn-primary">Cari</button>
            </div>
          </form>
          {q && (
            <p className="text-text-muted text-sm mb-8">
              {filtered.length > 0 ? `${filtered.length} hasil untuk "${q}"` : `Tidak ada hasil untuk "${q}"`}
            </p>
          )}
          {filtered.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-display font-bold text-text-main mb-4">Artikel</h2>
              <div className="space-y-3">
                {filtered.map(post => (
                  <Link key={post.id} to={`/blog/${post.slug}`} className="block card p-5 hover:shadow-lg transition-shadow no-underline text-text-main">
                    <h3 className="font-semibold text-text-main">{post.title}</h3>
                    {post.excerpt && <p className="text-sm text-text-muted mt-1 line-clamp-2">{post.excerpt}</p>}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
    </PublicLayout>
  )
}
