import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import FieldFloat from '../../components/ui/FieldFloat'
import api from '../../lib/api'

export default function AdminProductForm({ mode = 'create' }) {
  const { id } = useParams()
  const isEdit = mode === 'edit'
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [saving, setSaving] = useState(false)
  const [catOpen, setCatOpen] = useState(false)
  const [catForm, setCatForm] = useState({ name: '', slug: '', description: '' })
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    name: '', slug: '', description: '', price: '', categoryId: '', benefits: '', instructions: '', inStock: true, featured: false, stockQuantity: '', images: [],
  })
  const [slugTouched, setSlugTouched] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    api.get('/api/categories').then(({ data }) => setCategories(Array.isArray(data) ? data : data?.categories || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (!isEdit) return
    api.get(`/api/products/${id}`)
      .then(({ data }) => setForm({
        name: data.name || '', slug: data.slug || '', description: data.description || '', price: data.price || '',
        categoryId: data.categoryId || '', benefits: data.benefits || '', instructions: data.instructions || '',
        inStock: !!data.inStock, featured: !!data.featured, stockQuantity: data.stockQuantity ?? '', images: data.images || [],
      }))
      .catch(() => toast.error('Failed to load product'))
  }, [id])

  const uploadImages = async (files) => {
    if (!files || files.length === 0) return
    const body = new FormData()
    Array.from(files).slice(0, 5).forEach((f) => body.append('images', f))
    try {
      setUploading(true)
      const { data } = await api.post('/api/products/upload-images', body, { headers: { 'Content-Type': 'multipart/form-data' } })
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
    try {
      setSaving(true)
      const payload = {
        ...form,
        price: Number(form.price),
        // Category ID must be sent as a string per new API schema
        categoryId: form.categoryId ? String(form.categoryId) : undefined,
        stockQuantity: form.stockQuantity === '' ? undefined : Number(form.stockQuantity),
      }
      if (isEdit) {
        await api.put(`/api/products/${id}`, payload)
        toast.success('Product updated')
      } else {
        await api.post('/api/products', payload)
        toast.success('Product created')
      }
      navigate('/admin/products')
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button className="btn mb-3" onClick={() => window.history.back()} type="button">← Back</button>
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
      <h2 className="text-xl font-semibold">{isEdit ? 'Edit Product' : 'New Product'}</h2>
      <form className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={submit}>
        <FieldFloat id="name" label="Name" value={form.name} onChange={(name) => setForm((prev) => ({ ...prev, name, slug: !isEdit && !slugTouched ? name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : prev.slug }))} required />
        <FieldFloat id="slug" label="Slug" value={form.slug} onChange={(v) => { setForm({ ...form, slug: v }); setSlugTouched(true) }} />
        <FieldFloat className="md:col-span-2" as="textarea" id="description" label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} required rows={6} />
        <FieldFloat id="price" type="number" label="Price" value={form.price} onChange={(v) => setForm({ ...form, price: v })} required />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
          <FieldFloat
            as="select"
            id="category"
            label="Category"
            value={form.categoryId}
            onChange={(v) => setForm({ ...form, categoryId: v })}
            options={[{ value: '', label: 'Select category' }, ...categories.map((c) => ({ value: String(c.id), label: c.name }))]}
          />
          <div className="flex items-end">
            <button type="button" className="btn-primary w-full md:w-auto" onClick={() => setCatOpen(true)}>+ Add Category</button>
          </div>
        </div>
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldFloat id="stockQuantity" type="number" label="Stock Quantity" value={form.stockQuantity} onChange={(v) => setForm({ ...form, stockQuantity: v })} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">In Stock</label>
              <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.inStock} onChange={(e) => setForm({ ...form, inStock: e.target.checked })} /> In Stock</label>
            </div>
            <div>
              <label className="block text-sm mb-1">Featured</label>
              <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured</label>
            </div>
          </div>
        </div>

        <FieldFloat className="md:col-span-2" as="textarea" id="benefits" label="Benefits" value={form.benefits} onChange={(v) => setForm({ ...form, benefits: v })} rows={5} />
        <FieldFloat className="md:col-span-2" as="textarea" id="instructions" label="Instructions" value={form.instructions} onChange={(v) => setForm({ ...form, instructions: v })} rows={5} />

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
              <div className="mt-3 grid grid-cols-3 md:grid-cols-6 gap-3">
                {form.images.map((url) => (
                  <div key={url} className="relative rounded-lg overflow-hidden bg-gray-100 aspect-square group">
                    <img src={url} alt="uploaded" className="w-full h-full object-cover" />
                    <button type="button" className="absolute top-1 right-1 bg-white/90 text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition" onClick={() => removeImage(url)}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <button className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Product'}</button>
          <button type="button" className="btn ml-2" onClick={() => navigate('/admin/products')}>Cancel</button>
        </div>
      </form>
      </div>

      {catOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCatOpen(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Add Category</h3>
                <button className="size-8 rounded hover:bg-gray-100" onClick={() => setCatOpen(false)}>✕</button>
              </div>
              <form className="space-y-3" onSubmit={async (e) => {
                e.preventDefault()
                try {
                  const { data } = await api.post('/api/categories', catForm)
                  toast.success('Category created successfully')
                  setCategories((prev) => [...prev, data])
                  setForm((f) => ({ ...f, categoryId: String(data.id) }))
                  setCatOpen(false)
                  setCatForm({ name: '', slug: '', description: '' })
                } catch (err) {
                  toast.error(err?.response?.data?.error || 'Failed to create category')
                }
              }}>
                <FieldFloat id="cat_name" label="Name" value={catForm.name} onChange={(v) => setCatForm({ ...catForm, name: v, slug: v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })} required />
                <FieldFloat id="cat_slug" label="Slug" value={catForm.slug} onChange={(v) => setCatForm({ ...catForm, slug: v })} />
                <FieldFloat as="textarea" id="cat_description" label="Description" value={catForm.description} onChange={(v) => setCatForm({ ...catForm, description: v })} rows={4} />
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button type="button" className="btn" onClick={() => setCatOpen(false)}>Cancel</button>
                  <button className="btn-primary" type="submit">Create</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
