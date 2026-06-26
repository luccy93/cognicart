'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Grid3X3, List, Edit3, Trash2, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminApi, productsApi } from '@/lib/api';
import toast from 'react-hot-toast';

const fallbackProducts = [
  { id: 1, name: 'Wireless Headphones Pro', sku: 'WH-1000XM5', category: 'Audio', price: 349.99, stock: 45, status: true, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop' },
  { id: 2, name: 'Smart Watch Ultra', sku: 'SW-U2', category: 'Wearables', price: 599.99, stock: 28, status: true, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop' },
  { id: 3, name: 'Bluetooth Speaker X', sku: 'BS-X1', category: 'Audio', price: 129.99, stock: 0, status: false, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=80&h=80&fit=crop' },
  { id: 4, name: 'Laptop Stand Adjustable', sku: 'LS-2024', category: 'Accessories', price: 79.99, stock: 120, status: true, image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=80&h=80&fit=crop' },
  { id: 5, name: 'Mechanical Keyboard RGB', sku: 'MK-RGB87', category: 'Accessories', price: 149.99, stock: 63, status: true, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=80&h=80&fit=crop' },
  { id: 6, name: 'USB-C Hub 7-in-1', sku: 'UC-7IN1', category: 'Accessories', price: 49.99, stock: 200, status: true, image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=80&h=80&fit=crop' },
  { id: 7, name: 'Gaming Mouse Pro', sku: 'GM-PRO', category: 'Gaming', price: 89.99, stock: 0, status: false, image: 'https://images.unsplash.com/photo-1527864550417-2fd06e9c5f5f?w=80&h=80&fit=crop' },
  { id: 8, name: '4K Webcam Stream', sku: 'WC-4K', category: 'Electronics', price: 199.99, stock: 34, status: true, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=80&h=80&fit=crop' },
  { id: 9, name: 'Wireless Charger Pad', sku: 'WC-PAD', category: 'Accessories', price: 39.99, stock: 0, status: false, image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=80&h=80&fit=crop' },
  { id: 10, name: 'Noise Canceling Earbuds', sku: 'NC-EBUDS', category: 'Audio', price: 199.99, stock: 87, status: true, image: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=80&h=80&fit=crop' },
];

const categories = ['All', 'Audio', 'Wearables', 'Accessories', 'Gaming', 'Electronics'];

function mapProduct(item: any) {
  return {
    id: item.id,
    name: item.name || item.product_name || item.title || 'Unknown',
    sku: item.sku || item.sku_code || `SKU-${item.id}`,
    category: item.category || item.category_name || 'General',
    price: Number(item.price) || 0,
    stock: item.stock ?? item.stock_quantity ?? item.inventory_count ?? 0,
    status: item.status ?? item.is_active ?? true,
    image: item.image || item.image_url || item.thumbnail || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop',
  };
}

export default function AdminProducts() {
  const [products, setProducts] = useState(fallbackProducts);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [page, setPage] = useState(1);
  const perPage = 5;

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const { data } = await adminApi.listProducts();
        const items = Array.isArray(data) ? data : data?.products || data?.items || [];
        setProducts(items.length > 0 ? items.map(mapProduct) : fallbackProducts);
      } catch {
        toast.error('Failed to load products, showing sample data');
        setProducts(fallbackProducts);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  async function toggleStatus(productId: number, currentStatus: boolean) {
    try {
      await productsApi.update(String(productId), { is_active: !currentStatus });
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, status: !currentStatus } : p));
      toast.success('Product status updated');
    } catch {
      toast.error('Failed to update product status');
    }
  }

  const filtered = products.filter((p) => {
    if (category !== 'All' && p.category !== category) return false;
    if (statusFilter === 'Active' && !p.status) return false;
    if (statusFilter === 'Inactive' && p.status) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <span className="text-xs text-[--secondary] font-medium">Admin Panel</span>
        <h1 className="text-3xl font-extrabold mt-1 text-gradient">Products</h1>
        <p className="text-sm text-[--muted] mt-1">Manage your product catalog.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-3 flex-wrap items-center">
          <div className="relative flex-1 min-w-[240px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[--muted]" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search products..." className="input-glass pl-9 text-xs" />
          </div>
          <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-[--muted] outline-none focus:border-[--primary]/50">
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-[--muted] outline-none focus:border-[--primary]/50">
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex glass rounded-lg overflow-hidden">
            <button onClick={() => setView('list')} className={`p-2 ${view === 'list' ? 'bg-[--primary]/20 text-white' : 'text-[--muted] hover:text-white'}`}>
              <List size={15} />
            </button>
            <button onClick={() => setView('grid')} className={`p-2 ${view === 'grid' ? 'bg-[--primary]/20 text-white' : 'text-[--muted] hover:text-white'}`}>
              <Grid3X3 size={15} />
            </button>
          </div>
          <button className="btn-primary flex items-center gap-1.5 text-xs">
            <Plus size={14} /> Add Product
          </button>
        </div>
      </motion.div>

      {isLoading ? (
        view === 'list' ? (
          <div className="glass rounded-xl overflow-hidden card-3d">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-[--muted]">
                    <th className="text-left py-3 px-4 font-medium">Product</th>
                    <th className="text-left py-3 px-4 font-medium">SKU</th>
                    <th className="text-left py-3 px-4 font-medium">Category</th>
                    <th className="text-right py-3 px-4 font-medium">Price</th>
                    <th className="text-right py-3 px-4 font-medium">Stock</th>
                    <th className="text-center py-3 px-4 font-medium">Status</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-3 px-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-white/5 animate-pulse" /><div className="h-4 w-36 bg-white/5 rounded animate-pulse" /></div></td>
                      <td className="py-3 px-4"><div className="h-4 w-20 bg-white/5 rounded animate-pulse" /></td>
                      <td className="py-3 px-4"><div className="h-4 w-16 bg-white/5 rounded animate-pulse" /></td>
                      <td className="py-3 px-4 text-right"><div className="h-4 w-14 bg-white/5 rounded animate-pulse ml-auto" /></td>
                      <td className="py-3 px-4 text-right"><div className="h-4 w-10 bg-white/5 rounded animate-pulse ml-auto" /></td>
                      <td className="py-3 px-4 text-center"><div className="h-4 w-8 bg-white/5 rounded-full animate-pulse mx-auto" /></td>
                      <td className="py-3 px-4 text-right"><div className="h-4 w-16 bg-white/5 rounded animate-pulse ml-auto" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="glass rounded-xl p-3 card-3d">
                <div className="h-28 rounded-lg bg-white/5 animate-pulse mb-2" />
                <div className="h-3 bg-white/5 rounded animate-pulse w-3/4 mb-1" />
                <div className="h-3 bg-white/5 rounded animate-pulse w-1/2 mb-2" />
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-white/5 rounded animate-pulse w-16" />
                  <div className="h-3 bg-white/5 rounded animate-pulse w-12" />
                </div>
              </div>
            ))}
          </div>
        )
      ) : view === 'list' ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl overflow-hidden card-3d">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5 text-[--muted]">
                  <th className="text-left py-3 px-4 font-medium">Product</th>
                  <th className="text-left py-3 px-4 font-medium">SKU</th>
                  <th className="text-left py-3 px-4 font-medium">Category</th>
                  <th className="text-right py-3 px-4 font-medium">Price</th>
                  <th className="text-right py-3 px-4 font-medium">Stock</th>
                  <th className="text-center py-3 px-4 font-medium">Status</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((p, i) => (
                  <motion.tr key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[--muted]">{p.sku}</td>
                    <td className="py-3 px-4"><span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[--muted]">{p.category}</span></td>
                    <td className="py-3 px-4 text-right font-medium">${p.price.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right"><span className={p.stock === 0 ? 'text-red-400' : ''}>{p.stock}</span></td>
                    <td className="py-3 px-4 text-center">
                      <button type="button" onClick={() => toggleStatus(p.id, p.status)} className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${p.status ? 'bg-[#00E676]' : 'bg-white/10'}`}>
                        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${p.status ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-white/10 text-[--muted] hover:text-[--secondary]"><Edit3 size={14} /></button>
                        <button className="p-1.5 rounded-lg hover:bg-white/10 text-[--muted] hover:text-red-400"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {paginated.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} whileHover={{ y: -4 }} className="glass rounded-xl p-3 card-3d">
              <div className="h-28 rounded-lg overflow-hidden bg-gray-800 mb-2">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div className="font-medium text-xs truncate">{p.name}</div>
              <div className="text-[10px] text-[--muted]">{p.sku}</div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-bold">${p.price.toFixed(2)}</span>
                <span className={`text-[10px] ${p.stock === 0 ? 'text-red-400' : ''}`}>Stock: {p.stock}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <button type="button" onClick={() => toggleStatus(p.id, p.status)} className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${p.status ? 'bg-[#00E676]' : 'bg-white/10'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${p.status ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                </button>
                <div className="flex gap-1">
                  <button className="p-1 rounded-lg hover:bg-white/10 text-[--muted] hover:text-[--secondary]"><Edit3 size={13} /></button>
                  <button className="p-1 rounded-lg hover:bg-white/10 text-[--muted] hover:text-red-400"><Trash2 size={13} /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
        <span className="text-[11px] text-[--muted]">Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, filtered.length)} of {filtered.length}</span>
        <div className="flex items-center gap-1">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="p-2 rounded-lg hover:bg-white/5 text-[--muted] disabled:opacity-30"><ChevronLeft size={15} /></button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} className={`w-8 h-8 rounded-lg text-xs ${page === i + 1 ? 'bg-[--primary] text-black font-medium' : 'hover:bg-white/5 text-[--muted]'}`}>{i + 1}</button>
          ))}
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="p-2 rounded-lg hover:bg-white/5 text-[--muted] disabled:opacity-30"><ChevronRight size={15} /></button>
        </div>
      </motion.div>
    </div>
  );
}
