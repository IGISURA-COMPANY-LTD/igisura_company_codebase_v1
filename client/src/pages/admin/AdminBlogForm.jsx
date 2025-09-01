import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../../lib/api'
import FieldFloat from '../../components/ui/FieldFloat'

export default function AdminBlogForm({ mode = 'create' }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = mode === 'edit'
  const [form, setForm] = useState({ title: '', slug: '', content: '', author: '', image: '', tags: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    api.get(`/api/blog/${id}`).then(({ data }) => setForm({ title: data.title || '', slug: data.slug || '', content: data.content || '', author: data.author || '', image: data.image || '', tags: Array.isArray(data.tags) ? data.tags.join(', ') : '' })).catch(() => toast.error('Failed to load post'))
  }, [id])

  const submit = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    }
    try {
      setSaving(true)
      if (isEdit) {
        await api.put(`/api/blog/${id}`, payload)
        toast.success('Post updated')
      } else {
        await api.post('/api/blog', payload)
        toast.success('Post created')
      }
      navigate('/admin/blog')
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-xl font-semibold">{isEdit ? 'Edit Post' : 'New Post'}</h2>
      <form className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={submit}>
        <FieldFloat className="md:col-span-2" id="title" label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
        <FieldFloat id="slug" label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} />
        <FieldFloat id="author" label="Author" value={form.author} onChange={(v) => setForm({ ...form, author: v })} required />
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Content</label>
          <textarea className="w-full border rounded-lg px-3 py-2 h-56" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
        </div>
        <FieldFloat className="md:col-span-2" id="image" label="Cover Image URL" value={form.image} onChange={(v) => setForm({ ...form, image: v })} />
        <FieldFloat className="md:col-span-2" id="tags" label="Tags (comma-separated)" value={form.tags} onChange={(v) => setForm({ ...form, tags: v })} />
        <div className="md:col-span-2">
          <button className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Post'}</button>
          <button type="button" className="btn ml-2" onClick={() => navigate('/admin/blog')}>Cancel</button>
        </div>
      </form>
    </div>
  )
}
