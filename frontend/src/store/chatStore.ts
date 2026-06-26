'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatProductItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  discount?: number;
  rating?: number;
  match_score?: number;
  slug?: string;
  reviews?: number;
  brand?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  type?: 'text' | 'carousel' | 'comparison';
  products?: ChatProductItem[];
  suggestions?: string[];
  timestamp: number;
  rating?: 'helpful' | 'not_helpful' | null;
}

export interface ProactiveNotification {
  id: string;
  type: 'price_drop' | 'back_in_stock' | 'flash_sale' | 'new_recommendation';
  title: string;
  message: string;
  productId?: string;
  productName?: string;
  timestamp: number;
  read: boolean;
}

interface ChatSettings {
  language: 'en' | 'ta' | 'hi' | 'te';
  voiceEnabled: boolean;
  autoScroll: boolean;
}

interface ChatState {
  isOpen: boolean;
  messages: ChatMessage[];
  sessionId: string | null;
  isTyping: boolean;
  unreadCount: number;
  hasOpened: boolean;
  showSettings: boolean;
  notifications: ProactiveNotification[];
  settings: ChatSettings;

  toggle: () => void;
  open: () => void;
  close: () => void;
  addMessage: (msg: ChatMessage) => void;
  setTyping: (typing: boolean) => void;
  setSessionId: (id: string) => void;
  setMessages: (msgs: ChatMessage[]) => void;
  incrementUnread: () => void;
  resetUnread: () => void;
  rateMessage: (id: string, rating: 'helpful' | 'not_helpful') => void;
  clearSession: () => void;
  toggleSettings: () => void;
  updateSettings: (s: Partial<ChatSettings>) => void;
  addNotification: (n: ProactiveNotification) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      messages: [],
      sessionId: null,
      isTyping: false,
      unreadCount: 0,
      hasOpened: false,
      showSettings: false,
      notifications: [],
      settings: { language: 'en', voiceEnabled: false, autoScroll: true },

      toggle: () => {
        const { isOpen } = get();
        const next = !isOpen;
        set({ isOpen: next, hasOpened: true, showSettings: false });
        if (next) set({ unreadCount: 0 });
      },
      open: () => set({ isOpen: true, hasOpened: true, unreadCount: 0, showSettings: false }),
      close: () => set({ isOpen: false }),

      addMessage: (msg) =>
        set((state) => ({
          messages: [...state.messages, msg],
        })),

      setTyping: (typing) => set({ isTyping: typing }),
      setSessionId: (id) => set({ sessionId: id }),
      setMessages: (msgs) => set({ messages: msgs }),

      incrementUnread: () =>
        set((state) => {
          if (!state.isOpen) return { unreadCount: state.unreadCount + 1 };
          return {};
        }),

      resetUnread: () => set({ unreadCount: 0 }),

      rateMessage: (id, rating) =>
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === id ? { ...m, rating } : m
          ),
        })),

      clearSession: () =>
        set({ messages: [], sessionId: null }),

      toggleSettings: () =>
        set((state) => ({ showSettings: !state.showSettings })),

      updateSettings: (s) =>
        set((state) => ({ settings: { ...state.settings, ...s } })),

      addNotification: (n) =>
        set((state) => ({
          notifications: [n, ...state.notifications].slice(0, 20),
        })),

      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'cognicart-chat',
      partialize: (state) => ({
        messages: state.messages,
        sessionId: state.sessionId,
        hasOpened: state.hasOpened,
        settings: state.settings,
      }),
    }
  )
);
