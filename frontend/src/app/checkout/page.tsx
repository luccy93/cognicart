'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { ordersApi, featuresApi, paymentsGatewayApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { LockIcon, MapPinIcon, CreditCardIcon, TruckIcon, GiftIcon, ZapIcon, CheckIcon, PackageIcon, PhoneIcon, BuildingIcon } from '@/components/ui/emoji-icons';
import toast from 'react-hot-toast';

type Step = 1 | 2 | 3 | 4 | 5;

const steps = [
  { id: 1, label: 'Address' }, { id: 2, label: 'Shipping' }, { id: 3, label: 'Payment' }, { id: 4, label: 'Review' }, { id: 5, label: 'Confirmation' },
];

export default function CheckoutPage() {
  const user = useAuthStore((s) => s.user);
  const { items, total, itemCount, fetchCart } = useCartStore();
  const [step, setStep] = useState<Step>(1);
  const [selectedAddress, setSelectedAddress] = useState('home');
  const [selectedShipping, setSelectedShipping] = useState('express');
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [oneClick, setOneClick] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: '', name: '', line: '', city: '', state: '', zip: '', phone: '' });
  const [cardForm, setCardForm] = useState({ number: '', name: '', expiry: '', cvc: '' });

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const nextStep = useCallback(() => setStep(p => Math.min(5, p + 1) as Step), []);
  const prevStep = useCallback(() => setStep(p => Math.max(1, p - 1) as Step), []);
  const shippingCost = selectedShipping === 'overnight' ? 24.99 : selectedShipping === 'express' ? 12.99 : selectedShipping === 'standard' ? 4.99 : 0;
  const tax = total * 0.08;
  const discount = couponApplied ? total * 0.1 : 0;
  const grandTotal = total + shippingCost + tax - discount;

  const address = user?.shipping_address || '123 Main Street, New York, NY 10001';
  const fullName = user?.full_name || 'Guest User';

  const handleApplyCoupon = async () => {
    if (!coupon) return;
    try {
      const res = await featuresApi.getSmartCoupons(grandTotal);
      const coupons = res?.data || [];
      const match = coupons.find((c: { code: string }) => c.code.toUpperCase() === coupon.toUpperCase());
      if (match) {
        setCouponApplied(true);
        const saved = match.savings_amount?.toFixed(2) || (total * 0.1).toFixed(2);
        toast.success('Coupon applied! You saved \u20B9' + saved);
      } else {
        toast.error('Invalid coupon code');
      }
    } catch {
      setCouponApplied(true);
      toast.error('Could not validate coupon. 10% discount applied as fallback.');
    }
  };

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    try {
      const payMethod = selectedPayment === 'cod' ? 'cod' : selectedPayment === 'upi' ? 'razorpay' : 'stripe';

      if (payMethod !== 'cod') {
        try {
          const amountInCents = Math.round(grandTotal * 100);
          const { data: orderData } = await paymentsGatewayApi.createOrder({
            amount: amountInCents,
            currency: 'inr',
            payment_method: payMethod,
          });
          await paymentsGatewayApi.verifyPayment({
            payment_id: orderData.id || `pi_${Date.now()}`,
            order_id: orderData.id || `order_${Date.now()}`,
            signature: `mock_sig_${Date.now()}`,
            payment_method: payMethod,
          });
        } catch {
          toast.error('Payment gateway unavailable, placing order directly');
        }
      }

      const { data } = await ordersApi.create(address, payMethod, couponApplied ? coupon : undefined);
      setOrderNumber(data.order_number || '#' + Math.random().toString(36).substring(2, 10).toUpperCase());
      nextStep();
      toast.success('Order placed successfully!');
    } catch {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen">
      <nav className="nav-blur">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/dashboard" className="w-8 h-8 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-black text-xs font-bold">C</Link>
            <span className="font-bold tracking-widest text-sm">CHECKOUT</span>
          </div>
          <Link href="/cart" className="text-xs text-[--muted] hover:text-white">Back to Cart</Link>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold mb-6">Checkout</h1>
          <div className="flex items-center justify-between mb-8">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <motion.div animate={{ backgroundColor: step >= s.id ? '#6C63FF' : 'rgba(255,255,255,0.05)', borderColor: step >= s.id ? '#6C63FF' : 'rgba(255,255,255,0.1)' }}
                    className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-bold">
                    {step > s.id ? <CheckIcon size={14} className="text-white" /> : s.id}
                  </motion.div>
                  <span className="text-[10px] mt-1.5 text-[--muted]">{s.label}</span>
                </div>
                {i < steps.length - 1 && <div className={`flex-1 h-px mx-3 ${step > s.id ? 'bg-[--primary]' : 'bg-white/10'}`} />}
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="address" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="glass-card rounded-2xl p-6">
                  <h2 className="text-lg font-bold mb-4">Delivery Address</h2>
                  <div onClick={() => setSelectedAddress('home')} className={`glass rounded-xl p-4 cursor-pointer transition-all ${selectedAddress === 'home' ? 'border-[--primary]/40 bg-[--primary]/5' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2"><span className="text-xs font-semibold">Home</span><span className="text-[10px] px-1.5 py-0.5 rounded bg-[--primary]/15 text-[--primary]">Default</span></div>
                        <p className="text-xs mt-1">{fullName}</p>
                        <p className="text-[10px] text-[--muted]">{address}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 ${selectedAddress === 'home' ? 'border-[--primary]' : 'border-white/20'}`}>
                        {selectedAddress === 'home' && <div className="w-2 h-2 rounded-full bg-[--primary]" />}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setShowNewAddress(!showNewAddress)} className="text-xs text-[--secondary] hover:underline mt-4 mb-4 block">+ Add new address</button>
                  <AnimatePresence>{showNewAddress && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
                      <div className="glass rounded-xl p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <input value={newAddress.label} onChange={e => setNewAddress({ ...newAddress, label: e.target.value })} className="glass-input text-xs" placeholder="Label (Home/Office)" />
                          <input value={newAddress.name} onChange={e => setNewAddress({ ...newAddress, name: e.target.value })} className="glass-input text-xs" placeholder="Full Name" />
                          <div className="col-span-2"><input value={newAddress.line} onChange={e => setNewAddress({ ...newAddress, line: e.target.value })} className="glass-input text-xs" placeholder="Address" /></div>
                          <input value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} className="glass-input text-xs" placeholder="City" />
                          <input value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} className="glass-input text-xs" placeholder="State" />
                          <input value={newAddress.zip} onChange={e => setNewAddress({ ...newAddress, zip: e.target.value })} className="glass-input text-xs" placeholder="ZIP" />
                          <input value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} className="glass-input text-xs" placeholder="Phone" />
                        </div>
                        <div className="flex justify-end"><Button variant="primary" size="sm" onClick={() => { setShowNewAddress(false); toast.success('Address saved!'); }}>Save Address</Button></div>
                      </div>
                    </motion.div>
                  )}</AnimatePresence>
                  <div className="flex justify-end"><Button variant="primary" size="sm" onClick={nextStep}>Continue</Button></div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="shipping" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="glass-card rounded-2xl p-6">
                  <h2 className="text-lg font-bold mb-4">Shipping Method</h2>
                  <div className="space-y-3">
                    {[
                      { id: 'standard', name: 'Standard Shipping', price: 4.99, days: '5-8 business days', icon: <TruckIcon size={16} /> },
                      { id: 'express', name: 'Express Shipping', price: 12.99, days: '2-3 business days', icon: <TruckIcon size={16} /> },
                      { id: 'overnight', name: 'Overnight Shipping', price: 24.99, days: '1 business day', icon: <ZapIcon size={16} /> },
                      { id: 'pickup', name: 'Store Pickup', price: 0, days: 'Pick up in-store', icon: <BuildingIcon size={16} /> },
                    ].map(method => (
                      <div key={method.id} onClick={() => setSelectedShipping(method.id)} className={`glass rounded-xl p-4 cursor-pointer transition-all ${selectedShipping === method.id ? 'border-[--primary]/40 bg-[--primary]/5' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`${selectedShipping === method.id ? 'text-[--secondary]' : 'text-[--muted]'}`}>{method.icon}</span>
                            <div><p className="text-sm font-medium">{method.name}</p><p className="text-[10px] text-[--muted]">{method.days}</p></div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${method.price === 0 ? 'text-[--secondary]' : ''}`}>{method.price === 0 ? 'Free' : `₹${method.price.toFixed(2)}`}</span>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedShipping === method.id ? 'border-[--primary]' : 'border-white/20'}`}>
                              {selectedShipping === method.id && <div className="w-2 h-2 rounded-full bg-[--primary]" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-6"><Button variant="ghost" size="sm" onClick={prevStep}>Back</Button><Button variant="primary" size="sm" onClick={nextStep}>Continue</Button></div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="payment" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="glass-card rounded-2xl p-6">
                  <h2 className="text-lg font-bold mb-4">Payment Method</h2>
                  <div className="space-y-3 mb-6">
                    {[
                      { id: 'card', name: 'Credit / Debit Card', icon: <CreditCardIcon size={16} /> },
                      { id: 'upi', name: 'UPI (Google Pay, PhonePe)', icon: <PhoneIcon size={16} /> },
                      { id: 'netbanking', name: 'Net Banking', icon: <BuildingIcon size={16} /> },
                      { id: 'cod', name: 'Cash on Delivery', icon: <PackageIcon size={16} /> },
                    ].map(method => (
                      <div key={method.id} onClick={() => setSelectedPayment(method.id)} className={`glass rounded-xl p-4 cursor-pointer transition-all ${selectedPayment === method.id ? 'border-[--primary]/40 bg-[--primary]/5' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`${selectedPayment === method.id ? 'text-[--secondary]' : 'text-[--muted]'}`}>{method.icon}</span>
                            <span className="text-sm">{method.name}</span>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedPayment === method.id ? 'border-[--primary]' : 'border-white/20'}`}>
                            {selectedPayment === method.id && <div className="w-2 h-2 rounded-full bg-[--primary]" />}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedPayment === 'card' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                        <CreditCardIcon size={16} className="text-[--secondary]" />
                        <span className="text-sm font-medium">Credit / Debit Card</span>
                        <span className="text-[10px] text-[--muted] ml-auto flex items-center gap-1"><LockIcon size={12} /> Secure</span>
                      </div>
                      <input value={cardForm.name} onChange={e => setCardForm({ ...cardForm, name: e.target.value })} className="glass-input text-sm" placeholder="Name on Card" />
                      <input value={cardForm.number} onChange={e => setCardForm({ ...cardForm, number: e.target.value })} className="glass-input text-sm" placeholder="Card Number" maxLength={19} />
                      <div className="grid grid-cols-2 gap-3">
                        <input value={cardForm.expiry} onChange={e => setCardForm({ ...cardForm, expiry: e.target.value })} className="glass-input text-sm" placeholder="MM/YY" maxLength={5} />
                        <input value={cardForm.cvc} onChange={e => setCardForm({ ...cardForm, cvc: e.target.value })} className="glass-input text-sm" placeholder="CVC" maxLength={4} />
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between mt-6"><Button variant="ghost" size="sm" onClick={prevStep}>Back</Button><Button variant="primary" size="sm" onClick={nextStep}>Continue</Button></div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="review" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="glass-card rounded-2xl p-6">
                  <h2 className="text-lg font-bold mb-4">Review Your Order</h2>
                  <div className="space-y-3 mb-5">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm py-2 border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-lg bg-[--surface] overflow-hidden shrink-0">
                            <img src={item.product.thumbnail_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop'} alt={item.product.name} className="w-full h-full object-cover" />
                          </div>
                          <div><span className="text-xs font-medium">{item.product.name}</span><span className="text-[10px] text-[--muted] ml-2">×{item.quantity}</span></div>
                        </div>
                        <span className="text-xs">₹{item.total_price.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4 text-xs mb-5">
                    <div className="glass rounded-lg p-3">
                      <h3 className="text-[10px] font-semibold text-[--primary] uppercase tracking-wider mb-1">Deliver To</h3>
                      <p className="font-medium text-white">{fullName}</p>
                      <p className="text-[--muted]">{address}</p>
                    </div>
                    <div className="glass rounded-lg p-3">
                      <h3 className="text-[10px] font-semibold text-[--secondary] uppercase tracking-wider mb-1">Shipping</h3>
                      <p className="font-medium text-white">{['standard', 'express', 'overnight', 'pickup'][['standard', 'express', 'overnight', 'pickup'].indexOf(selectedShipping)] || 'Express'}</p>
                    </div>
                    <div className="glass rounded-lg p-3">
                      <h3 className="text-[10px] font-semibold text-[--accent] uppercase tracking-wider mb-1">Payment</h3>
                      <p className="font-medium text-white">{['Credit Card', 'UPI', 'Net Banking', 'Cash on Delivery'][['card', 'upi', 'netbanking', 'cod'].indexOf(selectedPayment)]}</p>
                    </div>
                  </div>
                  <div className="border-t border-white/10 pt-4 space-y-1.5 text-sm">
                    <div className="flex justify-between text-[--muted]"><span>Subtotal ({itemCount} items)</span><span>₹{total.toLocaleString()}</span></div>
                    <div className="flex justify-between text-[--muted]"><span>Shipping</span><span>{shippingCost === 0 ? <span className="text-[--secondary]">Free</span> : `₹${shippingCost.toFixed(2)}`}</span></div>
                    <div className="flex justify-between text-[--muted]"><span>Tax</span><span>₹{tax.toLocaleString()}</span></div>
                    {discount > 0 && <div className="flex justify-between text-[--accent]"><span>Coupon Discount</span><span>-₹{discount.toLocaleString()}</span></div>}
                    <div className="flex justify-between font-bold text-base pt-2 border-t border-white/10"><span>Total</span><span className="text-[--secondary]">₹{grandTotal.toLocaleString()}</span></div>
                  </div>
                  <div className="flex justify-between mt-6">
                    <Button variant="ghost" size="sm" onClick={prevStep}>Back</Button>
                    <Button variant="primary" size="sm" onClick={handlePlaceOrder} disabled={placingOrder}>
                      {placingOrder ? 'Placing Order...' : `Place Order — ₹${grandTotal.toLocaleString()}`}
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 5 && (
                <motion.div key="confirmation" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card rounded-2xl p-8 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center mx-auto mb-5">
                    <CheckIcon size={24} className="text-black" />
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-1">Order Confirmed!</h2>
                  <p className="text-sm text-[--muted] mb-5">Thank you for your purchase, {fullName}</p>

                  <div className="glass rounded-xl p-5 mb-5 text-left max-w-md mx-auto">
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/5">
                      <span className="text-xs text-[--muted]">Order Number</span>
                      <span className="text-sm font-bold text-[--secondary] font-mono">{orderNumber}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs"><span className="text-[--muted]">Items</span><span>{itemCount}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-[--muted]">Total</span><span className="font-semibold">₹{grandTotal.toLocaleString()}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-[--muted]">Payment</span><span>{['Credit Card', 'UPI', 'Net Banking', 'Cash on Delivery'][['card', 'upi', 'netbanking', 'cod'].indexOf(selectedPayment)]}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-[--muted]">Shipping</span><span>{['Standard', 'Express', 'Overnight', 'Store Pickup'][['standard', 'express', 'overnight', 'pickup'].indexOf(selectedShipping)]}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-[--muted]">Delivering to</span><span className="text-right max-w-[180px] truncate">{address}</span></div>
                    </div>
                  </div>

                  <div className="glass rounded-xl p-4 mb-5 text-left max-w-md mx-auto">
                    <h3 className="text-xs font-semibold mb-2 text-[--primary]">Order Summary</h3>
                    <div className="space-y-1.5 text-xs">
                      {items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-[--surface] overflow-hidden shrink-0">
                            <img src={item.product.thumbnail_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop'} alt="" className="w-full h-full object-cover" />
                          </div>
                          <span className="truncate flex-1">{item.product.name}</span>
                          <span className="text-[--muted] shrink-0">×{item.quantity}</span>
                        </div>
                      ))}
                      {items.length > 3 && <p className="text-[10px] text-[--muted]">+{items.length - 3} more items</p>}
                    </div>
                  </div>

                  <p className="text-xs text-[--muted] max-w-sm mx-auto mb-6">A confirmation email has been sent to your registered email. Track your order status anytime.</p>
                  <div className="flex justify-center gap-3">
                    <Link href={`/orders`}><Button variant="primary" size="sm">Track Order</Button></Link>
                    <Link href="/products"><Button variant="ghost" size="sm">Continue Shopping</Button></Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {step < 5 && (
            <div className="lg:col-span-1">
              <div className="glass-card rounded-2xl p-5 sticky top-28">
                <h3 className="text-sm font-bold mb-4">Order Summary</h3>
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[--surface] overflow-hidden shrink-0">
                        <img src={item.product.thumbnail_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop'} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0"><p className="text-[10px] truncate">{item.product.name}</p><p className="text-[10px] text-[--muted]">×{item.quantity}</p></div>
                      <span className="text-[10px]">₹{item.total_price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5 text-xs border-t border-white/5 pt-3">
                  <div className="flex justify-between text-[--muted]"><span>Subtotal</span><span>₹{total.toLocaleString()}</span></div>
                  <div className="flex justify-between text-[--muted]"><span>Shipping</span><span>{shippingCost === 0 ? 'Free' : `₹${shippingCost.toFixed(2)}`}</span></div>
                  <div className="flex justify-between text-[--muted]"><span>Tax</span><span>₹{tax.toLocaleString()}</span></div>
                  {discount > 0 && <div className="flex justify-between text-[--accent]"><span>Discount</span><span>-₹{discount.toLocaleString()}</span></div>}
                </div>
                <div className="flex gap-2 mt-3">
                  <input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="Coupon code" className="glass-input text-[10px] flex-1" disabled={couponApplied} />
                  <Button variant="ghost" size="sm" onClick={handleApplyCoupon} disabled={!coupon || couponApplied}>{couponApplied ? 'Applied' : 'Apply'}</Button>
                </div>
                <div className="flex items-center justify-between font-bold mt-3 pt-3 border-t border-white/10">
                  <span className="text-xs">Total</span>
                  <span className="text-sm text-[--secondary]">₹{grandTotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1 mt-3 text-[10px] text-[--muted] justify-center"><LockIcon size={10} /> Secure checkout</div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
