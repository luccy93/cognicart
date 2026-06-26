const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status: number;
}

class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401 && token) {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      const refreshRes = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (refreshRes.ok) {
        const tokens = await refreshRes.json();
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);
        headers['Authorization'] = `Bearer ${tokens.access_token}`;
        const retry = await fetch(`${API_BASE}/api${endpoint}`, {
          ...options,
          headers,
        });
        const data = await retry.json();
        if (!retry.ok) throw new ApiError(data.detail || 'Request failed', retry.status, data);
        return { data, status: retry.status };
      } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        if (typeof window !== 'undefined') window.location.href = '/login';
      }
    }
  }

  const data = await res.json();
  if (!res.ok) throw new ApiError(data.detail || 'Request failed', res.status, data);
  return { data, status: res.status };
}

export interface LoginPayload {
  email: string;
  password: string;
}
export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
}

export const authApi = {
  login: (payload: LoginPayload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  register: (payload: RegisterPayload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  forgotPassword: (email: string) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (email: string, token: string, password: string) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ email, token, password }) }),
  verifyEmail: (email: string, otp: string) => request('/auth/verify-email', { method: 'POST', body: JSON.stringify({ email, otp }) }),
  getMe: () => request('/auth/me'),
  refreshToken: (refresh_token: string) => request('/auth/refresh', { method: 'POST', body: JSON.stringify({ refresh_token }) }),
};

export const productsApi = {
  getProducts: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/products${qs}`);
  },
  getProduct: (id: string) => request(`/products/${id}`),
  getCategories: () => request('/products/categories/all'),
  searchProducts: (q: string) => request(`/products?q=${encodeURIComponent(q)}`),
};

export const cartApi = {
  getCart: () => request('/cart'),
  addToCart: (productId: string, quantity = 1) => request('/cart/add', { method: 'POST', body: JSON.stringify({ product_id: productId, quantity }) }),
  updateCartItem: (itemId: string, quantity: number) => request(`/cart/update/${itemId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  removeCartItem: (itemId: string) => request(`/cart/remove/${itemId}`, { method: 'DELETE' }),
  clearCart: () => request('/cart', { method: 'DELETE' }),
};

export const ordersApi = {
  getOrders: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/orders${qs}`);
  },
  getOrder: (id: string) => request(`/orders/${id}`),
  cancelOrder: (id: string) => request(`/orders/${id}/cancel`, { method: 'POST' }),
  returnOrder: (id: string, reason: string) => request(`/orders/${id}/return`, { method: 'POST', body: JSON.stringify({ reason }) }),
  getOrderTimeline: (id: string) => request(`/orders/${id}/timeline`),
};

export const wishlistApi = {
  getWishlist: () => request('/wishlist'),
  addToWishlist: (productId: string) => request(`/wishlist/add/${productId}`, { method: 'POST' }),
  removeFromWishlist: (productId: string) => request(`/wishlist/remove/${productId}`, { method: 'DELETE' }),
};

export const reviewsApi = {
  getProductReviews: (productId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/products/${productId}/reviews${qs}`);
  },
  createReview: (productId: string, data: { rating: number; content: string; title?: string }) => request(`/products/${productId}/reviews`, { method: 'POST', body: JSON.stringify(data) }),
  updateReview: (reviewId: string, data: { rating?: number; content?: string }) => request(`/reviews/${reviewId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteReview: (reviewId: string) => request(`/reviews/${reviewId}`, { method: 'DELETE' }),
  voteReview: (reviewId: string, vote: 'helpful' | 'not_helpful') => request(`/reviews/${reviewId}/vote`, { method: 'POST', body: JSON.stringify({ vote }) }),
};

export const checkoutApi = {
  checkout: (data: { shipping_address: string; payment_method: string; coupon_code?: string; gift_message?: string; is_gift?: boolean; one_click?: boolean }) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  validateCoupon: (code: string) => request('/coupons/validate', { method: 'POST', body: JSON.stringify({ code }) }),
};

export const notificationsApi = {
  getNotifications: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/notifications${qs}`);
  },
  getUnreadCount: () => request('/notifications/unread-count'),
  markRead: (id: string) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllRead: () => request('/notifications/read-all', { method: 'PUT' }),
  updateNotificationSettings: (data: Record<string, unknown>) => request('/notifications/settings', { method: 'PUT', body: JSON.stringify(data) }),
};

