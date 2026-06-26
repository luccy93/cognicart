export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: 'customer' | 'admin' | 'super_admin';
  is_active: boolean;
  is_verified: boolean;
  is_email_verified: boolean;
  email_verified_at: string | null;
  last_login: string | null;
  failed_login_attempts: number;
  bio: string | null;
  shipping_address: string | null;
  city: string | null;
  country: string | null;
  loyalty_points: number;
  tier: string;
  total_orders: number;
  total_spent: number;
  preferred_categories: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  icon: string | null;
  parent_id: string | null;
  is_active: boolean;
  sort_order: number;
  product_count: number;
}

export interface ProductImage {
  id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number;
  original_price: number | null;
  currency: string;
  stock: number;
  sku: string | null;
  thumbnail_url: string | null;
  average_rating: number;
  total_ratings: number;
  total_reviews: number;
  total_purchases: number;
  popularity_score: number;
  is_active: boolean;
  is_featured: boolean;
  is_trending: boolean;
  brand: string | null;
  tags: string | null;
  category_id: string;
  category: Category | null;
  images: ProductImage[];
  ai_match_score: number | null;
  created_at: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  product: {
    id: string;
    name: string;
    price: number;
    thumbnail_url: string | null;
    stock: number;
  };
  quantity: number;
  total_price: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  item_count: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  subtotal: number;
  tax: number;
  shipping_cost: number;
  discount: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  shipping_address: string;
  tracking_number: string | null;
  items: OrderItem[];
  created_at: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product: Product;
  quantity: number;
  price: number;
  total_price: number;
}

