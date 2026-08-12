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
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/posts')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setPosts)
      .catch(() => setError('Gagal memuat artikel'))
  }, [])

  return (
    <PublicLayout>
    <div className="min-h-screen bg-canvas-light">
      <div className="pt-32 pb-20">
        <div className="container-narrow">
          <div className="text-center mb-8 md:mb-12">
            <span className="badge-primary mb-4 inline-block">Blog</span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-main mb-6">Artikel & Insight</h1>
            <p className="text-text-muted max-w-2xl mx-auto">Artikel, insight, dan update terbaru.</p>
          </div>
          {error && <div className="alert-error max-w-3xl mx-auto mb-8">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {posts.map(post => (
              <article key={post.id} className="card-hover flex flex-col h-full">
                <div className="p-5 flex flex-col h-full">
                  <h3 className="font-bold mb-2 leading-snug">{post.title}</h3>
                  <p className="text-sm text-text-muted line-clamp-3 flex-1">{post.excerpt}</p>
                  <Link to={`/blog/${post.slug}`} className="mt-4 text-sm font-semibold tracking-wide text-brand-primary hover:underline">Baca selengkapnya →</Link>
                </div>
              </article>
            ))}
            {posts.length === 0 && !error && (
              <div className="col-span-full text-center py-10">
                <p className="text-text-muted">Belum ada artikel.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </PublicLayout>
  )
}
