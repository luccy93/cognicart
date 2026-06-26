'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { recommendationsApi, productsApi, analyticsApi, wishlistApi, featuresApi, aiApi } from '@/lib/api';
import Link from 'next/link';
import { SmartSearch } from '@/components/search/smart-search';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { ProductCard } from '@/components/product/product-card';
import { SocialProof } from '@/components/product/social-proof';
import { CommunityDiscussions, TrendingReviews } from '@/components/community/index';
import { BadgeDisplay, StreakDisplay, LoyaltyCard } from '@/components/gamification/index';
import { ProductCardSkeleton } from '@/components/ui/skeleton';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Product, Recommendation, ProductTrend, AchievementBadge, ShoppingDNA, ReorderPrediction, PricePrediction, XPLevel, Achievement, ConciergeMessage } from '@/types';
import { PersonaBadge } from '@/components/features/persona-badge';
import { RecommendationExplanationCard, XAIDashboardPanel } from '@/components/features/explanation-cards';
import {
  LoyaltyCardFront, DailyRewardsGrid, StreakDisplayFront, ReferralCard,
  AchievementGrid, SmartCouponBanner, SpendingOverview, CLVCard, TrendCard,
  SocialProofCounter, PriceAlertForm
} from '@/components/features/feature-cards';
import { ThemeCustomizer, NPSSurvey, OnboardingTour, SupportTicketForm, ReturnForm, ShareButtons } from '@/components/features/extra-features';
import { LiveActivityFeed } from '@/components/websocket/live-activity-feed';
import { InfinityLoopIcon } from '@/components/ui/InfinityLoopIcon';
import { DiamondIcon, FireIcon, PartyIcon, RocketIcon, ShoppingBagsIcon, StarIcon, GiftIcon, TargetIcon, BellIcon, TrophyIcon, CheckCircleIcon } from '@/components/ui/emoji-icons';
import { ConciergeBar } from '@/components/ai/concierge';

