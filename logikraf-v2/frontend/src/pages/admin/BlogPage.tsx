import { apiGet } from '../../lib/api'
import AdminCrudPage from '../../components/admin/AdminCrudPage'
import type { Column, FormField } from '../../components/admin/AdminCrudPage'

interface Post {
  id: number
  title: string
  slug: string
  excerpt?: string
  body?: string
  featured_image?: string
  is_published: boolean
}

const columns: Column<Post>[] = [
  { id: 'title', label: 'Judul' },
  { id: 'slug', label: 'Slug' },
  { id: 'is_published', label: 'Published', render: (r: any) => r.is_published ? 'Ya' : 'Tidak' },
]

const formFields: FormField[] = [
  { name: 'title', label: 'Judul', required: true },
  { name: 'slug', label: 'Slug', required: true },
  { name: 'excerpt', label: 'Excerpt' },
  { name: 'body', label: 'Body', type: 'textarea', rows: 6 },
  { name: 'featured_image', label: 'URL Gambar' },
  { name: 'is_published', label: 'Published', type: 'select', options: [{ value: '1', label: 'Ya' }, { value: '0', label: 'Tidak' }] },
]

export default function AdminBlogPage() {
  const auth = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token') || ''}` })
  return (
    <AdminCrudPage<Post>
      title="Blog"
      breadcrumb="Blog"
      columns={columns}
      fetch={() => apiGet('/api/posts')}
      create={(data) => fetch('/api/posts', { method: 'POST', headers: auth(), body: JSON.stringify(data) }).then(r => r.ok ? r.json() : Promise.reject())}
      update={(id, data) => fetch(`/api/posts/${id}`, { method: 'PUT', headers: auth(), body: JSON.stringify(data) }).then(r => r.ok ? r.json() : Promise.reject())}
      remove={(id) => fetch(`/api/posts/${id}`, { method: 'DELETE', headers: auth() }).then(r => r.ok ? undefined : Promise.reject())}
      formFields={formFields}
      emptyRow="Belum ada post."
    />
  )
}
