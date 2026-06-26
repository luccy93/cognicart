import { create } from 'zustand'

export const useCartStore = create((set, get) => ({
items: [],
addItem: (product) => set((state) => {
const existing = state.items.find(i => i.id === product.id)
if (existing) {
return { items: state.items.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i) }
}
return { items: [...state.items, { ...product, quantity: 1 }] }
}),
removeItem: (id) => set((state) => ({ items: state.items.filter(i => i.id !== id) })),
updateQuantity: (id, qty) => set((state) => ({
items: state.items.map(i => i.id === id ? { ...i, quantity: Math.max(1, qty) } : i)
})),
clearCart: () => set({ items: [] }),
getTotal: () => get().items.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0),
getCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}))

export const useWishlistStore = create((set) => ({
items: [],
toggle: (product) => set((state) => {
const exists = state.items.find(i => i.id === product.id)
return { items: exists ? state.items.filter(i => i.id !== product.id) : [...state.items, product] }
}),
isWishlisted: (id) => get().items.some(i => i.id === id),
}))

const get = () => useWishlistStore.getState()

export const useCompareStore = create((set, get) => ({
items: [],
toggle: (product) => set((state) => {
if (state.items.find(i => i.id === product.id)) {
return { items: state.items.filter(i => i.id !== product.id) }
}
if (state.items.length >= 4) return state
return { items: [...state.items, product] }
}),
clear: () => set({ items: [] }),
}))
