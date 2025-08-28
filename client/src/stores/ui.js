import { create } from 'zustand'

export const useUiStore = create((set) => ({
  loadingGlobal: false,
  modal: null,
  toast: null,

  setLoadingGlobal(flag) {
    set({ loadingGlobal: !!flag })
  },

  openModal(name, props = {}) {
    set({ modal: { name, props } })
  },
  closeModal() {
    set({ modal: null })
  },
}))

export default useUiStore


