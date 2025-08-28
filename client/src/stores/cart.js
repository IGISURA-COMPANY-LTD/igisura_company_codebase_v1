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
    if (idx >= 0) {
      next = current.map((i, k) => (k === idx ? { ...i, quantity: i.quantity + quantity } : i))
    } else {
      next = [...current, { product, quantity }]
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
    const next = get().items.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
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
}))

export default useCartStore


