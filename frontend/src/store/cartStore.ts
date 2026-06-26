import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types';
import { cartApi } from '@/lib/api';

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  setCart: (data: { items: CartItem[]; total: number; item_count: number }) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
  items: [],
  total: 0,
  itemCount: 0,
  isLoading: false,

  setCart: (data) =>
    set({ items: data.items, total: data.total, itemCount: data.item_count }),

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const { data } = await cartApi.get();
      set({ items: data.items, total: data.total, itemCount: data.item_count, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addItem: async (productId, quantity = 1) => {
    await cartApi.add(productId, quantity);
    const { data } = await cartApi.get();
    set({ items: data.items, total: data.total, itemCount: data.item_count });
  },

  updateItem: async (itemId, quantity) => {
    await cartApi.update(itemId, quantity);
    const { data } = await cartApi.get();
    set({ items: data.items, total: data.total, itemCount: data.item_count });
  },

  removeItem: async (itemId) => {
    await cartApi.remove(itemId);
    const { data } = await cartApi.get();
    set({ items: data.items, total: data.total, itemCount: data.item_count });
  },

  clearCart: async () => {
    await cartApi.clear();
    set({ items: [], total: 0, itemCount: 0 });
  },
}),
{ name: 'cognicart-cart' }
));
