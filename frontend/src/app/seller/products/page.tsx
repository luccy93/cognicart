'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';
import { StarIcon } from '@/components/ui/emoji-icons';

const sampleProducts = [
  { id: '1', name: 'Wireless Headphones Pro', price: 249.99, stock: 45, sales: 234, status: 'Active', rating: 4.8, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop' },
  { id: '2', name: 'Smart Watch Ultra', price: 399.99, stock: 28, sales: 189, status: 'Active', rating: 4.7, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop' },
  { id: '3', name: 'Bluetooth Speaker X', price: 99.99, stock: 67, sales: 156, status: 'Active', rating: 4.5, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=100&h=100&fit=crop' },
  { id: '4', name: 'Laptop Stand Adjustable', price: 79.99, stock: 12, sales: 98, status: 'Low Stock', rating: 4.6, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=100&h=100&fit=crop' },
  { id: '5', name: 'USB-C Hub 7-in-1', price: 49.99, stock: 0, sales: 67, status: 'Out of Stock', rating: 4.3, image: 'https://images.unsplash.com/photo-1612629788024-2f6ab1f51ebf?w=100&h=100&fit=crop' },
];

export default function SellerProductsPage() {
  const [search, setSearch] = useState('');
  const filtered = sampleProducts.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Products</h1>
          <p className="text-sm text-[--muted]">Manage your product listings</p>
        </div>
        <button className="btn-primary text-xs px-4 py-2.5 flex items-center gap-2">
          <Plus size={14} /> Add Product
        </button>
      </motion.div>

      <div className="glass rounded-xl p-3 flex items-center gap-3 max-w-md">
        <Search size={14} className="text-[--muted]" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="bg-transparent outline-none text-sm text-white placeholder-[--muted] w-full" />
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/6 text-left text-[--muted]">
              <th className="p-4 font-medium">Product</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium">Stock</th>
              <th className="p-4 font-medium">Sales</th>
              <th className="p-4 font-medium">Rating</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id} className="border-b border-white/6 hover:bg-white/[0.02] transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                    <span className="font-medium text-white">{p.name}</span>
                  </div>
                </td>
                <td className="p-4">${p.price.toFixed(2)}</td>
                <td className="p-4">{p.stock}</td>
                <td className="p-4">{p.sales}</td>
                <td className="p-4">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <StarIcon size={14} /> {p.rating}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                    p.status === 'Active' ? 'bg-[--secondary]/15 text-[--secondary]' :
                    p.status === 'Low Stock' ? 'bg-yellow-500/15 text-yellow-400' :
                    'bg-red-500/15 text-red-400'
                  }`}>{p.status}</span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex gap-2 justify-end">
                    <button className="p-1.5 glass rounded-lg hover:text-[--primary]"><Eye size={14} /></button>
                    <button className="p-1.5 glass rounded-lg hover:text-[--secondary]"><Edit2 size={14} /></button>
                    <button className="p-1.5 glass rounded-lg hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
