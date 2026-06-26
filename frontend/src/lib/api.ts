import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { AuthTokens } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const { data } = await axios.post<AuthTokens>(`${API_BASE_URL}/api/auth/refresh`, {
            refresh_token: refreshToken,
          });
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          }
          return api(originalRequest);
        }
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; full_name: string; phone?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  refresh: (refresh_token: string) =>
    api.post('/auth/refresh', { refresh_token }),
  logout: (refresh_token: string) =>
    api.post('/auth/logout', { refresh_token }),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  verifyEmail: (email: string, otp: string) =>
    api.post('/auth/verify-email', { email, otp }),
  resendOtp: (email: string, purpose: string = 'registration') =>
    api.post('/auth/resend-otp', { email, purpose }),
  sendLoginOtp: (email: string) =>
    api.post('/auth/send-login-otp', { email }),
  verifyLoginOtp: (email: string, otp: string) =>
    api.post('/auth/verify-login-otp', { email, otp }),
  verifyResetOtp: (email: string, otp: string) =>
    api.post('/auth/verify-reset-otp', { email, otp }),
  resetPassword: (email: string, token: string, password: string) =>
    api.post('/auth/reset-password', { email, token, password }),
  getMe: () => api.get('/auth/me'),
  googleLogin: (token: string) =>
    api.post('/auth/oauth', { provider: 'google', token }),
  githubLogin: (token: string) =>
    api.post('/auth/oauth', { provider: 'github', token }),
  githubExchangeCode: (code: string) =>
    api.post('/auth/github/token', { provider: 'github', token: code }),
};

// Products API
export const productsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get('/products', { params }),
  get: (id: string) => api.get(`/products/${id}`),
  create: (data: Record<string, unknown>) =>
    api.post('/products', data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  getCategories: () => api.get('/products/categories/all'),
  getReviews: (productId: string) => api.get(`/products/${productId}/reviews`),
  createRating: (productId: string, rating: number) =>
    api.post('/products/ratings', { product_id: productId, rating }),
};

// Recommendations API
export const recommendationsApi = {
  personalized: (n = 12) =>
    api.get('/recommendations/personalized', { params: { n } }),
  similar: (productId: string, n = 8) =>
    api.get(`/recommendations/similar/${productId}`, { params: { n } }),
  trending: (n = 8) =>
    api.get('/recommendations/trending', { params: { n } }),
  frequentlyBought: (productId: string, n = 4) =>
    api.get(`/recommendations/frequently-bought/${productId}`, { params: { n } }),
  continueShopping: (n = 8) =>
    api.get('/recommendations/continue-shopping', { params: { n } }),
  feedback: (data: { product_id: string; feedback_type: string; rating?: number }) =>
    api.post('/recommendations/feedback', data),
  analytics: () => api.get('/recommendations/analytics'),
};

// Cart API
export const cartApi = {
  get: () => api.get('/cart'),
  add: (productId: string, quantity = 1) =>
    api.post('/cart/add', { product_id: productId, quantity }),
  update: (itemId: string, quantity: number) =>
    api.put(`/cart/update/${itemId}`, { quantity }),
  remove: (itemId: string) => api.delete(`/cart/remove/${itemId}`),
  clear: () => api.delete('/cart'),
};

// Orders API
export const ordersApi = {
  list: (params?: Record<string, unknown>) =>
    api.get('/orders', { params }),
  get: (id: string) => api.get(`/orders/${id}`),
  create: (shippingAddress: string, paymentMethod = 'stripe', couponCode?: string) =>
    api.post('/orders', { shipping_address: shippingAddress, payment_method: paymentMethod, coupon_code: couponCode }),
  updateStatus: (id: string, status: string) =>
    api.put(`/orders/${id}/status`, { status }),
};

// Wishlist API
export const wishlistApi = {
  get: () => api.get('/wishlist'),
  add: (productId: string) => api.post(`/wishlist/add/${productId}`),
  remove: (productId: string) => api.delete(`/wishlist/remove/${productId}`),
};

// Analytics API
export const analyticsApi = {
  dashboard: (days = 30) =>
    api.get('/analytics/dashboard', { params: { days } }),
  userInsights: () => api.get('/analytics/user-insights'),
};

// Admin API
export const adminApi = {
  listUsers: (params?: Record<string, unknown>) =>
    api.get('/admin/users', { params }),
  updateUserRole: (userId: string, role: string) =>
    api.put(`/admin/users/${userId}/role`, { role }),
  toggleUserStatus: (userId: string) =>
    api.put(`/admin/users/${userId}/status`),
  listProducts: (params?: Record<string, unknown>) =>
    api.get('/admin/products', { params }),
  listOrders: (params?: Record<string, unknown>) =>
    api.get('/admin/orders', { params }),
  analyticsOverview: () => api.get('/admin/analytics/overview'),
};

