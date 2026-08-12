import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import PublicLayout from '../../components/layout/PublicLayout'

interface Post {
  id: number
  title: string
  slug: string
  excerpt: string
  body: string
  published_at: string
}

export default function BlogDetailPage() {
  const { slug } = useParams()
  const [post, setPost] = useState<Post | null>(null)

  useEffect(() => {
    fetch('/api/posts')
      .then(r => r.json())
      .then((posts: Post[]) => {
        const found = posts.find((p) => p.slug === slug)
        if (found) setPost(found)
      })
  }, [slug])

  if (!post) return <PublicLayout><div className="min-h-screen bg-canvas-light flex items-center justify-center">Memuat...</div></PublicLayout>

  return (
    <PublicLayout>
      <div className="min-h-screen bg-canvas-light">
        <div className="pt-32 pb-20">
        <div className="container-narrow">
          <Link to="/#blog" className="inline-flex items-center gap-2 text-text-muted hover:text-brand-primary font-body text-sm transition-colors mb-8">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            Kembali ke Blog
          </Link>
          <article className="max-w-4xl bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-border-minimal">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-text-main mb-4">{post.title}</h1>
            <p className="text-sm text-text-muted mb-8">{new Date(post.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <div className="prose prose-lg max-w-none text-text-main font-body leading-relaxed whitespace-pre-line">{post.body || post.excerpt}</div>
          </article>
        </div>
      </div>
      </div>
    </PublicLayout>
  )
}
