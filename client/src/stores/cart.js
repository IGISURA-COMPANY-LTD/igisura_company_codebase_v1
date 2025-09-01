import { create } from 'zustand'

const loadCart = () => {
  try {
    const raw = localStorage.getItem('cart')
    return raw ? JSON.parse(raw) : { items: [] }
  } catch {
    return { items: [] }
  }
}

const saveCart = (state) => {
  localStorage.setItem('cart', JSON.stringify({ items: state.items }))
}

export const useCartStore = create((set, get) => ({
  items: loadCart().items,

  addItem(product, quantity = 1) {
    const current = get().items
    const idx = current.findIndex((i) => i.product.id === product.id)
    let next
    const maxStock = typeof product.stockQuantity === 'number' ? Math.max(0, product.stockQuantity) : 99
    const requested = Math.max(1, Math.min(maxStock, quantity))
    if (idx >= 0) {
      next = current.map((i, k) => {
        if (k !== idx) return i
        const newQty = Math.max(1, Math.min(maxStock, i.quantity + requested))
        return { ...i, quantity: newQty }
      })
    } else {
      next = [...current, { product, quantity: requested }]
    }
    set({ items: next })
    saveCart({ items: next })
  },

  removeItem(productId) {
    const next = get().items.filter((i) => i.product.id !== productId)
    set({ items: next })
    saveCart({ items: next })
  },

  updateQuantity(productId, quantity) {
    const next = get().items.map((i) => {
      if (i.product.id !== productId) return i
      const maxStock = typeof i.product.stockQuantity === 'number' ? Math.max(0, i.product.stockQuantity) : 99
      const clamped = Math.max(1, Math.min(maxStock, Number(quantity) || 1))
      return { ...i, quantity: clamped }
    })
    set({ items: next })
    saveCart({ items: next })
  },

  increment(productId, step = 1) {
    const next = get().items.map((i) => {
      if (i.product.id !== productId) return i
      const maxStock = typeof i.product.stockQuantity === 'number' ? Math.max(0, i.product.stockQuantity) : 99
      const clamped = Math.max(1, Math.min(maxStock, i.quantity + step))
      return { ...i, quantity: clamped }
    })
    set({ items: next })
    saveCart({ items: next })
  },

  decrement(productId, step = 1) {
    const next = get().items.map((i) => {
      if (i.product.id !== productId) return i
      const clamped = Math.max(1, i.quantity - step)
      return { ...i, quantity: clamped }
    })
    set({ items: next })
    saveCart({ items: next })
  },

  clear() {
    set({ items: [] })
    saveCart({ items: [] })
  },

  total() {
    return get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  },

  itemCount() {
    return get().items.reduce((sum, i) => sum + i.quantity, 0)
  },
}))

export default useCartStore