export interface Recommendation {
  id: string;
  product_id: string;
  score: number;
  engine: string;
  recommendation_type: string;
  product: Product;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  title: string | null;
  content: string;
  rating: number;
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  icon: string;
  time: string;
  type: string;
  read: boolean;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface ApiError {
  detail: string | { msg: string }[];
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ────── NEW FEATURE TYPES ──────

export interface UserPersona {
  persona_type: string;
  persona_label: string;
  confidence: number;
  features: Record<string, number>;
  last_updated: string;
}

export interface RecommendationExplanation {
  id: string;
  product_id: string;
  reason: string;
  reason_type: string;
  confidence: number;
  feature_importance: Record<string, number>;
  engine_contribution: Record<string, number>;
}

export interface ExplanationDetail {
  reasons: RecommendationExplanation[];
  confidence_overall: number;
  top_features: { feature: string; importance: number }[];
  engine_breakdown: Record<string, number>;
}

export interface LoyaltySummary {
  total_points: number;
  tier: string;
  points_to_next_tier: number;
  tier_progress: number;
  recent_points: LoyaltyPoint[];
}

export interface LoyaltyPoint {
  id: string;
  points: number;
  source: string;
  description: string | null;
  created_at: string;
}

export interface DailyReward {
  day_sequence: number;
  reward_type: string;
  reward_value: number;
  claimed: boolean;
  claimed_at: string | null;
}

export interface DailyRewardClaimResult {
  claimed: boolean;
  reward_type: string;
  reward_value: number;
  current_streak: number;
  message: string;
}

export interface UserStreak {
  current_streak: number;
  longest_streak: number;
  streak_type: string;
  last_activity_date: string | null;
}

export interface ReferralStats {
  total_referrals: number;
  successful_referrals: number;
  pending_referrals: number;
  total_rewards_earned: number;
  referral_link: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string | null;
  enabled: boolean;
  enabled_for_roles: string[];
  enabled_for_users: string[];
  created_at: string;
}

export interface ABTest {
  id: string;
  name: string;
  description: string | null;
  experiment_type: string;
  is_active: boolean;
  variant_a_impressions: number;
  variant_b_impressions: number;
  variant_a_conversions: number;
  variant_b_conversions: number;
  variant_a_config: Record<string, unknown>;
  variant_b_config: Record<string, unknown>;
  started_at: string;
  ended_at: string | null;
}

export interface NPSFeedback {
  score: number;
  reason: string | null;
  category: string | null;
  created_at: string;
}

export interface NPSAnalytics {
  average_score: number;
  total_responses: number;
  promoters: number;
  passives: number;
  detractors: number;
  nps_score: number;
}

export interface PriceAlert {
  id: string;
  product_id: string;
  target_price: number;
  current_price: number | null;
  is_triggered: boolean;
  created_at: string;
}

export interface StockAlert {
  id: string;
  product_id: string;
  is_available: boolean;
  notified: boolean;
  created_at: string;
}

export interface ProductComparison {
  id: string;
  product_ids: string[];
  updated_at: string;
}

export interface AchievementBadge {
  id: string;
  badge_type: string;
  badge_label: string;
  badge_icon: string;
  description: string | null;
  earned: boolean;
  progress: number;
  earned_at: string | null;
}

export interface UserProfilePublic {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  tier: string;
  total_orders: number;
  total_spent: number;
}

export interface CommunityRecommendation {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  product_id: string;
  product_name: string | null;
  recommendation_text: string | null;
  likes_count: number;
  created_at: string;
}

export interface SmartReturn {
  id: string;
  order_id: string;
  product_id: string;
  reason: string;
  status: string;
  refund_amount: number | null;
  refund_status: string;
  tracking_number: string | null;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

export interface ThemePreference {
  theme: string;
  accent_color: string;
  font_size: string;
  reduced_motion: boolean;
  high_contrast: boolean;
}

export interface DashboardLayout {
  layout_config: Record<string, unknown>;
  pinned_sections: string[];
  hidden_sections: string[];
  widget_order: string[];
}

export interface SmartCoupon {
  coupon_id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  savings_amount: number;
  reason: string;
}

export interface UserSpending {
  monthly_spending: Record<string, number>;
  category_spending: Record<string, number>;
  average_order_value: number;
  total_savings: number;
  spending_trend: string;
}

export interface CustomerLifetimeValue {
  clv_score: number;
  retention_score: number;
  engagement_score: number;
  predicted_clv: number;
  segment: string;
}

export interface ProductTrend {
  product_id: string;
  product_name: string;
  trend_score: number;
  trend_direction: string;
  predicted_popularity: number;
}

export interface TrendAnalysis {
  trending_products: ProductTrend[];
  trending_categories: { category_id: string; product_count: number }[];
}

export interface SocialProof {
  purchases_24h: number;
  current_viewers: number;
  total_purchases: number;
  stock_status: string;
  stock_count: number;
}

export interface XAIDashboard {
  total_explanations: number;
  average_confidence: number;
  reason_type_distribution: Record<string, number>;
  engine_contribution: Record<string, number>;
  feature_importance: Record<string, number>;
  recent_explanations: { product_id: string; reason: string; reason_type: string; confidence: number }[];
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: string;
  content: string;
  created_at: string;
}

export interface ChatSession {
  session_id: string;
  messages: ChatMessage[];
}

export interface NotificationSchedule {
  notification_type: string;
  channel: string;
  enabled: boolean;
  frequency: string;
}

export interface OnboardingProgress {
  completed_steps: string[];
  current_step: number;
  skipped: boolean;
  completed: boolean;
}

// ────── AI FEATURE TYPES ──────

export interface ShoppingDNA {
  persona_type: string;
  persona_label: string;
  confidence: number;
  preferred_brands: string[];
  preferred_categories: string[];
  average_monthly_spend: number;
  shopping_pattern: string;
  style_preferences: Record<string, unknown>;
  price_sensitivity: string;
  brand_loyalty_score: number;
  category_affinity_scores: Record<string, number>;
  purchase_frequency: string;
  average_cart_value: number;
  favorite_features: string[];
  features: Record<string, unknown>;
  last_analyzed: string | null;
}

export interface AITask {
  id: string;
  task_type: string;
  title: string;
  description: string | null;
  status: string;
  params: Record<string, unknown>;
  result: Record<string, unknown>;
  progress: number;
  scheduled_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface TrackedProduct {
  id: string;
  product_id: string;
  product_name: string | null;
  product_image: string | null;
  current_price: number | null;
  target_price: number | null;
  price_drop_threshold: number | null;
  notify_on_price_drop: boolean;
  notify_on_stock: boolean;
  auto_buy_enabled: boolean;
  auto_buy_max_price: number | null;
  is_active: boolean;
  last_checked_price: number | null;
  lowest_price_seen: number | null;
  highest_price_seen: number | null;
  price_history: { price: number; date: string }[];
  created_at: string;
}

export interface AutoBuyRule {
  id: string;
  name: string;
  product_id: string | null;
  category_id: string | null;
  condition_type: string;
  condition_value: number;
  max_price: number | null;
  quantity: number;
  payment_method: string | null;
  shipping_address_id: string | null;
  is_active: boolean;
  last_triggered_at: string | null;
  total_executions: number;
  created_at: string;
}

export interface PricePrediction {
  id: string;
  product_id: string;
  product_name: string | null;
  product_image: string | null;
  current_price: number;
  predicted_price: number;
  predicted_price_range_min: number | null;
  predicted_price_range_max: number | null;
  expected_drop_amount: number;
  expected_drop_percentage: number;
  confidence: number;
  predicted_drop_date: string | null;
  prediction_horizon_days: number;
  factors: Record<string, unknown>;
  created_at: string;
}

export interface GiftRecommendationRequest {
  recipient_name?: string;
  recipient_age_group?: string;
  relationship?: string;
  occasion: string;
  budget: number;
  interests?: string[];
  personality_type?: string;
}

export interface GiftRecommendation {
  id: string;
  recipient_name: string | null;
  occasion: string;
  budget: number;
  recommended_products: any[];
  bundle_products: any[];
  total_bundle_price: number | null;
  reasoning: string | null;
  created_at: string;
}

export interface ReorderPrediction {
  id: string;
  product_id: string;
  product_name: string | null;
  product_image: string | null;
  predicted_next_order_date: string | null;
  confidence: number;
  frequency_days: number | null;
  times_purchased: number;
  last_purchased: string | null;
  is_active: boolean;
}

export interface XPLevel {
  current_xp: number;
  total_xp_earned: number;
  level: number;
  xp_to_next_level: number;
  level_title: string;
}

export interface Achievement {
  id: string;
  achievement_key: string;
  title: string;
  description: string | null;
  category: string;
  icon: string;
  xp_reward: number;
  progress_current: number;
  progress_target: number;
  is_earned: boolean;
  earned_at: string | null;
}

export interface UserPreference {
  storefront_theme: string;
  homepage_layout: string;
  preferred_categories: string[];
  excluded_categories: string[];
  price_range_min: number | null;
  price_range_max: number | null;
  preferred_brands: string[];
  excluded_brands: string[];
  notify_deals: boolean;
  notify_price_drops: boolean;
  notify_new_arrivals: boolean;
  notify_reorder: boolean;
  language: string;
}

export interface ConciergeMessage {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  action_url: string | null;
  action_label: string | null;
  product_id: string | null;
  product_name: string | null;
  product_image: string | null;
  created_at: string;
  is_read: boolean;
}

export interface DynamicHomepage {
  greeting: string;
  time_based_banner: string | null;
  seasonal_banner: string | null;
  featured_categories: any[];
  hero_products: any[];
  personalized_deals: any[];
  recommended_sections: any[];
  storefront_theme: string;
}

export interface ARSession {
  id: string;
  product_id: string | null;
  session_type: string;
  status: string;
  image_url: string | null;
  result_image_url: string | null;
  model_data: Record<string, unknown>;
  created_at: string;
}