// ────── FEATURES API ──────
export const featuresApi = {
  // Persona
  getPersona: () => api.get('/features/persona'),
  getPersonaHistory: () => api.get('/features/persona/history'),

  // Recommendation Explanations
  getRecommendationExplanations: (productId?: string) =>
    api.get('/features/recommendation-explanations', { params: { product_id: productId } }),
  getExplanationDetail: () => api.get('/features/recommendation-explanations/detail'),

  // Loyalty
  getLoyaltySummary: () => api.get('/features/loyalty/summary'),
  getLoyaltyPoints: (limit = 50) => api.get('/features/loyalty/points', { params: { limit } }),

  // Daily Rewards
  getDailyRewards: () => api.get('/features/daily-rewards'),
  claimDailyReward: () => api.post('/features/daily-rewards/claim'),

  // Streaks
  getStreaks: () => api.get('/features/streaks'),

  // Referrals
  getReferralStats: () => api.get('/features/referrals'),
  createReferral: (email: string) => api.post('/features/referrals', { referred_email: email }),

  // Feature Flags (admin)
  getFeatureFlags: () => api.get('/features/feature-flags'),
  createFeatureFlag: (data: Record<string, unknown>) => api.post('/features/feature-flags', data),
  updateFeatureFlag: (id: string, data: Record<string, unknown>) => api.put(`/features/feature-flags/${id}`, data),

  // A/B Tests (admin)
  getABTests: () => api.get('/features/ab-tests'),
  createABTest: (data: Record<string, unknown>) => api.post('/features/ab-tests', data),

  // Price Alerts
  getPriceAlerts: () => api.get('/features/price-alerts'),
  createPriceAlert: (productId: string, targetPrice: number) =>
    api.post('/features/price-alerts', { product_id: productId, target_price: targetPrice }),
  deletePriceAlert: (id: string) => api.delete(`/features/price-alerts/${id}`),

  // Stock Alerts
  getStockAlerts: () => api.get('/features/stock-alerts'),
  createStockAlert: (productId: string) =>
    api.post('/features/stock-alerts', { product_id: productId }),

  // Product Comparison
  getComparison: () => api.get('/features/comparisons'),
  saveComparison: (productIds: string[]) => api.post('/features/comparisons', { product_ids: productIds }),
  compareProducts: (productIds: string[]) => api.get(`/features/compare/${productIds.join(',')}`),

  // Chat History
  getChatSessions: () => api.get('/features/chat/sessions'),
  getChatSession: (sessionId: string) => api.get(`/features/chat/${sessionId}`),
  saveChatMessage: (sessionId: string, content: string) =>
    api.post('/features/chat', { session_id: sessionId, content }),
  sendChatMessage: (sessionId: string, content: string) =>
    api.post('/features/chat/send', { session_id: sessionId, content }),

  // Achievements
  getAchievements: () => api.get('/features/achievements'),

  // Follow System
  followUser: (userId: string) => api.post(`/features/follow/${userId}`),
  unfollowUser: (userId: string) => api.delete(`/features/follow/${userId}`),
  getFollowers: () => api.get('/features/followers'),
  getFollowing: () => api.get('/features/following'),

  // Community Recommendations
  getCommunityRecommendations: (limit = 20) =>
    api.get('/features/community-recommendations', { params: { limit } }),
  createCommunityRecommendation: (productId: string, text?: string) =>
    api.post('/features/community-recommendations', { product_id: productId, recommendation_text: text }),

  // Smart Returns
  getReturns: () => api.get('/features/returns'),
  createReturn: (orderId: string, productId: string, reason: string) =>
    api.post('/features/returns', { order_id: orderId, product_id: productId, reason }),

  // Support Tickets
  getTickets: () => api.get('/features/support-tickets'),
  createTicket: (subject: string, message: string, priority = 'normal') =>
    api.post('/features/support-tickets', { subject, message, priority }),

  // Feedback
  submitFeedback: (data: Record<string, unknown>) => api.post('/features/feedback', data),

  // NPS
  submitNPS: (score: number, reason?: string) =>
    api.post('/features/nps', { score, reason }),
  getNPSAnalytics: () => api.get('/features/nps/analytics'),

  // Theme
  getThemePreference: () => api.get('/features/theme'),
  updateThemePreference: (data: Record<string, unknown>) => api.put('/features/theme', data),

  // Dashboard Layout
  getDashboardLayout: () => api.get('/features/dashboard-layout'),
  updateDashboardLayout: (data: Record<string, unknown>) => api.put('/features/dashboard-layout', data),

  // Onboarding
  getOnboarding: () => api.get('/features/onboarding'),
  updateOnboarding: (data: Record<string, unknown>) => api.put('/features/onboarding', data),

  // Product Sharing
  shareProduct: (productId: string, platform: string) =>
    api.post('/features/share', { product_id: productId, platform }),
  shareWishlist: (isPublic = true) =>
    api.post('/features/wishlist/share', { is_public: isPublic }),

  // Smart Coupons
  getSmartCoupons: (orderTotal = 0) =>
    api.get('/features/smart-coupons', { params: { order_total: orderTotal } }),

  // Spending Analytics
  getSpendingAnalytics: () => api.get('/features/spending-analytics'),

  // Trend Analysis
  getTrendAnalysis: () => api.get('/features/trend-analysis'),

  // Customer Lifetime Value
  getCLV: () => api.get('/features/clv'),

  // Notification Schedules
  getNotificationSchedules: () => api.get('/features/notification-schedules'),
  updateNotificationSchedule: (data: Record<string, unknown>) =>
    api.put('/features/notification-schedules', data),

  // Social Proof
  getSocialProof: (productId: string) => api.get(`/features/social-proof/${productId}`),

  // XAI Dashboard
  getXAIDashboard: () => api.get('/features/xai-dashboard'),

  // Audit Logs (admin)
  getAuditLogs: (params?: Record<string, unknown>) =>
    api.get('/features/audit-logs', { params }),
};

