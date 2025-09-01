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
    <div className="max-w-xl">
      <h2 className="text-xl font-semibold">{isEdit ? 'Edit Category' : 'New Category'}</h2>
      <form className="mt-4 space-y-4" onSubmit={submit}>
        <FieldFloat id="name" label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
        <FieldFloat id="slug" label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} />
        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea className="w-full border rounded-lg px-3 py-2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <button className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
      </form>
    </div>
  )
}
