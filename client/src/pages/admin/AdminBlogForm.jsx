import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../../lib/api'
import FieldFloat from '../../components/ui/FieldFloat'

export default function AdminBlogForm({ mode = 'create' }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = mode === 'edit'
  const [form, setForm] = useState({ title: '', slug: '', content: '', author: '', images: [], tags: '' })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)
  const [slugTouched, setSlugTouched] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    api.get(`/api/blog/${id}`).then(({ data }) => setForm({ title: data.title || '', slug: data.slug || '', content: data.content || '', author: data.author || '', images: Array.isArray(data.images) ? data.images : (data.images ? [data.images] : []), tags: Array.isArray(data.tags) ? data.tags.join(', ') : '' })).catch(() => toast.error('Failed to load post'))
  }, [id])

  const uploadImages = async (files) => {
    if (!files || files.length === 0) return
    const body = new FormData()
    Array.from(files).slice(0, 5).forEach((f) => body.append('images', f))
    try {
      setUploading(true)
      const { data } = await api.post('/api/blog/upload-images', body, { headers: { 'Content-Type': 'multipart/form-data' } })
      const urls = data.images || []
      setForm((f) => ({ ...f, images: [...(f.images || []), ...urls] }))
      toast.success('Images uploaded')
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const removeImage = (url) => {
    setForm((f) => ({ ...f, images: (f.images || []).filter((u) => u !== url) }))
  }

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
        <FieldFloat className="md:col-span-2" id="title" label="Title" value={form.title} onChange={(v) => setForm((prev) => ({ ...prev, title: v, slug: !isEdit && !slugTouched ? v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : prev.slug }))} required />
        <FieldFloat id="slug" label="Slug" value={form.slug} onChange={(v) => { setForm({ ...form, slug: v }); setSlugTouched(true) }} />
        <FieldFloat id="author" label="Author" value={form.author} onChange={(v) => setForm({ ...form, author: v })} required />
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Content</label>
          <textarea className="w-full border rounded-lg px-3 py-2 h-56" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
        </div>
        <div className="md:col-span-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm">Images</label>
            <input ref={fileRef} type="file" multiple accept="image/*" onChange={(e) => uploadImages(e.target.files)} />
          </div>
          <div className={`mt-3 border-2 border-dashed rounded-lg p-4 ${uploading ? 'opacity-70' : ''}`}
            onDragOver={(e) => { e.preventDefault() }}
            onDrop={(e) => { e.preventDefault(); uploadImages(e.dataTransfer.files) }}
          >
            <div className="text-gray-600">Drag & drop images here, or click above to select files.</div>
            {Array.isArray(form.images) && form.images.length > 0 && (
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                {form.images.map((url) => (
                  <div key={url} className="relative rounded-lg overflow-hidden bg-gray-100 aspect-[4/3] group">
                    <img src={url} alt="uploaded" className="w-full h-full object-cover" />
                    <button type="button" className="absolute top-1 right-1 bg-white/90 text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition" onClick={() => removeImage(url)}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <FieldFloat className="md:col-span-2" id="tags" label="Tags (comma-separated)" value={form.tags} onChange={(v) => setForm({ ...form, tags: v })} />
        <div className="md:col-span-2">
          <button className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Post'}</button>
          <button type="button" className="btn ml-2" onClick={() => navigate('/admin/blog')}>Cancel</button>
        </div>
      </form>
    </div>
  )
}
