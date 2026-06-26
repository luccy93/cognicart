import { create } from 'zustand'

export const useGarageStore = create((set) => ({
vehicles: [
{ id: 1, brand: 'Yamaha', model: 'R15 V4', year: 2024, type: 'Bike', color: 'Racing Blue', variant: 'Standard', image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400' },
{ id: 2, brand: 'KTM', model: 'Duke 390', year: 2023, type: 'Bike', color: 'Metallic Orange', variant: 'Standard', image: 'https://images.unsplash.com/photo-1611564494260-6f0d28b2b9e2?w=400' },
{ id: 3, brand: 'Hyundai', model: 'i20 N Line', year: 2022, type: 'Car', color: 'Thunder Blue', variant: 'N Line', image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400' },
],
addVehicle: (v) => set((s) => ({ vehicles: [...s.vehicles, { ...v, id: Date.now() }] })),
removeVehicle: (id) => set((s) => ({ vehicles: s.vehicles.filter(v => v.id !== id) })),
}))

export const useAuthStore = create((set) => ({
user: null,
token: localStorage.getItem('gearskin_token'),
isAuthenticated: !!localStorage.getItem('gearskin_token'),
login: (user, token) => {
localStorage.setItem('gearskin_token', token)
set({ user, token, isAuthenticated: true })
},
logout: () => {
localStorage.removeItem('gearskin_token')
set({ user: null, token: null, isAuthenticated: false })
},
}))

export const useUIStore = create((set) => ({
cartOpen: false,
mobileMenuOpen: false,
searchOpen: false,
chatOpen: false,
toggleCart: () => set((s) => ({ cartOpen: !s.cartOpen })),
toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
toggleSearch: () => set((s) => ({ searchOpen: !s.searchOpen })),
toggleChat: () => set((s) => ({ chatOpen: !s.chatOpen })),
closeAll: () => set({ cartOpen: false, mobileMenuOpen: false, searchOpen: false, chatOpen: false }),
}))