export const profileApi = {
  updateProfile: (data: Record<string, unknown>) => request('/auth/me', { method: 'PUT', body: JSON.stringify(data) }),
  updatePassword: (data: { current_password: string; new_password: string }) => request('/auth/password', { method: 'PUT', body: JSON.stringify(data) }),
  getAddresses: () => request('/addresses'),
  saveAddress: (data: Record<string, unknown>) => request('/addresses', { method: 'POST', body: JSON.stringify(data) }),
  deleteAddress: (id: string) => request(`/addresses/${id}`, { method: 'DELETE' }),
};

export const sellersApi = {
  getSellers: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/sellers${qs}`);
  },
  getSeller: (id: string) => request(`/sellers/${id}`),
  registerSeller: (data: Record<string, unknown>) => request('/sellers/register', { method: 'POST', body: JSON.stringify(data) }),
  updateSeller: (id: string, data: Record<string, unknown>) => request(`/sellers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getSellerProducts: (sellerId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/sellers/${sellerId}/products${qs}`);
  },
  getSellerPayouts: (sellerId: string) => request(`/sellers/${sellerId}/payouts`),
};

export const inventoryApi = {
  getInventory: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/inventory${qs}`);
  },
  getInventoryItem: (id: string) => request(`/inventory/${id}`),
  updateInventory: (id: string, data: Record<string, unknown>) => request(`/inventory/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getTransactions: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/inventory/transactions${qs}`);
  },
  createTransaction: (data: Record<string, unknown>) => request('/inventory/transactions', { method: 'POST', body: JSON.stringify(data) }),
  getWarehouses: () => request('/inventory/warehouses'),
  getLowStockAlerts: () => request('/inventory/low-stock'),
};

export const paymentsApi = {
  getSavedCards: () => request('/payments/cards'),
  saveCard: (data: Record<string, unknown>) => request('/payments/cards', { method: 'POST', body: JSON.stringify(data) }),
  deleteCard: (id: string) => request(`/payments/cards/${id}`, { method: 'DELETE' }),
  setDefaultCard: (id: string) => request(`/payments/cards/${id}/default`, { method: 'PUT' }),
  getRefunds: () => request('/payments/refunds'),
};

export const deliveryApi = {
  getShipment: (id: string) => request(`/delivery/shipments/${id}`),
  getOrderShipments: (orderId: string) => request(`/delivery/orders/${orderId}/shipments`),
  trackShipment: (trackingNumber: string) => request(`/delivery/track/${trackingNumber}`),
};

export const flashSalesApi = {
  getActiveFlashSales: () => request('/flash-sales/active'),
  getUpcomingFlashSales: () => request('/flash-sales/upcoming'),
  getFlashSaleItems: (saleId: string) => request(`/flash-sales/${saleId}/items`),
};

