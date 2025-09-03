import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../../lib/api'
import FieldFloat from '../../components/ui/FieldFloat'

export default function AdminCategoryForm({ mode = 'create' }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = mode === 'edit'
  const [form, setForm] = useState({ name: '', slug: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [slugTouched, setSlugTouched] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    api.get(`/api/categories/${id}`).then(({ data }) => setForm({ name: data.name || '', slug: String(data.slug || ''), description: data.description || '' })).catch(() => toast.error('Failed to load category'))
  }, [id])

  const submit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      if (isEdit) {
        await api.put(`/api/categories/${id}`, form)
        toast.success('Category updated')
      } else {
        await api.post('/api/categories', form)
        toast.success('Category created')
      }
      navigate('/admin/categories')
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full flex items-start justify-center">
      <div className="w-full max-w-xl card p-5">
        <button className="btn mb-3" type="button" onClick={() => window.history.back()}>← Back</button>
        <h2 className="text-2xl font-semibold">{isEdit ? 'Edit Category' : 'New Category'}</h2>
        <form className="mt-4 space-y-4" onSubmit={submit}>
          <FieldFloat id="name" label="Name" value={form.name} onChange={(v) => setForm((prev) => ({ ...prev, name: v, slug: !isEdit && !slugTouched ? v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : prev.slug }))} required />
          <FieldFloat id="slug" label="Slug" value={form.slug} onChange={(v) => { setForm({ ...form, slug: v }); setSlugTouched(true) }} />
          <FieldFloat as="textarea" rows={6} id="description" label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
          <div className="flex items-center gap-2">
            <button className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            <button type="button" className="btn" onClick={() => navigate('/admin/categories')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
