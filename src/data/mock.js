export const user = {
  name: 'Alex',
  avatar: 'A',
  level: 'Pro Shopper',
  levelProgress: 78,
  loyaltyPoints: 2840,
  tier: 'Gold',
  joinDate: 'March 2024',
  email: 'alex@cognicart.ai',
  preferences: ['Gaming Products', 'Wearables', 'Smart Devices', 'Electronics'],
  recentSearches: ['wireless earbuds', 'mechanical keyboard', 'smartwatch', 'gaming mouse'],
  predictedNextPurchase: 'Wireless Earbuds Pro',
  predictedConfidence: 87
}

export const stats = [
  { id: 1, label: 'Total Orders', value: 42, prefix: '', suffix: '', icon: '📦', trend: '+12%', color: '#6C63FF' },
  { id: 2, label: 'Wishlist Items', value: 128, prefix: '', suffix: '', icon: '❤️', trend: '+8%', color: '#FF6B35' },
  { id: 3, label: 'Products Viewed', value: 1540, prefix: '', suffix: '', icon: '👁', trend: '+24%', color: '#00E5FF' },
  { id: 4, label: 'AI Accuracy', value: 98.4, prefix: '', suffix: '%', icon: '🤖', trend: '+2.1%', color: '#6C63FF' },
  { id: 5, label: 'Saved Amount', value: 384, prefix: '$', suffix: '', icon: '💰', trend: '+$42', color: '#00E587' },
  { id: 6, label: 'Loyalty Points', value: 2840, prefix: '', suffix: '', icon: '⭐', trend: '+450', color: '#FFD700' }
]

export const recommendations = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  name: i === 0 ? 'Wireless Earbuds Pro' :
    i === 1 ? 'Mechanical Keyboard' :
    i === 2 ? 'Smart Watch Ultra' :
    i === 3 ? 'Gaming Mouse X' :
    i === 4 ? 'Noise Cancelling Headphones' :
    i === 5 ? 'USB-C Hub 7-in-1' :
    i === 6 ? 'Portable SSD 1TB' :
    i === 7 ? 'Smart Home Hub' :
    i === 8 ? 'Ergonomic Chair Pro' :
    i === 9 ? '4K Webcam Stream' :
    i === 10 ? 'Wireless Charger Pad' :
    i === 11 ? 'Mechanical Keycaps Set' : `Product ${i + 1}`,
  price: (29 + i * 15).toFixed(2),
  originalPrice: (49 + i * 18).toFixed(2),
  rating: (4 + (i % 5) * 0.15).toFixed(1),
  reviews: Math.floor(Math.random() * 500) + 50,
  match: 90 - i * 2,
  image: `https://picsum.photos/seed/prod${i + 1}/400/300`,
  category: ['Electronics', 'Gaming', 'Wearables', 'Gaming', 'Audio', 'Accessories', 'Storage', 'Smart Home', 'Furniture', 'Streaming', 'Accessories', 'Gaming'][i],
  inStock: i !== 7,
  badge: i === 0 ? 'Best Seller' : i === 3 ? 'Trending' : i === 11 ? 'New' : null
}))

export const trendingProducts = Array.from({ length: 8 }).map((_, i) => ({
  id: i + 100,
  name: ['Sony WH-1000XM5', 'Apple MacBook Air M3', 'Samsung Galaxy Watch 6', 'Logitech MX Master 3S', 'iPad Air M2', 'DJI Mini 4 Pro', 'Kindle Scribe', 'AirPods Pro 2'][i],
  price: (199 + i * 80).toFixed(2),
  rating: (4.3 + i * 0.05).toFixed(1),
  popularityScore: Math.floor(Math.random() * 100) + 80,
  likes: Math.floor(Math.random() * 15000) + 5000,
  image: `https://picsum.photos/seed/trend${i + 1}/400/300`,
  badge: '🔥 Trending'
}))

export const recentlyViewed = Array.from({ length: 4 }).map((_, i) => ({
  id: i + 200,
  name: ['Dell UltraSharp 27" 4K', 'Razer DeathAdder V3', 'JBL Flip 6', 'Anker Power Bank'][i],
  price: (349 - i * 70).toFixed(2),
  rating: (4.5 - i * 0.1).toFixed(1),
  image: `https://picsum.photos/seed/recent${i + 1}/400/300`,
  lastViewed: ['2 min ago', '15 min ago', '1 hour ago', '3 hours ago'][i]
}))

export const categories = [
  { id: 1, name: 'Electronics', icon: '💻', color: '#6C63FF', count: 284, gradient: 'from-[#6C63FF] to-[#00E5FF]' },
  { id: 2, name: 'Fashion', icon: '👕', color: '#FF6B35', count: 192, gradient: 'from-[#FF6B35] to-[#FF8A58]' },
  { id: 3, name: 'Gaming', icon: '🎮', color: '#00E5FF', count: 156, gradient: 'from-[#00E5FF] to-[#6C63FF]' },
  { id: 4, name: 'Smart Devices', icon: '📱', color: '#00E587', count: 138, gradient: 'from-[#00E587] to-[#00E5FF]' },
  { id: 5, name: 'Accessories', icon: '⌚', color: '#FFD700', count: 224, gradient: 'from-[#FFD700] to-[#FF6B35]' },
  { id: 6, name: 'Home Appliances', icon: '🏠', color: '#FF6B9D', count: 97, gradient: 'from-[#FF6B9D] to-[#6C63FF]' }
]