export const priceAlertsApi = {
  getPriceAlerts: () => request('/features/price-alerts'),
  createPriceAlert: (productId: string, targetPrice: number) => request('/features/price-alerts', { method: 'POST', body: JSON.stringify({ product_id: productId, target_price: targetPrice }) }),
  updatePriceAlert: (id: string, data: Record<string, unknown>) => request(`/features/price-alerts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePriceAlert: (id: string) => request(`/features/price-alerts/${id}`, { method: 'DELETE' }),
};

export const loyaltyApi = {
  getPoints: () => request('/features/loyalty/summary'),
  getTransactions: (limit = 50) => request(`/features/loyalty/points?limit=${limit}`),
  getDailyReward: () => request('/features/daily-rewards'),
  claimDailyReward: () => request('/features/daily-rewards/claim', { method: 'POST' }),
  getReferrals: () => request('/features/referrals'),
  createReferral: (email: string) => request('/features/referrals', { method: 'POST', body: JSON.stringify({ referred_email: email }) }),
  getLeaderboard: () => request('/features/leaderboard'),
};

export const primeApi = {
  getSubscription: () => request('/prime/subscription'),
  createCheckout: (plan: string) => request('/prime/create-checkout', { method: 'POST', body: JSON.stringify({ plan }) }),
  cancelSubscription: () => request('/prime/cancel', { method: 'POST' }),
  getPrimeBenefits: () => request('/prime/benefits'),
};

export const communityApi = {
  getDiscussions: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/community/discussions${qs}`);
  },
  createDiscussion: (data: { title: string; content: string; tags?: string[] }) => request('/community/discussions', { method: 'POST', body: JSON.stringify(data) }),
  getDiscussion: (id: string) => request(`/community/discussions/${id}`),
  updateDiscussion: (id: string, data: Record<string, unknown>) => request(`/community/discussions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDiscussion: (id: string) => request(`/community/discussions/${id}`, { method: 'DELETE' }),
  addReply: (discussionId: string, content: string) => request(`/community/discussions/${discussionId}/replies`, { method: 'POST', body: JSON.stringify({ content }) }),
  toggleDiscussionLike: (id: string) => request(`/community/discussions/${id}/like`, { method: 'POST' }),
  toggleReplyLike: (discussionId: string, replyId: string) => request(`/community/discussions/${discussionId}/replies/${replyId}/like`, { method: 'POST' }),
  getTrendingDiscussions: () => request('/community/discussions/trending'),
  shareProduct: (productId: string, platform: string) => request('/community/share', { method: 'POST', body: JSON.stringify({ product_id: productId, platform }) }),
};

export const supportApi = {
  getTickets: () => request('/features/support-tickets'),
  createTicket: (data: { subject: string; message: string; priority?: string }) => request('/features/support-tickets', { method: 'POST', body: JSON.stringify(data) }),
  getTicket: (id: string) => request(`/features/support-tickets/${id}`),
  addTicketMessage: (ticketId: string, message: string) => request(`/features/support-tickets/${ticketId}/messages`, { method: 'POST', body: JSON.stringify({ message }) }),
  getTicketMessages: (ticketId: string) => request(`/features/support-tickets/${ticketId}/messages`),
  getKnowledgeBase: () => request('/support/knowledge-base'),
  getKnowledgeBaseArticle: (slug: string) => request(`/support/knowledge-base/${slug}`),
};

export const adminApi = {
  getAuditLogs: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/admin/audit-logs${qs}`);
  },
  getFeatureFlags: () => request('/features/feature-flags'),
  createFeatureFlag: (data: Record<string, unknown>) => request('/features/feature-flags', { method: 'POST', body: JSON.stringify(data) }),
  updateFeatureFlag: (id: string, data: Record<string, unknown>) => request(`/features/feature-flags/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteFeatureFlag: (id: string) => request(`/features/feature-flags/${id}`, { method: 'DELETE' }),
  getABTests: () => request('/features/ab-tests'),
  createABTest: (data: Record<string, unknown>) => request('/features/ab-tests', { method: 'POST', body: JSON.stringify(data) }),
  updateABTest: (id: string, data: Record<string, unknown>) => request(`/features/ab-tests/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  startABTest: (id: string) => request(`/features/ab-tests/${id}/start`, { method: 'POST' }),
  stopABTest: (id: string) => request(`/features/ab-tests/${id}/stop`, { method: 'POST' }),
  getABTestResults: (id: string) => request(`/features/ab-tests/${id}/results`),
};

export { ApiError };
export type { ApiResponse };