// Payments Gateway API
export const paymentsGatewayApi = {
  createOrder: (data: { amount: number; currency?: string; payment_method?: string }) =>
    api.post('/payments/create-order', data),
  verifyPayment: (data: { payment_id: string; order_id: string; signature: string; payment_method?: string }) =>
    api.post('/payments/verify', data),
};

// ────── CHAT API ──────
export const chatApi = {
  sendMessage: (message: string, sessionId?: string) =>
    api.post('/chat', { message, session_id: sessionId }),
  getSessions: () => api.get('/features/chat/sessions'),
  getSession: (sessionId: string) => api.get(`/features/chat/${sessionId}`),
};

// ────── AI FEATURES API ──────
export const aiApi = {
  // Shopping DNA
  getShoppingDNA: () => api.get('/ai/shopping-dna'),

  // AI Tasks
  getTasks: (status?: string) => api.get('/ai/tasks', { params: { status } }),
  createTask: (data: Record<string, unknown>) => api.post('/ai/tasks', data),
  getTask: (id: string) => api.get(`/ai/tasks/${id}`),
  updateTask: (id: string, data: Record<string, unknown>) => api.put(`/ai/tasks/${id}`, data),
  deleteTask: (id: string) => api.delete(`/ai/tasks/${id}`),
  executeTask: (id: string) => api.post(`/ai/tasks/${id}/execute`),

  // Tracked Products
  getTrackedProducts: () => api.get('/ai/tracked-products'),
  trackProduct: (data: Record<string, unknown>) => api.post('/ai/tracked-products', data),
  updateTrackedProduct: (id: string, data: Record<string, unknown>) => api.put(`/ai/tracked-products/${id}`, data),
  deleteTrackedProduct: (id: string) => api.delete(`/ai/tracked-products/${id}`),

  // Auto Buy Rules
  getAutoBuyRules: () => api.get('/ai/auto-buy-rules'),
  createAutoBuyRule: (data: Record<string, unknown>) => api.post('/ai/auto-buy-rules', data),
  updateAutoBuyRule: (id: string, data: Record<string, unknown>) => api.put(`/ai/auto-buy-rules/${id}`, data),
  deleteAutoBuyRule: (id: string) => api.delete(`/ai/auto-buy-rules/${id}`),

  // Price Predictions
  getPricePredictions: () => api.get('/ai/price-predictions'),
  generatePrediction: (productId: string) => api.post(`/ai/price-predictions/generate?product_id=${productId}`),
  getProductPrediction: (productId: string) => api.get(`/ai/price-predictions/${productId}`),

  // Gift Recommendations
  generateGiftRecommendation: (data: Record<string, unknown>) => api.post('/ai/gift-recommendations', data),
  getGiftRecommendations: () => api.get('/ai/gift-recommendations'),
  getGiftRecommendation: (id: string) => api.get(`/ai/gift-recommendations/${id}`),

  // Reorder Predictions
  getReorderPredictions: () => api.get('/ai/reorder-predictions'),

  // XP & Achievements
  getXP: () => api.get('/ai/xp'),
  getAchievements: () => api.get('/ai/achievements'),
  checkAchievements: () => api.post('/ai/achievements/check'),

  // User Preferences
  getPreferences: () => api.get('/ai/preferences'),
  updatePreferences: (data: Record<string, unknown>) => api.put('/ai/preferences', data),

  // Concierge
  getConciergeMessages: () => api.get('/ai/concierge/messages'),
  dismissConciergeMessage: (id: string) => api.post(`/ai/concierge/dismiss/${id}`),

  // Dynamic Homepage
  getHomepage: () => api.get('/ai/homepage'),

  // AR Sessions
  getARSessions: () => api.get('/ai/ar-sessions'),
  createARSession: (data: Record<string, unknown>) => api.post('/ai/ar-sessions', data),
  updateARSession: (id: string, data: Record<string, unknown>) => api.put(`/ai/ar-sessions/${id}`, data),
};