export const bundles = [
  { id: 1, products: ['Gaming Mouse', 'Mechanical Keyboard', 'Mouse Pad'], originalPrice: 189.97, bundlePrice: 149.99, discount: 21, image: 'https://picsum.photos/seed/bundle1/400/300' },
  { id: 2, products: ['Wireless Earbuds', 'Charging Case', 'Silicone Cover'], originalPrice: 79.97, bundlePrice: 64.99, discount: 19, image: 'https://picsum.photos/seed/bundle2/400/300' },
  { id: 3, products: ['USB-C Hub', 'Portable SSD', 'Laptop Stand'], originalPrice: 149.97, bundlePrice: 119.99, discount: 20, image: 'https://picsum.photos/seed/bundle3/400/300' }
]

export const flashDeals = [
  { id: 1, name: 'Sony WH-1000XM5', price: 249.99, originalPrice: 399.99, discount: 37, stock: 23, totalStock: 100, endsIn: 14200, image: 'https://picsum.photos/seed/flash1/400/300' },
  { id: 2, name: 'Samsung Galaxy Watch 6', price: 199.99, originalPrice: 329.99, discount: 39, stock: 15, totalStock: 80, endsIn: 14200, image: 'https://picsum.photos/seed/flash2/400/300' },
  { id: 3, name: 'AirPods Pro 2', price: 179.99, originalPrice: 249.99, discount: 28, stock: 42, totalStock: 150, endsIn: 14200, image: 'https://picsum.photos/seed/flash3/400/300' }
]

export const activityTimeline = [
  { id: 1, action: 'Viewed', item: 'MacBook Pro M3 Pro', icon: '👁', time: '2 min ago', type: 'view' },
  { id: 2, action: 'Added to Wishlist', item: 'Sony WH-1000XM5', icon: '❤️', time: '15 min ago', type: 'wishlist' },
  { id: 3, action: 'Purchased', item: 'Apple Watch Series 9', icon: '🛒', time: '2 hours ago', type: 'purchase' },
  { id: 4, action: 'Rated', item: 'Logitech G Pro X', icon: '⭐', time: '5 hours ago', type: 'rating' },
  { id: 5, action: 'Reviewed', item: 'AirPods Pro 2', icon: '💬', time: 'Yesterday', type: 'review' },
  { id: 6, action: 'Compared', item: 'iPad Pro vs Galaxy Tab S9', icon: '⚖️', time: 'Yesterday', type: 'compare' }
]

export const notifications = [
  { id: 1, title: 'Flash Sale Alert', message: 'Sony WH-1000XM5 is 37% off — only 23 left!', icon: '🔥', time: '5 min ago', type: 'sale', read: false },
  { id: 2, title: 'Price Drop', message: 'Mechanical Keyboard dropped from $89 to $59', icon: '💰', time: '1 hour ago', type: 'price', read: false },
  { id: 3, title: 'New Recommendations', message: '12 new items match your preferences', icon: '🤖', time: '3 hours ago', type: 'recommendation', read: false },
  { id: 4, title: 'Order Shipped', message: 'Your Smart Watch Ultra is on the way!', icon: '📦', time: '5 hours ago', type: 'order', read: true },
  { id: 5, title: 'Wishlist Price Drop', message: 'Gaming Mouse X is now 25% off', icon: '🏷️', time: '1 day ago', type: 'price', read: true }
]

export const orderSummary = {
  active: 2,
  delivered: 38,
  pending: 1,
  cancelled: 3,
  total: 44
}

export const recommendationAnalytics = {
  accuracy: 98.4,
  precisionAtK: 0.87,
  recallAtK: 0.82,
  userSatisfaction: 94.6,
  history: Array.from({ length: 12 }).map((_, i) => ({ month: `Month ${i + 1}`, accuracy: 85 + Math.random() * 15 }))
}

export const communityHighlights = [
  { id: 1, user: 'TechGuru', avatar: 'T', product: 'Sony WH-1000XM5', review: 'Best noise cancellation I\'ve ever experienced! The battery life is incredible.', rating: 5, likes: 342 },
  { id: 2, user: 'GamerPro', avatar: 'G', product: 'Razer DeathAdder V3', review: 'Lightest mouse I\'ve used. The ergonomics are perfect for FPS games.', rating: 5, likes: 289 },
  { id: 3, user: 'AudioPhile', avatar: 'A', product: 'AirPods Pro 2', review: 'Spatial audio is a game changer. Seamless integration with Apple ecosystem.', rating: 4, likes: 256 }
]

export const wishlistItems = Array.from({ length: 6 }).map((_, i) => ({
  id: i + 300,
  name: ['Bose QuietComfort Earbuds', 'iPad Mini 7', 'Kindle Paperwhite', 'Samsung Galaxy Tab S9', 'Herman Miller Chair', 'Mac Studio'][i],
  price: [279, 499, 139, 799, 1495, 1999][i],
  originalPrice: [329, 599, 169, 999, 1795, 2499][i],
  image: `https://picsum.photos/seed/wish${i + 1}/400/300`,
  priceDrop: i % 2 === 0
}))

export const messages = [
  { id: 1, user: 'AI Assistant', avatar: '🤖', message: 'I found 12 new recommendations for you!', time: '2 min ago', unread: true },
  { id: 2, user: 'CogniCart Support', avatar: '🛡️', message: 'Your order #COG-2841 has been shipped.', time: '1 hour ago', unread: false },
  { id: 3, user: 'Price Alert Bot', avatar: '💰', message: '3 items in your wishlist have price drops!', time: '3 hours ago', unread: true }
]
