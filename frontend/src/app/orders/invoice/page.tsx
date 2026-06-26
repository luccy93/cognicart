'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { DocumentIcon } from '@/components/ui/emoji-icons';

export const dynamic = 'force-dynamic';

const sampleInvoice = {
  orderNumber: 'ORD-7842-KF',
  date: 'December 15, 2025',
  dueDate: 'December 15, 2025',
  status: 'paid',
  seller: { name: 'CogniCart Inc.', address: '548 AI Innovation Drive, San Francisco, CA 94105', vat: 'US12-3456789' },
  customer: { name: 'Alex Johnson', email: 'alex@example.com', address: '123 Main St, Apt 4B, New York, NY 10001' },
  items: [
    { name: 'Sony WH-1000XM5 Wireless Headphones', sku: 'SNY-WH1000XM5-BLK', qty: 1, price: 278 },
    { name: 'Nike Air Max 270 React', sku: 'NKE-AM270-REACT-WHT', qty: 1, price: 109 },
  ],
  subtotal: 387,
  shipping: 12.99,
  tax: 18.88,
  total: 418.87,
};

export default function InvoicePage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || 'ORD-7842-KF';
  const invoice = sampleInvoice;
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>Invoice ${orderId}</title>
      <style>body{font-family:system-ui,sans-serif;padding:40px;color:#333}h1{font-size:24px;margin:0}table{width:100%;border-collapse:collapse;margin:24px 0}th,td{padding:10px 12px;text-align:left;border-bottom:1px solid #eee}th{background:#f5f5f5}.right{text-align:right}.total{font-weight:bold;font-size:18px}.footer{margin-top:32px;color:#666;font-size:12px}</style></head><body>
      <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:32px">
        <div><h1>CogniCart</h1><p style="color:#666;margin:4px 0">Invoice</p></div>
        <div style="text-align:right"><p style="font-weight:bold">${orderId}</p><p style="color:#666">${invoice.date}</p></div>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:24px">
        <div><p style="font-weight:bold;margin:0 0 4px">From</p><p style="margin:2px 0">${invoice.seller.name}</p><p style="margin:2px 0;color:#666">${invoice.seller.address}</p></div>
        <div style="text-align:right"><p style="font-weight:bold;margin:0 0 4px">To</p><p style="margin:2px 0">${invoice.customer.name}</p><p style="margin:2px 0">${invoice.customer.email}</p><p style="margin:2px 0;color:#666">${invoice.customer.address}</p></div>
      </div>
      <table><tr><th>Item</th><th>SKU</th><th>Qty</th><th class="right">Price</th></tr>
      ${invoice.items.map(i => `<tr><td>${i.name}</td><td style="color:#666">${i.sku}</td><td>${i.qty}</td><td class="right">Rs. ${formatPrice(i.price)}</td></tr>`).join('')}
      </table>
      <div style="text-align:right"><p>Subtotal: Rs. ${formatPrice(invoice.subtotal)}</p><p>Shipping: Rs. ${formatPrice(invoice.shipping)}</p><p>Tax: Rs. ${formatPrice(invoice.tax)}</p><p class="total">Total: Rs. ${formatPrice(invoice.total)}</p></div>
      <div class="footer"><p>Thank you for your business! For questions, contact support@cognicart.ai</p></div>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href={`/orders/${orderId}`} className="text-sm text-[--muted] hover:text-white transition-colors">← Back to Order</Link>
          <Button variant="ghost" onClick={handlePrint}>
            <DocumentIcon size={14} /> Print / Download PDF
          </Button>
        </div>

        <motion.div
          ref={printRef}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 md:p-12"
        >
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold">Invoice</h1>
              <p className="text-[--muted] text-sm mt-1">{orderId}</p>
            </div>
            <div className="text-right">
              <span className="text-xs px-3 py-1 rounded-full bg-[--secondary]/15 text-[--secondary] border border-[--secondary]/20 uppercase text-[10px]">{invoice.status}</span>
              <p className="text-xs text-[--muted] mt-2">{invoice.date}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xs font-semibold text-[--muted] uppercase tracking-wider mb-2">From</h3>
              <p className="text-sm font-medium">{invoice.seller.name}</p>
              <p className="text-xs text-[--muted]">{invoice.seller.address}</p>
              <p className="text-xs text-[--muted]">VAT: {invoice.seller.vat}</p>
            </div>
            <div className="sm:text-right">
              <h3 className="text-xs font-semibold text-[--muted] uppercase tracking-wider mb-2">Bill To</h3>
              <p className="text-sm font-medium">{invoice.customer.name}</p>
              <p className="text-xs text-[--muted]">{invoice.customer.email}</p>
              <p className="text-xs text-[--muted]">{invoice.customer.address}</p>
            </div>
          </div>

          <table className="w-full mb-8">
            <thead>
              <tr className="border-b border-white/6 text-xs text-[--muted] uppercase">
                <th className="text-left pb-3 font-medium">Item</th>
                <th className="text-left pb-3 font-medium hidden sm:table-cell">SKU</th>
                <th className="text-right pb-3 font-medium">Qty</th>
                <th className="text-right pb-3 font-medium">Price</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={i} className="border-b border-white/6">
                  <td className="py-3 text-sm">{item.name}</td>
                  <td className="py-3 text-xs text-[--muted] hidden sm:table-cell">{item.sku}</td>
                  <td className="py-3 text-sm text-right">{item.qty}</td>
                  <td className="py-3 text-sm text-right">Rs. {formatPrice(item.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex flex-col items-end gap-1 text-sm">
            <div className="flex justify-between w-48"><span className="text-[--muted]">Subtotal</span><span>Rs. {formatPrice(invoice.subtotal)}</span></div>
            <div className="flex justify-between w-48"><span className="text-[--muted]">Shipping</span><span>Rs. {formatPrice(invoice.shipping)}</span></div>
            <div className="flex justify-between w-48"><span className="text-[--muted]">Tax</span><span>Rs. {formatPrice(invoice.tax)}</span></div>
            <div className="flex justify-between w-48 text-lg font-bold pt-2 border-t border-white/6 mt-1"><span>Total</span><span>Rs. {formatPrice(invoice.total)}</span></div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/6 text-center">
            <p className="text-[10px] text-[--muted]">Thank you for shopping with CogniCart!</p>
            <p className="text-[10px] text-[--muted] mt-1">For questions, contact support@cognicart.ai</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
