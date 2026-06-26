import React, { useState } from 'react'
import Navbar from './components/Navbar'
import LeftSidebar from './components/LeftSidebar'
import Hero from './components/Hero'
import StatsGrid from './components/StatsGrid'
import Recommendations from './components/Recommendations'
import TrendingProducts from './components/TrendingProducts'
import ContinueShopping from './components/ContinueShopping'
import TopCategories from './components/TopCategories'
import FrequentlyBought from './components/FrequentlyBought'
import FlashDeals from './components/FlashDeals'
import ActivityTimeline from './components/ActivityTimeline'
import NotificationCenter from './components/NotificationCenter'
import WishlistPreview from './components/WishlistPreview'
import OrderSummary from './components/OrderSummary'
import RecommendationAnalytics from './components/RecommendationAnalytics'
import CommunityHighlights from './components/CommunityHighlights'
import AIInsightsPanel from './components/AIInsightsPanel'
import AIAssistantWidget from './components/AIAssistantWidget'
import ParticleBackground from './components/ParticleBackground'
import Footer from './components/Footer'

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeSection, setActiveSection] = useState('dashboard')

  return (
    <div className="min-h-screen bg-[--bg] text-white">
      <ParticleBackground />
      <Navbar />
      <LeftSidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <main className={`pt-16 pb-12 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-56'}`}>
        <Hero />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
          <div className="lg:col-span-8 space-y-6">
            <StatsGrid />
            <Recommendations />
            <TrendingProducts />
            <ContinueShopping />
            <TopCategories />
            <FrequentlyBought />
            <FlashDeals />
            <ActivityTimeline />
            <NotificationCenter />
            <WishlistPreview />
            <OrderSummary />
            <RecommendationAnalytics />
            <CommunityHighlights />
          </div>

          <div className="lg:col-span-4 space-y-6">
            <AIInsightsPanel />
          </div>
        </div>

        <Footer />
      </main>

      <AIAssistantWidget />
    </div>
  )
}