const sampleProducts: Product[] = [
  { id: 'p1', name: 'Wireless Earbuds Pro', price: 976.62, original_price: 1209.82, average_rating: 4.9, total_ratings: 295, total_purchases: 173, total_reviews: 120, thumbnail_url: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&h=300&fit=crop', ai_match_score: 0.96, is_featured: true, is_active: true, is_trending: true, brand: 'EliteBrand', tags: 'electronics', stock: 50, popularity_score: 85, category_id: 'c1', slug: 'wireless-earbuds-pro', description: 'Premium wireless earbuds', short_description: 'High-quality earbuds', currency: 'INR', sku: 'SKU-001', category: null, images: [], created_at: '2025-01-01T00:00:00Z' },
  { id: 'p2', name: 'Mechanical Keyboard RGB', price: 1245.29, original_price: null, average_rating: 4.3, total_ratings: 300, total_purchases: 147, total_reviews: 89, thumbnail_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop', ai_match_score: 0.94, is_featured: true, is_active: true, is_trending: true, brand: 'SmartGear', tags: 'gaming', stock: 100, popularity_score: 77, category_id: 'c2', slug: 'mechanical-keyboard-rgb', description: 'RGB mechanical keyboard', short_description: 'Premium keyboard', currency: 'INR', sku: 'SKU-002', category: null, images: [], created_at: '2025-01-01T00:00:00Z' },
  { id: 'p3', name: 'Smart Watch Ultra', price: 1285.46, original_price: 1430.13, average_rating: 3.6, total_ratings: 369, total_purchases: 281, total_reviews: 145, thumbnail_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop', ai_match_score: 0.91, is_featured: true, is_active: true, is_trending: false, brand: 'TechPro', tags: 'wearables', stock: 125, popularity_score: 55, category_id: 'c3', slug: 'smart-watch-ultra', description: 'Premium smartwatch', short_description: 'High-quality smartwatch', currency: 'INR', sku: 'SKU-003', category: null, images: [], created_at: '2025-01-01T00:00:00Z' },
  { id: 'p4', name: 'Gaming Mouse X', price: 702.67, original_price: 826.12, average_rating: 3.7, total_ratings: 420, total_purchases: 155, total_reviews: 200, thumbnail_url: 'https://images.unsplash.com/photo-1527864550417-2fd06e9c5f5f?w=400&h=300&fit=crop', ai_match_score: 0.89, is_featured: true, is_active: true, is_trending: true, brand: 'TechPro', tags: 'gaming', stock: 131, popularity_score: 97, category_id: 'c4', slug: 'gaming-mouse-x', description: 'Gaming mouse', short_description: 'High-quality mouse', currency: 'INR', sku: 'SKU-004', category: null, images: [], created_at: '2025-01-01T00:00:00Z' },
  { id: 'p5', name: 'Noise Cancelling Headphones', price: 420.12, original_price: 531.82, average_rating: 4.0, total_ratings: 232, total_purchases: 169, total_reviews: 110, thumbnail_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop', ai_match_score: 0.87, is_featured: false, is_active: true, is_trending: false, brand: 'CogniTech', tags: 'audio', stock: 80, popularity_score: 80, category_id: 'c5', slug: 'noise-cancelling-headphones', description: 'ANC headphones', short_description: 'Premium headphones', currency: 'INR', sku: 'SKU-005', category: null, images: [], created_at: '2025-01-01T00:00:00Z' },
  { id: 'p6', name: 'USB-C Hub 7-in-1', price: 659.98, original_price: 755.70, average_rating: 4.4, total_ratings: 197, total_purchases: 289, total_reviews: 95, thumbnail_url: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400&h=300&fit=crop', ai_match_score: 0.85, is_featured: false, is_active: true, is_trending: false, brand: 'EliteBrand', tags: 'accessories', stock: 74, popularity_score: 85, category_id: 'c6', slug: 'usb-c-hub', description: 'USB-C hub', short_description: '7-in-1 hub', currency: 'INR', sku: 'SKU-006', category: null, images: [], created_at: '2025-01-01T00:00:00Z' },
  { id: 'p7', name: 'Portable SSD 1TB', price: 1488.81, original_price: 1771.55, average_rating: 3.9, total_ratings: 41, total_purchases: 140, total_reviews: 25, thumbnail_url: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=400&h=300&fit=crop', ai_match_score: 0.82, is_featured: false, is_active: true, is_trending: false, brand: 'PrimeTech', tags: 'storage', stock: 155, popularity_score: 66, category_id: 'c1', slug: 'portable-ssd', description: 'Portable SSD', short_description: '1TB storage', currency: 'INR', sku: 'SKU-007', category: null, images: [], created_at: '2025-01-01T00:00:00Z' },
  { id: 'p8', name: 'Smart Home Hub', price: 576.62, original_price: 739.88, average_rating: 3.5, total_ratings: 368, total_purchases: 48, total_reviews: 30, thumbnail_url: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=300&fit=crop', ai_match_score: 0.79, is_featured: false, is_active: true, is_trending: false, brand: 'SmartGear', tags: 'smart-home', stock: 17, popularity_score: 73, category_id: 'c2', slug: 'smart-home-hub', description: 'Smart home hub', short_description: 'Smart home device', currency: 'INR', sku: 'SKU-008', category: null, images: [], created_at: '2025-01-01T00:00:00Z' },
];

const flashDeals = [
  { id: 'f1', name: 'Sony WH-1000XM5', price: 24999, original_price: 39990, discount: 37, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop', endsIn: '2h 15m' },
  { id: 'f2', name: 'MacBook Air M3', price: 84999, original_price: 114990, discount: 26, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop', endsIn: '5h 30m' },
  { id: 'f3', name: 'Samsung Galaxy Watch 6', price: 24999, original_price: 35999, discount: 30, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop', endsIn: '1h 45m' },
  { id: 'f4', name: 'AirPods Pro 2', price: 18999, original_price: 24999, discount: 24, image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b3e2?w=400&h=300&fit=crop', endsIn: '3h 00m' },
];

const sampleBadges = [
  { id: 'b1', name: 'First Purchase', icon: <StarIcon size={14} />, earned: true, description: 'Completed first order' },
  { id: 'b2', name: 'Early Adopter', icon: <RocketIcon size={14} />, earned: true, description: 'Joined in first month' },
  { id: 'b3', name: 'Review Star', icon: <StarIcon size={14} />, earned: true, description: 'Wrote 5 reviews' },
  { id: 'b4', name: 'Shopaholic', icon: <ShoppingBagsIcon size={14} />, earned: false, description: '10 orders placed' },
  { id: 'b5', name: 'Streak Master', icon: <FireIcon size={14} />, earned: false, description: '7-day streak' },
  { id: 'b6', name: 'Deal Hunter', icon: <DiamondIcon size={14} />, earned: true, description: 'Bought 3 discounted items' },
];

const achievementSamples: AchievementBadge[] = [
  { id: 'b1', badge_type: 'purchase', badge_label: 'First Purchase', badge_icon: 'P', description: 'Completed first order', earned: true, progress: 100, earned_at: new Date().toISOString() },
  { id: 'b2', badge_type: 'milestone', badge_label: 'Early Adopter', badge_icon: 'E', description: 'Joined in first month', earned: true, progress: 100, earned_at: new Date().toISOString() },
  { id: 'b3', badge_type: 'review', badge_label: 'Review Star', badge_icon: 'R', description: 'Wrote 5 reviews', earned: true, progress: 100, earned_at: new Date().toISOString() },
  { id: 'b4', badge_type: 'purchase', badge_label: 'Shopaholic', badge_icon: 'S', description: '10 orders placed', earned: false, progress: 40, earned_at: null },
  { id: 'b5', badge_type: 'streak', badge_label: 'Streak Master', badge_icon: '!', description: '7-day streak', earned: false, progress: 70, earned_at: null },
  { id: 'b6', badge_type: 'deal', badge_label: 'Deal Hunter', badge_icon: 'D', description: 'Bought 3 discounted items', earned: true, progress: 100, earned_at: new Date().toISOString() },
];

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === 0) return;
    const duration = 1200;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) { setDisplay(value); clearInterval(timer); }
      else { setDisplay(Math.floor(current)); }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display.toLocaleString('en-US')}{suffix}</>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

const tabConfig = [
  { id: 'overview', label: 'Overview', icon: <svg key="ov" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
  { id: 'recommended', label: 'For You', icon: <svg key="rf" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5z"/><path d="M19 17l-1.5-1.5"/><path d="M5 17l1.5-1.5"/><path d="M12 22v-3"/></svg> },
  { id: 'deals', label: 'Flash Deals', icon: <svg key="fd" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10"/></svg> },
  { id: 'gamification', label: 'Rewards', icon: <svg key="gw" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M6 5v9a6 6 0 0 0 12 0V5"/><path d="M12 14v5"/><path d="M8 22h8"/></svg> },
  { id: 'community', label: 'Community', icon: <svg key="cm" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { id: 'insights', label: 'Insights', icon: <svg key="in" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  { id: 'xai', label: 'XAI', icon: <svg key="xa" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5V12l-2-1-2 1V9.5c-1.2-.7-2-2-2-3.5a4 4 0 0 1 4-4z"/><path d="M12 14v4"/><path d="M8 18h8"/><path d="M12 22v-4"/></svg> },
  { id: 'settings', label: 'Settings', icon: <svg key="st" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
];

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showConcierge, setShowConcierge] = useState(true);
  const [showDealPredictor, setShowDealPredictor] = useState(false);
  const { addItem } = useCartStore();

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
    const seen = localStorage.getItem('cognicart-onboarding-seen');
    if (!seen) setTimeout(() => setShowOnboarding(true), 1000);
  }, [isAuthenticated, router]);

  const { data: recsData, isLoading: recsLoading } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => recommendationsApi.personalized(12),
    enabled: isAuthenticated,
  });

  const { data: trendingData } = useQuery({
    queryKey: ['trending'],
    queryFn: () => recommendationsApi.trending(8),
    enabled: isAuthenticated,
  });

  const { data: personaData } = useQuery({
    queryKey: ['persona'],
    queryFn: () => featuresApi.getPersona(),
    enabled: isAuthenticated,
  });

  const { data: explanationsData } = useQuery({
    queryKey: ['explanations'],
    queryFn: () => featuresApi.getExplanationDetail(),
    enabled: isAuthenticated,
  });

  const { data: loyaltyData } = useQuery({
    queryKey: ['loyalty-summary'],
    queryFn: () => featuresApi.getLoyaltySummary(),
    enabled: isAuthenticated,
  });

  const { data: streakData } = useQuery({
    queryKey: ['streaks'],
    queryFn: () => featuresApi.getStreaks(),
    enabled: isAuthenticated,
  });

  const { data: referralsData } = useQuery({
    queryKey: ['referral-stats'],
    queryFn: () => featuresApi.getReferralStats(),
    enabled: isAuthenticated,
  });

  const { data: spendingData } = useQuery({
    queryKey: ['spending-analytics'],
    queryFn: () => featuresApi.getSpendingAnalytics(),
    enabled: isAuthenticated,
  });

  const { data: clvData } = useQuery({
    queryKey: ['clv'],
    queryFn: () => featuresApi.getCLV(),
    enabled: isAuthenticated,
  });

  const { data: trendData } = useQuery({
    queryKey: ['trend-analysis'],
    queryFn: () => featuresApi.getTrendAnalysis(),
    enabled: isAuthenticated,
  });

  const { data: dnaData } = useQuery({
    queryKey: ['shopping-dna'],
    queryFn: () => aiApi.getShoppingDNA(),
    enabled: isAuthenticated,
  });

  const { data: conciergeData } = useQuery({
    queryKey: ['concierge'],
    queryFn: () => aiApi.getConciergeMessages(),
    enabled: isAuthenticated,
  });

  const { data: reorderData } = useQuery({
    queryKey: ['reorder-predictions'],
    queryFn: () => aiApi.getReorderPredictions(),
    enabled: isAuthenticated,
  });

  const { data: pricePredData } = useQuery({
    queryKey: ['price-predictions'],
    queryFn: () => aiApi.getPricePredictions(),
    enabled: isAuthenticated,
  });

  const { data: xpData } = useQuery({
    queryKey: ['xp'],
    queryFn: () => aiApi.getXP(),
    enabled: isAuthenticated,
  });

  const { data: achievementsData } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => aiApi.getAchievements(),
    enabled: isAuthenticated,
  });

  const persona = personaData?.data;
  const explanations = explanationsData?.data;
  const loyalty = loyaltyData?.data;
  const streak = streakData?.data;
  const spending = spendingData?.data;
  const clv = clvData?.data;
  const trends = trendData?.data;
  const dna = dnaData?.data as ShoppingDNA | undefined;
  const conciergeMessages = conciergeData?.data?.items as ConciergeMessage[] | undefined;
  const reorderPredictions = reorderData?.data?.items as ReorderPrediction[] | undefined;
  const pricePredictions = pricePredData?.data?.items as PricePrediction[] | undefined;
  const xp = xpData?.data as XPLevel | undefined;
  const achievements = achievementsData?.data?.items as Achievement[] | undefined;

  if (!isAuthenticated || !user) return null;

  const handleAddToCart = (productId: string) => {
    addItem(productId, 1);
  };

  const handleWishlist = (productId: string) => {
    wishlistApi.add(productId).catch(() => {});
  };

  const displayProducts = recsData?.data?.items?.map((r: Recommendation) => r.product).filter(Boolean) || sampleProducts;

  return (
    <div className="min-h-screen">
      {showOnboarding && <OnboardingTour onComplete={() => { setShowOnboarding(false); localStorage.setItem('cognicart-onboarding-seen', 'true'); }} />}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="neural-grid glass-strong rounded-3xl p-6 sm:p-8 relative overflow-hidden isolate">
          <div className="absolute inset-0 bg-gradient-to-br from-[--primary]/20 via-purple-500/10 to-[--secondary]/20" />
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-[--primary]/10 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-[--secondary]/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-[--secondary] font-medium tracking-wider uppercase">Command Center</span>
                <h1 className="text-2xl sm:text-3xl font-space font-extrabold">
                  Welcome back, <span className="text-gradient-primary">{user.full_name?.split(' ')[0] || 'Alex'}</span>
                </h1>
              </div>
              <div className="flex items-center gap-3">
                {persona && <PersonaBadge personaLabel={persona.persona_label} confidence={persona.confidence} className="hidden md:block" />}
                <ThemeToggle />
                <Link href="/notifications" className="w-9 h-9 rounded-full glass flex items-center justify-center text-[--muted] hover:text-white transition-colors relative glow-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[--accent] text-[8px] flex items-center justify-center text-black font-bold">3</span>
                </Link>
              </div>
            </div>
            <p className="text-sm text-[--muted] mt-3 max-w-2xl">
              Based on your interests in <strong className="text-white">Gaming</strong> and <strong className="text-white">Wearables</strong>,
              we found <strong className="text-[--secondary]">25 new products</strong> for you.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {['Gaming', 'Wearables', 'Electronics', 'Smart Devices'].map((cat, i) => (
                <span key={i} className="text-[10px] px-2.5 py-1 rounded-full glass-pill text-[--muted] border border-white/5">{cat}</span>
              ))}
            </div>
          </div>
        </motion.div>

        {showConcierge && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-medium text-[--muted] uppercase tracking-wider flex items-center gap-1">
                <BellIcon size={10} />
                AI Concierge
              </span>
              <button onClick={() => setShowConcierge(false)} className="text-[10px] text-[--muted] hover:text-white transition-colors">Dismiss</button>
            </div>
            <ConciergeBar messages={conciergeMessages} />
          </motion.div>
        )}
        <button onClick={() => setShowConcierge(true)} className={cn('text-[10px] text-[--muted] hover:text-[--secondary] transition-colors flex items-center gap-1', showConcierge ? 'hidden' : 'mb-2')}>
          <BellIcon size={10} />
          Show Concierge Messages
        </button>

        <motion.div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none" variants={containerVariants} initial="hidden" animate="visible">
          {tabConfig.map(tab => (
            <motion.button
              key={tab.id}
              variants={itemVariants}
              onClick={() => setActiveTab(tab.id)}
              className={`glass-pill px-4 py-2 text-xs font-medium whitespace-nowrap transition-all duration-300 flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'glow-primary bg-gradient-to-r from-[--primary] to-[--secondary] text-black shadow-lg shadow-[--primary]/20'
                  : 'text-[--muted] hover:text-white hover:border-white/20 border border-transparent'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {activeTab === 'overview' && (
          <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
            <motion.div variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Orders', value: user.total_orders || 12, icon: <svg key="o" className="w-5 h-5 text-[--secondary]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>, sub: 'Last 30 days', accent: 'from-[--primary]/20 to-[--secondary]/10' },
                { label: 'Loyalty Points', value: loyalty?.total_points || user.loyalty_points || 2840, icon: <svg key="d" className="w-5 h-5 text-[--accent]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>, sub: `${loyalty?.tier || user.tier || 'Gold'} Tier`, accent: 'from-[--accent]/20 to-amber-500/10' },
                { label: 'Wishlist Items', value: 8, icon: <svg key="h" className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>, sub: '3 price drops', accent: 'from-red-500/20 to-pink-500/10' },
                { label: 'Shopping Streak', value: streak?.current_streak || 5, icon: <svg key="f" className="w-5 h-5 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5z"/><path d="M19 17l-1.5-1.5"/><path d="M5 17l1.5-1.5"/><path d="M12 22v-3"/></svg>, sub: `Best: ${streak?.longest_streak || 12}`, accent: 'from-orange-500/20 to-yellow-500/10' },
              ].map((s, i) => (
                <motion.div key={i} variants={itemVariants} whileHover={{ y: -6, scale: 1.02 }} className="glass-card rounded-2xl p-5 relative overflow-hidden group hover-glow-primary">
                  <div className={`absolute inset-0 bg-gradient-to-br ${s.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl glass flex items-center justify-center">
                        {s.icon}
                      </div>
                      <span className="text-[10px] text-[--muted] font-medium">{s.sub}</span>
                    </div>
                    <div className="text-2xl font-bold font-space">
                      <AnimatedCounter value={typeof s.value === 'number' ? s.value : parseInt(s.value) || 0} />
                    </div>
                    <div className="text-xs text-[--muted] mt-1">{s.label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {persona && (
              <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div variants={itemVariants}>
                  <PersonaBadge personaLabel={persona.persona_label} confidence={persona.confidence} />
                </motion.div>
                <motion.div variants={itemVariants} className="md:col-span-2 glass-card rounded-xl p-5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-[--primary]/5 via-transparent to-[--secondary]/5" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-md glass flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-[--secondary]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                      </div>
                      <p className="text-xs font-semibold text-gradient-primary">Why We Recommend What We Do</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'Avg Confidence', value: `${explanations?.confidence_overall || 94}%` },
                        { label: 'Engines Active', value: `${Object.keys(explanations?.engine_breakdown || {}).length || 3}` },
                        { label: 'Explanations', value: explanations?.total_explanations || 24 },
                        { label: 'Top Feature', value: explanations?.top_features?.[0]?.feature || 'Purchase History' },
                      ].map((s, i) => (
                        <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-center backdrop-blur-sm">
                          <p className="text-sm font-bold text-[--secondary]">{s.value}</p>
                          <p className="text-[10px] text-[--muted] mt-0.5">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            <motion.section variants={itemVariants}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold font-space text-gradient-primary">Recommended For You</h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[--primary]/15 text-[--primary] border border-[--primary]/20 glow-primary">AI Powered</span>
                </div>
                <Link href="/products" className="text-xs text-[--secondary] hover:underline">View All</Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {recsLoading
                  ? [1, 2, 3, 4].map(i => <ProductCardSkeleton key={i} />)
                  : displayProducts.slice(0, 4).map((product: Product, i: number) => (
                      <motion.div key={product.id || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <ProductCard product={product} onAddToCart={handleAddToCart} onWishlist={handleWishlist} />
                      </motion.div>
                    ))
                }
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold font-space text-gradient-primary">Flash Deals</h2>
                <span className="text-xs text-[--accent] font-medium flex items-center gap-1">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10"/></svg>
                  Limited time offers
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {flashDeals.map((deal, i) => (
                  <motion.div key={deal.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }} whileHover={{ y: -6, scale: 1.02 }} className="glass-card rounded-2xl overflow-hidden group"
                  >
                    <div className="relative aspect-[4/3] bg-[--surface]">
                      <img src={deal.image} alt={deal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-[--accent] text-black text-[10px] font-bold shadow-lg">-{deal.discount}%</div>
                      <div className="absolute bottom-2 left-2 glass-pill px-2 py-0.5 text-[10px] text-white flex items-center gap-1">
                        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        {deal.endsIn}
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="text-xs font-medium truncate">{deal.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold text-[--secondary]">₹{deal.price.toLocaleString('en-US')}</span>
                        <span className="text-[10px] text-[--muted] line-through">₹{deal.original_price.toLocaleString('en-US')}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <SocialProofCounter purchases24h={28} currentViewers={12} stockCount={3} />
                        <button className="text-[10px] px-3 py-1.5 rounded-lg bg-gradient-to-r from-[--primary] to-[--secondary] text-black font-medium hover:shadow-lg hover:shadow-[--primary]/20 transition-all">Grab</button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold font-space">Continue Shopping</h2>
                <Link href="/products" className="text-xs text-[--secondary] hover:underline">View History</Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {sampleProducts.slice(4, 8).map((product, i) => (
                  <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <ProductCard product={product} layout="compact" />
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {(reorderPredictions && reorderPredictions.length > 0) && (
              <motion.section variants={itemVariants}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <RocketIcon size={16} className="text-[--secondary]" />
                    <h2 className="text-lg font-semibold font-space text-gradient-primary">Reorder Predictions</h2>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[--primary]/15 text-[--primary] border border-[--primary]/20">AI</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {reorderPredictions.slice(0, 4).map((rp: ReorderPrediction, i: number) => (
                    <motion.div key={rp.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -4, scale: 1.02 }} className="glass-card rounded-2xl p-4 relative overflow-hidden group hover-glow-primary"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-[--primary]/5 via-transparent to-transparent" />
                      <div className="relative z-10">
                        <h3 className="text-xs font-semibold truncate">{rp.product_name || `Product #${rp.product_id}`}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-[10px] text-[--muted]">Purchased {rp.times_purchased}x</span>
                        </div>
                        <div className="mt-2 flex items-center gap-1">
                          <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${rp.confidence * 100}%` }}
                              className="h-full bg-gradient-to-r from-[--secondary] to-[--accent] rounded-full" transition={{ duration: 1 }} />
                          </div>
                          <span className="text-[10px] font-mono text-[--muted]">{Math.round(rp.confidence * 100)}%</span>
                        </div>
                        {rp.predicted_next_order_date && (
                          <p className="text-[10px] text-[--muted] mt-1">Next: {new Date(rp.predicted_next_order_date).toLocaleDateString()}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {pricePredictions && pricePredictions.length > 0 && (
              <motion.section variants={itemVariants}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TargetIcon size={16} className="text-[--accent]" />
                    <h2 className="text-lg font-semibold font-space text-gradient-primary">Smart Deal Predictor</h2>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[--accent]/20 text-[--accent] border border-[--accent]/30 glow-primary">AI Predicted Drops</span>
                  </div>
                  <button onClick={() => setShowDealPredictor(!showDealPredictor)} className="text-xs text-[--secondary] hover:underline">
                    {showDealPredictor ? 'Hide' : 'Show All'}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(showDealPredictor ? pricePredictions : pricePredictions.slice(0, 2)).map((pred: PricePrediction, i: number) => {
                    const savings = pred.current_price - pred.predicted_price;
                    return (
                      <motion.div key={pred.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                        className="glass-card rounded-2xl overflow-hidden group hover-glow-primary"
                      >
                        <div className="flex items-start p-4">
                          <div className="w-16 h-16 rounded-xl bg-[--surface] overflow-hidden flex-shrink-0">
                            {pred.product_image ? <img src={pred.product_image} alt={pred.product_name || ''} className="w-full h-full object-cover" /> : (
                              <div className="w-full h-full flex items-center justify-center"><DiamondIcon size={20} className="text-[--muted]" /></div>
                            )}
                          </div>
                          <div className="ml-3 flex-1 min-w-0">
                            <h3 className="text-sm font-semibold truncate">{pred.product_name || `Product #${pred.product_id}`}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-lg font-bold text-[--secondary]">₹{pred.current_price.toLocaleString('en-US')}</span>
                              <span className="text-xs text-green-400 line-through">₹{pred.predicted_price.toLocaleString('en-US')}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-medium">Save ₹{savings.toLocaleString('en-US')}</span>
                              <span className="text-[10px] text-[--muted]">-{pred.expected_drop_percentage.toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="px-4 pb-4">
                          <div className="flex items-center gap-2 text-xs text-[--muted]">
                            <span className="text-[10px]">Confidence:</span>
                            <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${pred.confidence}%` }}
                                className="h-full bg-gradient-to-r from-[--primary] to-[--secondary] rounded-full" transition={{ duration: 1 }} />
                            </div>
                            <span className="text-[10px] font-mono">{pred.confidence}%</span>
                          </div>
                          {pred.predicted_drop_date && (
                            <p className="text-[10px] text-[--muted] mt-1">Predicted drop: {new Date(pred.predicted_drop_date).toLocaleDateString()}</p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.section>
            )}

            <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div variants={itemVariants} className="lg:col-span-2">
                <CommunityDiscussions />
              </motion.div>
              <motion.div variants={containerVariants} className="space-y-4">
                <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-semibold font-space text-gradient-primary flex items-center gap-2">
                    <InfinityLoopIcon size={14} />
                    AI Insights
                  </h3>
                  {dna && (
                    <div>
                      <p className="text-xs text-[--muted] flex items-center gap-1">
                        <InfinityLoopIcon size={10} />
                        Shopping Persona
                      </p>
                      <p className="text-sm font-semibold mt-0.5">{dna.persona_label}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${(dna.confidence || 0) * 100}%` }}
                            className="h-full bg-gradient-to-r from-[--primary] to-[--secondary] rounded-full" transition={{ duration: 1 }} />
                        </div>
                        <span className="text-[10px] font-mono text-[--muted]">{Math.round((dna.confidence || 0) * 100)}%</span>
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-[--muted]">Preferred Categories</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(dna?.preferred_categories?.length ? dna.preferred_categories : ['Electronics', 'Gaming', 'Wearables', 'Smart Devices']).map((p, i) => (
                        <span key={i} className="text-[10px] px-2 py-1 rounded-full glass-pill text-white border border-white/10">{p}</span>
                      ))}
                    </div>
                  </div>
                  {dna?.shopping_pattern && (
                    <div className="text-[10px] text-[--muted]">
                      <span className="font-medium text-white/70">Pattern:</span> {dna.shopping_pattern?.replace('_', ' ')}
                      {dna.price_sensitivity && <span className="ml-2">| <span className="font-medium text-white/70">Price:</span> {dna.price_sensitivity}</span>}
                    </div>
                  )}
                  <div className="pt-3 border-t border-white/5">
                    <p className="text-xs text-[--muted]">Recommendation Confidence</p>
                    <p className="text-lg font-bold mt-1 text-gradient-primary">{explanations?.confidence_overall || 94}%</p>
                    <div className="w-full h-1.5 rounded-full bg-white/10 mt-2 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${explanations?.confidence_overall || 94}%` }}
                        className="h-full bg-gradient-to-r from-[--primary] to-[--secondary] rounded-full" transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>
                  {streak && <StreakDisplayFront currentStreak={streak.current_streak} longestStreak={streak.longest_streak} />}
                </motion.div>
                <motion.div variants={itemVariants}>
                  <LoyaltyCardFront tier={loyalty?.tier || user.tier || 'Gold'} totalPoints={loyalty?.total_points || user.loyalty_points || 2840} pointsToNextTier={loyalty?.points_to_next_tier || 2160} tierProgress={loyalty?.tier_progress || 0.56} />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <LiveActivityFeed />
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.section variants={itemVariants}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold font-space">Your Rewards</h2>
                <button onClick={() => setActiveTab('gamification')} className="text-xs text-[--secondary] hover:underline">View All</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <LoyaltyCard tier={loyalty?.tier || user.tier || 'Gold'} points={loyalty?.total_points || user.loyalty_points || 2840} nextTier="Platinum" pointsToNext={loyalty?.points_to_next_tier || 2160} />
                <div className="sm:col-span-2">
                  <BadgeDisplay badges={sampleBadges} />
                </div>
              </div>
            </motion.section>
          </motion.div>
        )}

        {activeTab === 'recommended' && (
          <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-space text-gradient-primary">Personalized For You</h2>
                <p className="text-xs text-[--muted] mt-1">Curated based on your interests and behavior</p>
              </div>
              <SmartSearch placeholder="Search recommendations..." className="w-full sm:w-64" />
            </motion.div>
            <motion.div variants={itemVariants}><SmartCouponBanner orderTotal={1070} /></motion.div>
            <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <motion.div variants={itemVariants} className="lg:col-span-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {displayProducts.map((product: Product, i: number) => (
                    <motion.div key={product.id || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                      <ProductCard key={product.id || i} product={product} onAddToCart={handleAddToCart} onWishlist={handleWishlist} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              <motion.div variants={containerVariants} className="space-y-3">
                <h3 className="text-xs font-semibold text-[--muted] uppercase tracking-wider">Why These?</h3>
                <div className="space-y-2">
                  {[
                    { reason: 'Recommended because you purchased Gaming Accessories', reasonType: 'purchase_history', confidence: 0.96 },
                    { reason: 'Recommended because you viewed Wireless Headphones', reasonType: 'browsing_history', confidence: 0.88 },
                    { reason: 'Users similar to you purchased this product', reasonType: 'similar_users', confidence: 0.91 },
                    { reason: 'Matches your preference for Electronics', reasonType: 'category_match', confidence: 0.85 },
                  ].map((exp, i) => (
                    <RecommendationExplanationCard key={i} {...exp} />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'deals' && (
          <motion.section initial="hidden" animate="visible" variants={containerVariants}>
            <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold font-space text-gradient-primary">Flash Deals</h2>
                <p className="text-xs text-[--muted] mt-1">Limited time offers — grab them before they're gone!</p>
              </div>
            </motion.div>
            <motion.div variants={containerVariants} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {flashDeals.map((deal, i) => (
                <motion.div key={deal.id} variants={itemVariants} whileHover={{ y: -6, scale: 1.02 }}
                  className="glass-card rounded-2xl overflow-hidden group hover:border-[--accent]/30 transition-all"
                >
                  <div className="relative aspect-[4/3] bg-[--surface]">
                    <img src={deal.image} alt={deal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-[--accent] text-black text-[10px] font-bold shadow-lg">-{deal.discount}%</div>
                    <div className="absolute bottom-2 left-2 glass-pill px-2 py-0.5 text-[10px] text-white flex items-center gap-1">
                      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {deal.endsIn}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium truncate">{deal.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-lg font-bold text-[--secondary]">₹{deal.price.toLocaleString('en-US')}</span>
                      <span className="text-xs text-[--muted] line-through">₹{deal.original_price.toLocaleString('en-US')}</span>
                    </div>
                    <SocialProofCounter purchases24h={28} currentViewers={12} stockCount={3} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>
        )}

        {activeTab === 'gamification' && (
          <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
            <motion.div variants={itemVariants}>
              <h2 className="text-xl font-bold font-space text-gradient-primary">Rewards & Achievements</h2>
              <p className="text-xs text-[--muted] mt-1">Your loyalty journey with CogniCart</p>
            </motion.div>
            <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
                <LoyaltyCardFront tier={loyalty?.tier || user.tier || 'Gold'} totalPoints={loyalty?.total_points || user.loyalty_points || 2840} pointsToNextTier={loyalty?.points_to_next_tier || 2160} tierProgress={loyalty?.tier_progress || 0.56} />
                <motion.div variants={itemVariants}><DailyRewardsGrid onClaim={() => {}} /></motion.div>
                <motion.div variants={itemVariants}><AchievementGrid badges={achievementSamples} /></motion.div>
              </motion.div>
              <motion.div variants={containerVariants} className="space-y-4">
                <motion.div variants={itemVariants}><StreakDisplayFront currentStreak={streak?.current_streak || 5} longestStreak={streak?.longest_streak || 12} /></motion.div>
                <motion.div variants={itemVariants}><ReferralCard /></motion.div>
                {xp && (
                  <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5 hover-glow-primary">
                    <div className="flex items-center gap-2 mb-3">
                      <TrophyIcon size={16} className="text-[--accent]" />
                      <h3 className="text-sm font-semibold">Level {xp.level} — {xp.level_title}</h3>
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-[--muted]">{xp.current_xp.toLocaleString('en-US')} XP</span>
                      <span className="text-[10px] text-[--muted]">{xp.xp_to_next_level.toLocaleString('en-US')} XP to next level</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (xp.current_xp / (xp.current_xp + xp.xp_to_next_level)) * 100)}%` }}
                        className="h-full bg-gradient-to-r from-[--accent] to-amber-400 rounded-full" transition={{ duration: 1.5 }} />
                    </div>
                    <p className="text-[10px] text-[--muted] mt-2">Total XP earned: {xp.total_xp_earned.toLocaleString('en-US')}</p>
                  </motion.div>
                )}
                <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5">
                  <h3 className="text-sm font-semibold mb-3">Quick Stats</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Orders to next level', current: 8, target: 10 },
                      { label: 'Reviews written', current: 3, target: 5 },
                      { label: 'Days active this month', current: 18, target: 30 },
                    ].map((stat, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-[--muted]">{stat.label}</span>
                          <span>{stat.current}/{stat.target}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${(stat.current / stat.target) * 100}%` }}
                            className="h-full bg-gradient-to-r from-[--primary] to-[--secondary] rounded-full" transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'community' && (
          <motion.div initial="hidden" animate="visible" variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={itemVariants}><CommunityDiscussions /></motion.div>
            <motion.div variants={containerVariants} className="space-y-4">
              <motion.div variants={itemVariants}><TrendingReviews /></motion.div>
              <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5">
                <h3 className="text-sm font-semibold mb-3">Share Your Wishlist</h3>
                <p className="text-xs text-[--muted] mb-3">Share your curated wishlist with friends</p>
                <div className="flex gap-2">
                  {[
                    <svg key="msg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
                    <svg key="fb" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
                    <svg key="tw" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>,
                    <svg key="mail" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
                  ].map((icon, i) => (
                    <button key={i} className="w-9 h-9 rounded-lg glass hover:bg-white/10 flex items-center justify-center text-sm text-[--muted] hover:text-white transition-all">{icon}</button>
                  ))}
                </div>
              </motion.div>
              <motion.div variants={itemVariants}><NPSSurvey /></motion.div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'insights' && (
          <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
            <motion.div variants={itemVariants}>
              <h2 className="text-xl font-bold font-space text-gradient-primary">AI Shopping Insights</h2>
              <p className="text-xs text-[--muted] mt-1">Your personalized shopping analytics</p>
            </motion.div>
            <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
                <SpendingOverview
                  monthlySpending={spending?.monthly_spending}
                  averageOrderValue={spending?.average_order_value}
                  totalSavings={spending?.total_savings}
                  spendingTrend={spending?.spending_trend}
                />
                <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5">
                  <h3 className="text-sm font-semibold mb-3 font-space text-gradient-primary">Trending Products</h3>
                  <div className="space-y-2">
                    {(trends?.trending_products || []).slice(0, 5).map((t: ProductTrend, i: number) => (
                      <TrendCard key={i} productName={t.product_name} trendScore={t.trend_score} trendDirection={t.trend_direction} />
                    ))}
                    {(!trends?.trending_products || trends.trending_products.length === 0) && (
                      <div className="text-xs text-[--muted] text-center p-4">Trend data coming soon</div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
              <motion.div variants={containerVariants} className="space-y-4">
                {clv && <motion.div variants={itemVariants}><CLVCard {...clv} /></motion.div>}
                <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5">
                  <h3 className="text-sm font-semibold mb-3">Categories</h3>
                  <div className="space-y-2">
                    {(trends?.trending_categories || [{ category_id: 'c1', product_count: 42 }]).map((cat: { category_id: string; product_count: number }, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(10, cat.product_count / 50 * 100)}%` }}
                            className="h-full rounded-full bg-gradient-to-r from-[--secondary] to-[--accent]" transition={{ duration: 0.8, delay: i * 0.1 }}
                          />
                        </div>
                        <span className="text-[10px] text-[--muted]">{cat.product_count}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
                <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 text-center">
                  <div className="w-12 h-12 rounded-xl glass flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-[--secondary]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                  </div>
                  <p className="text-sm font-semibold">Recommendation Accuracy</p>
                  <p className="text-2xl font-bold text-[--secondary] mt-1 font-space">{explanations?.confidence_overall || 94}%</p>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'xai' && (
          <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
            <motion.div variants={itemVariants}>
              <h2 className="text-xl font-bold font-space text-gradient-primary">Explainable AI Dashboard</h2>
              <p className="text-xs text-[--muted] mt-1">Understand why products are recommended to you</p>
            </motion.div>
            <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div variants={itemVariants} className="lg:col-span-2">
                <XAIDashboardPanel
                  totalExplanations={explanations?.total_explanations || 24}
                  averageConfidence={explanations?.confidence_overall || 94}
                  reasonTypeDistribution={explanations?.reason_type_distribution || { purchase_history: 12, browsing_history: 8, similar_users: 4 }}
                  engineContribution={explanations?.engine_breakdown || { svd: 40, deep_learning: 40, content_based: 20 }}
                  featureImportance={explanations?.feature_importance || { price: 0.3, category: 0.25, brand: 0.2, rating: 0.15, tags: 0.1 }}
                  recentExplanations={explanations?.recent_explanations || []}
                />
              </motion.div>
              <motion.div variants={containerVariants} className="space-y-4">
                <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5">
                  <h3 className="text-sm font-semibold mb-3 font-space text-gradient-primary">Hybrid Engine Weights</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'SVD', weight: '40%', color: 'from-[--primary] to-[--secondary]' },
                      { name: 'Deep Learning', weight: '40%', color: 'from-[--secondary] to-[--accent]' },
                      { name: 'Content-Based', weight: '20%', color: 'from-[--accent] to-amber-500' },
                    ].map((eng, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span>{eng.name}</span><span className="text-[--secondary]">{eng.weight}</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: eng.weight }} transition={{ duration: 1, delay: i * 0.2 }}
                            className={`h-full rounded-full bg-gradient-to-r ${eng.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
                <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5">
                  <h3 className="text-sm font-semibold mb-3">User Interest Analysis</h3>
                  <div className="space-y-2">
                    {[
                      { label: 'Gaming', score: 0.95 },
                      { label: 'Wearables', score: 0.82 },
                      { label: 'Audio', score: 0.71 },
                      { label: 'Accessories', score: 0.55 },
                    ].map((intr, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-[10px] text-[--muted] w-20">{intr.label}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${intr.score * 100}%` }}
                            className="h-full rounded-full bg-gradient-to-r from-[--primary] to-[--secondary]" transition={{ duration: 0.8, delay: i * 0.1 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <PersonaBadge personaLabel={persona?.persona_label || 'Tech Enthusiast'} confidence={persona?.confidence || 0.85} />
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div initial="hidden" animate="visible" variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={containerVariants} className="space-y-6">
              <motion.div variants={itemVariants}><ThemeCustomizer /></motion.div>
              <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5">
                <h3 className="text-sm font-semibold mb-3">Support</h3>
                <SupportTicketForm />
              </motion.div>
              <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5">
                <h3 className="text-sm font-semibold mb-3">Returns</h3>
                <ReturnForm />
              </motion.div>
            </motion.div>
            <motion.div variants={containerVariants} className="space-y-6">
              <motion.div variants={itemVariants}><NPSSurvey /></motion.div>
              <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5">
                <h3 className="text-sm font-semibold mb-3">Notification Preferences</h3>
                <div className="space-y-2">
                  {[
                    { type: 'Price Drops', icon: <svg key="pd" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, enabled: true },
                    { type: 'Back in Stock', icon: <svg key="bs" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>, enabled: true },
                    { type: 'Recommendations', icon: <svg key="rc" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>, enabled: true },
                    { type: 'Flash Sales', icon: <svg key="fs" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10"/></svg>, enabled: false },
                  ].map((pref, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                      <div className="flex items-center gap-2">
                        <span className="text-[--muted]">{pref.icon}</span>
                        <span className="text-xs">{pref.type}</span>
                      </div>
                      <div className={`w-8 h-4 rounded-full transition-colors ${pref.enabled ? 'bg-[--primary]' : 'bg-white/20'} relative cursor-pointer`}>
                        <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all ${pref.enabled ? 'left-4' : 'left-0.5'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
              <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5 text-center">
                <ShareButtons productId="sample" />
                <p className="text-xs text-[--muted] mt-3">Share CogniCart with friends</p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
