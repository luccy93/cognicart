'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const inventory = [
  { id: '1', name: 'Wireless Headphones Pro', sku: 'WH-1000XM5-BLK', stock: 45, reserved: 3, minStock: 10, category: 'Electronics', location: 'Warehouse A' },
  { id: '2', name: 'Smart Watch Ultra', sku: 'SW-ULTRA-BLK', stock: 28, reserved: 2, minStock: 5, category: 'Wearables', location: 'Warehouse A' },
  { id: '3', name: 'Bluetooth Speaker X', sku: 'BT-SPK-X-BLK', stock: 67, reserved: 5, minStock: 15, category: 'Electronics', location: 'Warehouse B' },
  { id: '4', name: 'Laptop Stand Adjustable', sku: 'LS-ADJ-SLV', stock: 12, reserved: 1, minStock: 20, category: 'Accessories', location: 'Warehouse B' },
  { id: '5', name: 'USB-C Hub 7-in-1', sku: 'UC-HUB-7-SLV', stock: 0, reserved: 0, minStock: 25, category: 'Accessories', location: 'Warehouse A' },
  { id: '6', name: 'Mechanical Keyboard RGB', sku: 'KB-MECH-RGB', stock: 34, reserved: 4, minStock: 10, category: 'Electronics', location: 'Warehouse A' },
  { id: '7', name: 'Gaming Mouse X', sku: 'GM-X-BLK', stock: 8, reserved: 2, minStock: 15, category: 'Electronics', location: 'Warehouse B' },
  { id: '8', name: '4K Webcam Stream', sku: 'WC-4K-BLK', stock: 22, reserved: 1, minStock: 10, category: 'Electronics', location: 'Warehouse A' },
];

export default function SellerInventoryPage() {
  const [search, setSearch] = useState('');
  const filtered = inventory.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase()));

  const totalStock = inventory.reduce((a, b) => a + b.stock, 0);
  const lowStock = inventory.filter(i => i.stock > 0 && i.stock <= i.minStock).length;
  const outOfStock = inventory.filter(i => i.stock === 0).length;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <p className="text-sm text-[--muted]">Track stock levels and manage warehouse inventory</p>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-[--secondary]">{totalStock}</div>
          <div className="text-xs text-[--muted] mt-1">Total Items</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{lowStock}</div>
          <div className="text-xs text-[--muted] mt-1">Low Stock</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{outOfStock}</div>
          <div className="text-xs text-[--muted] mt-1">Out of Stock</div>
        </motion.div>
      </div>

      <div className="glass rounded-xl p-3 flex items-center gap-3 max-w-md">
        <Search size={14} className="text-[--muted]" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or SKU..." className="bg-transparent outline-none text-sm text-white placeholder-[--muted] w-full" />
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/6 text-left text-[--muted]">
              <th className="p-4 font-medium">Product</th>
              <th className="p-4 font-medium">SKU</th>
              <th className="p-4 font-medium">Stock</th>
              <th className="p-4 font-medium">Reserved</th>
              <th className="p-4 font-medium">Available</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Location</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((i, idx) => {
              const available = i.stock - i.reserved;
              const status = i.stock === 0 ? 'out' : i.stock <= i.minStock ? 'low' : 'ok';
              return (
                <tr key={i.id} className="border-b border-white/6 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-medium text-white">{i.name}</td>
                  <td className="p-4 text-[--muted]">{i.sku}</td>
                  <td className="p-4">{i.stock}</td>
                  <td className="p-4">{i.reserved}</td>
                  <td className="p-4 font-medium">{available}</td>
                  <td className="p-4">
                    <span className={`flex items-center gap-1 text-[10px] ${
                      status === 'ok' ? 'text-[--secondary]' :
                      status === 'low' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {status === 'ok' ? <CheckCircle size={12} /> : status === 'low' ? <AlertTriangle size={12} /> : <Clock size={12} />}
                      {status === 'ok' ? 'In Stock' : status === 'low' ? 'Low Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="p-4 text-[--muted]">{i.location}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
