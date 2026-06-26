import React from 'react'
import { motion } from 'framer-motion'
import { Clock, Zap } from 'lucide-react'
import { categories, products, flashSales, brands, testimonials, blogPosts } from '../data/mock'
import { formatPrice, cn } from '../lib/utils'
import { useCartStore, useWishlistStore } from '../stores/cartStore'

function ProductCard({ product, index = 0 }) {
const addItem = useCartStore((s) => s.addItem)
const toggleWishlist = useWishlistStore((s) => s.toggle)
const isWishlisted = useWishlistStore((s) => s.items.some(i => i.id === product.id))

return (
<motion.div
initial={{ opacity: 0, y: 20 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}
transition={{ duration: 0.4, delay: index * 0.05 }}
whileHover={{ y: -6 }}
className="glass-card rounded-xl overflow-hidden group flex-shrink-0 w-[280px]"
>
<div className="relative h-44 overflow-hidden">
<img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
{product.isNew && <span className="absolute top-2 left-2 px-2 py-1 rounded text-[10px] font-bold bg-[--secondary] text-black">NEW</span>}
{product.isLimited && <span className="absolute top-2 right-2 px-2 py-1 rounded text-[10px] font-bold bg-[--primary] text-black">LIMITED</span>}
{product.discount > 0 && <span className="absolute bottom-2 left-2 px-2 py-1 rounded text-[10px] font-bold bg-[--danger] text-white">-{product.discount}%</span>}
<button
onClick={() => toggleWishlist(product)}
className="absolute top-2 right-2 w-8 h-8 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
>
<span className={cn('text-sm', isWishlisted && 'text-[--danger]')}>♡</span>
</button>
</div>
<div className="p-4 space-y-2">
<div className="flex items-center justify-between">
<h4 className="font-display text-base font-semibold truncate">{product.name}</h4>
<span className="text-xs text-[--secondary] font-medium">{product.match}% match</span>
</div>
<div className="flex items-center gap-2 text-xs text-[--muted]">
<span>{product.brand}</span>
<span>•</span>
<span>★ {product.rating}</span>
</div>
<div className="flex items-center gap-2">
<span className="font-bold text-lg text-[--primary]">{formatPrice(product.price)}</span>
{product.originalPrice && <span className="text-sm text-[--muted] line-through">{formatPrice(product.originalPrice)}</span>}
</div>
<button onClick={() => addItem(product)} className="btn-gear w-full py-2 rounded-lg text-sm font-semibold">
Add to Cart
</button>
</div>
</motion.div>
)
}

function SectionHeader({ title, subtitle, link }) {
return (
<div className="flex items-end justify-between mb-8">
<div>
<h2 className="section-heading text-4xl md:text-5xl">{title}</h2>
{subtitle && <p className="text-[--muted] mt-2">{subtitle}</p>}
</div>
{link && <a href={link} className="text-sm text-[--primary] hover:text-[--secondary] transition-colors font-medium hidden sm:block">View All →</a>}
</div>
)
}

function CategoriesShowcase() {
return (
<section className="py-16">
<div className="max-w-7xl mx-auto px-6">
<SectionHeader title="Shop by Category" subtitle="Find exactly what your ride needs" link="/categories" />
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
{categories.slice(0, 8).map((cat, i) => (
<motion.a
key={cat.id}
href={`/category/${cat.slug}`}
initial={{ opacity: 0, y: 20 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}
transition={{ duration: 0.4, delay: i * 0.05 }}
whileHover={{ y: -4 }}
className="group relative h-48 rounded-xl overflow-hidden"
>
<img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
<div className="absolute bottom-0 left-0 right-0 p-4">
<h3 className="font-display text-xl font-semibold">{cat.name}</h3>
<p className="text-sm text-[--muted]">{cat.count} products</p>
</div>
</motion.a>
))}
</div>
</div>
</section>
)
}

function TrendingProducts() {
const trending = products.filter(p => p.isTrending)
return (
<section className="py-16">
<div className="max-w-7xl mx-auto px-6">
<SectionHeader title="Trending Now" subtitle="What the GearSkin community loves right now" link="/shop?sort=trending" />
<div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6">
{trending.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
</div>
</div>
</section>
)
}

function NewArrivals() {
const newItems = products.filter(p => p.isNew)
return (
<section className="py-16">
<div className="max-w-7xl mx-auto px-6">
<SectionHeader title="New Arrivals" subtitle="Fresh drops in the garage" link="/shop?sort=new" />
<div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6">
{newItems.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
</div>
</div>
</section>
)
}

function BestSellers() {
const best = products.filter(p => p.isBestSeller)
return (
<section className="py-16">
<div className="max-w-7xl mx-auto px-6">
<SectionHeader title="Best Sellers" subtitle="Top-rated gear chosen by riders like you" link="/shop?sort=bestseller" />
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
{best.slice(0, 4).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
</div>
</div>
</section>
)
}

function FlashSalesBanner() {
return (
<section className="py-16">
<div className="max-w-7xl mx-auto px-6">
<div className="glass-card rounded-2xl p-8 neon-glow relative overflow-hidden">
<div className="absolute inset-0 bg-gradient-to-r from-[--primary]/10 via-transparent to-[--secondary]/10" />
<div className="relative z-10">
<SectionHeader title="⚡ Flash Sale" subtitle="Limited time deals — grab them before they're gone" />
<div className="flex gap-4 overflow-x-auto pb-2">
{flashSales.map((p, i) => (
<motion.div
key={p.id}
initial={{ opacity: 0, x: 20 }}
whileInView={{ opacity: 1, x: 0 }}
viewport={{ once: true }}
transition={{ delay: i * 0.1 }}
className="glass-card rounded-xl p-4 min-w-[220px] flex-shrink-0"
>
<div className="flex items-center gap-2 text-xs text-[--danger] mb-2">
<Clock className="w-3 h-3" />
<span>Ends in {p.endsIn}</span>
</div>
<img src={p.image} alt={p.name} className="w-full h-28 object-cover rounded-lg mb-3" />
<h4 className="font-display text-sm font-semibold truncate">{p.name}</h4>
<div className="flex items-center gap-2 mt-1">
<span className="text-[--primary] font-bold">{formatPrice(p.price)}</span>
<span className="text-xs text-[--muted] line-through">{formatPrice(p.originalPrice)}</span>
<span className="text-xs text-[--danger] font-bold">-{p.discount}%</span>
</div>
</motion.div>
))}
</div>
</div>
</div>
</div>
</section>
)
}

function BrandsShowcase() {
return (
<section className="py-16">
<div className="max-w-7xl mx-auto px-6">
<SectionHeader title="Top Brands" subtitle="Premium automotive brands you trust" />
<div className="grid grid-cols-4 md:grid-cols-8 gap-4">
{brands.map((brand, i) => (
<motion.div
key={brand.id}
initial={{ opacity: 0, scale: 0.8 }}
whileInView={{ opacity: 1, scale: 1 }}
viewport={{ once: true }}
transition={{ delay: i * 0.05 }}
whileHover={{ scale: 1.05, y: -2 }}
className="glass-card rounded-xl h-24 flex items-center justify-center cursor-pointer"
>
<span className="font-display text-3xl text-[--muted] hover:text-white transition-colors">{brand.logo}</span>
</motion.div>
))}
</div>
</div>
</section>
)
}

function TestimonialsSection() {
return (
<section className="py-16">
<div className="max-w-7xl mx-auto px-6">
<SectionHeader title="Rider Approved" subtitle="What our community says" />
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
{testimonials.map((t, i) => (
<motion.div
key={t.id}
initial={{ opacity: 0, y: 20 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}
transition={{ delay: i * 0.1 }}
className="glass-card rounded-xl p-6"
>
<div className="flex gap-1 mb-3">
{[...Array(t.rating)].map((_, j) => <span key={j} className="text-[--primary] text-sm">★</span>)}
</div>
<p className="text-sm text-[--muted] leading-relaxed mb-4">"{t.text}"</p>
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black font-bold text-sm">{t.name[0]}</div>
<div>
<p className="text-sm font-medium">{t.name}</p>
<p className="text-xs text-[--muted]">{t.vehicle}</p>
</div>
</div>
</motion.div>
))}
</div>
</div>
</section>
)
}

function BlogSection() {
return (
<section className="py-16">
<div className="max-w-7xl mx-auto px-6">
<SectionHeader title="GearSkin Blog" subtitle="Tips, guides, and stories from the road" link="/blog" />
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
{blogPosts.map((post, i) => (
<motion.a
key={post.id}
href={`/blog/${post.id}`}
initial={{ opacity: 0, y: 20 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}
transition={{ delay: i * 0.1 }}
whileHover={{ y: -4 }}
className="group"
>
<div className="h-48 rounded-xl overflow-hidden mb-4">
<img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
</div>
<div className="flex items-center gap-2 text-xs text-[--muted] mb-2">
<span>{post.date}</span>
<span>•</span>
<span>{post.readTime} read</span>
</div>
<h3 className="font-display text-lg font-semibold mb-2 group-hover:text-[--primary] transition-colors">{post.title}</h3>
<p className="text-sm text-[--muted]">{post.excerpt}</p>
</motion.a>
))}
</div>
</div>
</section>
)
}

function NewsletterSection() {
return (
<section className="py-20">
<div className="max-w-7xl mx-auto px-6">
<div className="glass-card rounded-2xl p-12 text-center neon-glow-blue relative overflow-hidden">
<div className="absolute inset-0 bg-gradient-to-r from-[--secondary]/5 via-transparent to-[--primary]/5" />
<div className="relative z-10 max-w-xl mx-auto">
<h2 className="section-heading text-5xl mb-4">Stay in the Fast Lane</h2>
<p className="text-[--muted] mb-8">Get exclusive deals, new drops, and gear guides straight to your inbox.</p>
<form onSubmit={e => e.preventDefault()} className="flex gap-3 max-w-md mx-auto">
<input
type="email"
placeholder="Enter your email"
className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm outline-none focus:border-[--primary] transition-colors"
/>
<button type="submit" className="btn-gear px-6 py-3 rounded-xl font-semibold">Subscribe</button>
</form>
</div>
</div>
</div>
</section>
)
}

export default function HomeSections() {
return (
<>
<CategoriesShowcase />
<TrendingProducts />
<NewArrivals />
<BestSellers />
<FlashSalesBanner />
<BrandsShowcase />
<TestimonialsSection />
<BlogSection />
<NewsletterSection />
</>
)
}
