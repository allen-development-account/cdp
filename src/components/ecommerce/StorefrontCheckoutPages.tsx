import React, { useState } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  CreditCard,
  Lock,
  Mail,
  MapPin,
  Package,
  Printer,
  RotateCcw,
  Shield,
  ShoppingBag,
  Sparkles,
  Truck,
  Wand2
} from 'lucide-react';
import { ConfettiCannonCanvas } from './ConfettiCannonCanvas';

export interface CheckoutProductItem {
  product: {
    sku: string;
    name: string;
    category: string;
    price: number;
    image: string;
    finish: string;
    deliveryNote: string;
  };
  quantity: number;
}

export interface CompletedOrderReceipt {
  orderId: string;
  placedAt: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  shippingMethod: 'express' | 'priority';
  shippingCost: number;
  discountAmount: number;
  promoApplied?: string;
  subtotal: number;
  total: number;
  paymentSummary: string;
  items: CheckoutProductItem[];
}

interface StorefrontCheckoutPageProps {
  cart: CheckoutProductItem[];
  initialName: string;
  initialEmail: string;
  initialCity: string;
  defaultPromoCode?: string;
  onBackToStore: () => void;
  onCancelCheckout: () => void;
  onCompleteOrder: (details: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    shippingMethod: 'express' | 'priority';
    shippingCost: number;
    discountAmount: number;
    promoApplied?: string;
    total: number;
    paymentSummary: string;
  }) => void;
}

export const StorefrontCheckoutPage: React.FC<StorefrontCheckoutPageProps> = ({
  cart,
  initialName,
  initialEmail,
  initialCity,
  defaultPromoCode,
  onBackToStore,
  onCancelCheckout,
  onCompleteOrder
}) => {
  const [fullName, setFullName] = useState(
    initialName && initialName !== 'Guest Shopper' ? initialName : ''
  );
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState('(415) 555-0194');
  const [address, setAddress] = useState('450 Market Street, Suite 400');
  const [city, setCity] = useState(initialCity || 'San Francisco');
  const [stateCode, setStateCode] = useState('CA');
  const [zipCode, setZipCode] = useState('94105');

  const [shippingMethod, setShippingMethod] = useState<'express' | 'priority'>('express');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet' | 'invoice'>('card');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('09/28');
  const [cardCvc, setCardCvc] = useState('842');
  const [cardHolder, setCardHolder] = useState(
    initialName && initialName !== 'Guest Shopper' ? initialName : 'Alex Morgan'
  );

  const [promoInput, setPromoInput] = useState(defaultPromoCode || '');
  const [promoApplied, setPromoApplied] = useState<string | undefined>(undefined);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  const subtotal = Number(
    cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(2)
  );
  const discountAmount = promoApplied ? Number((subtotal * 0.1).toFixed(2)) : 0;
  const shippingCost = shippingMethod === 'priority' ? 24 : 0;
  const total = Number(Math.max(0, subtotal - discountAmount + shippingCost).toFixed(2));

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setPromoApplied(code);
    setPromoMessage(`Promo code "${code}" applied (10% off hardware).`);
  };

  const handleFillTestProfile = () => {
    const firstNames = [
      'Aiden', 'Maya', 'Liam', 'Nora', 'Julian', 'Chloe', 'Ethan', 'Sienna',
      'Lucas', 'Hannah', 'Owen', 'Priya', 'Caleb', 'Zoe', 'Gavin', 'Claire'
    ];
    const lastNames = [
      'Mercer', 'Chen', 'Patel', 'Brooks', 'Kowalski', 'Ramirez', 'Bennett', 'Nakamura',
      'Sullivan', 'Okafor', 'Lindqvist', 'Alvarez', 'Foster', 'Kim', 'Hayes', 'Vargas'
    ];
    const domains = [
      'northstarlabs.io', 'crestline.co', 'veridian.tech', 'meridiancloud.com',
      'summitworks.io', 'harborview.dev', 'brightleaf.org', 'cobaltstudio.io'
    ];
    const streets = [
      'Oakwood Ave', 'Market St', 'Harbor Blvd', 'Cedar Ridge Rd', 'Pinecrest Dr',
      'Congress Ave', 'Boylston St', 'Peachtree Ln', 'Beacon Hill Ave', 'Mission Bay Way'
    ];
    const unitTypes = ['Suite', 'Apt', 'Unit', 'Floor'];
    const locations = [
      { city: 'Austin', state: 'TX', zipPrefix: '787', areaCode: '512' },
      { city: 'Seattle', state: 'WA', zipPrefix: '981', areaCode: '206' },
      { city: 'Denver', state: 'CO', zipPrefix: '802', areaCode: '303' },
      { city: 'Boston', state: 'MA', zipPrefix: '021', areaCode: '617' },
      { city: 'Chicago', state: 'IL', zipPrefix: '606', areaCode: '312' },
      { city: 'Atlanta', state: 'GA', zipPrefix: '303', areaCode: '404' },
      { city: 'Portland', state: 'OR', zipPrefix: '972', areaCode: '503' },
      { city: 'San Diego', state: 'CA', zipPrefix: '921', areaCode: '619' },
      { city: 'Raleigh', state: 'NC', zipPrefix: '276', areaCode: '919' },
      { city: 'Minneapolis', state: 'MN', zipPrefix: '554', areaCode: '612' },
      { city: 'Nashville', state: 'TN', zipPrefix: '372', areaCode: '615' },
      { city: 'Miami', state: 'FL', zipPrefix: '331', areaCode: '305' }
    ];

    const pickDifferent = <T,>(arr: T[], exclude?: T): T => {
      const candidates = exclude !== undefined && arr.length > 1 ? arr.filter((x) => x !== exclude) : arr;
      return candidates[Math.floor(Math.random() * candidates.length)];
    };

    const prevFirst = fullName.split(' ')[0];
    const first = pickDifferent(firstNames, prevFirst);
    const last = pickDifferent(lastNames, fullName.split(' ')[1]);
    const generatedName = `${first} ${last}`;

    const suffixNum = Math.floor(100 + Math.random() * 899);
    const domain = pickDifferent(domains);
    const generatedEmail = `${first.toLowerCase()}.${last.toLowerCase()}${suffixNum}@${domain}`;

    const loc = pickDifferent(locations, locations.find((l) => l.city === city));
    const exchange = Math.floor(200 + Math.random() * 799);
    const lineNum = Math.floor(1000 + Math.random() * 8999);
    const generatedPhone = `(${loc.areaCode}) ${exchange}-${lineNum}`;

    const streetNum = Math.floor(120 + Math.random() * 8800);
    const street = pickDifferent(streets);
    const unit = `${pickDifferent(unitTypes)} ${Math.floor(10 + Math.random() * 490)}`;
    const generatedAddress = `${streetNum} ${street}, ${unit}`;
    const zipSuffix = String(Math.floor(1 + Math.random() * 89)).padStart(2, '0');

    const cardPrefix = Math.random() > 0.5 ? '4532' : '4916';
    const block2 = Math.floor(1000 + Math.random() * 8999);
    const block3 = Math.floor(1000 + Math.random() * 8999);
    const block4 = Math.floor(1000 + Math.random() * 8999);
    const expMonth = String(Math.floor(1 + Math.random() * 12)).padStart(2, '0');
    const expYear = String(27 + Math.floor(Math.random() * 5));
    const generatedCvc = String(Math.floor(100 + Math.random() * 899));

    setFullName(generatedName);
    setEmail(generatedEmail);
    setPhone(generatedPhone);
    setAddress(generatedAddress);
    setCity(loc.city);
    setStateCode(loc.state);
    setZipCode(`${loc.zipPrefix}${zipSuffix}`);
    setShippingMethod(Math.random() > 0.5 ? 'priority' : 'express');
    setPaymentMethod('card');
    setCardNumber(`${cardPrefix} ${block2} ${block3} ${block4}`);
    setCardHolder(generatedName);
    setCardExpiry(`${expMonth}/${expYear}`);
    setCardCvc(generatedCvc);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCardDigits = cardNumber.replace(/\D/g, '');
    const last4 = cleanCardDigits.length >= 4 ? cleanCardDigits.slice(-4) : '4242';
    const paymentSummary =
      paymentMethod === 'card'
        ? `Visa •••• ${last4}`
        : paymentMethod === 'wallet'
        ? 'Apple Pay Express'
        : 'Corporate Net-30 Invoice';

    onCompleteOrder({
      fullName: fullName.trim() || 'Valued Customer',
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      state: stateCode.trim(),
      zip: zipCode.trim(),
      shippingMethod,
      shippingCost,
      discountAmount,
      promoApplied,
      total,
      paymentSummary
    });
  };

  return (
    <div className="min-h-full bg-[#F6F8FB] text-[#0F172A] flex flex-col">
      {/* Dedicated Checkout Header */}
      <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBackToStore}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#334155] hover:text-[#1473E6] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0F3D82] text-white flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <span className="text-sm sm:text-base font-bold tracking-tight text-[#0F172A]">
              APEX STORE CHECKOUT
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleFillTestProfile}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] text-xs font-semibold text-[#1473E6] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Fill Test Profile Information</span>
            </button>
            <div className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-[#059669] whitespace-nowrap shrink-0">
              <Lock className="w-3.5 h-3.5" />
              <span>256-Bit Encrypted</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Customer, Shipping & Payment */}
          <div className="lg:col-span-7 space-y-6">
            {/* Section 1: Contact Information */}
            <section className="bg-white rounded-2xl border border-[#DCE3EE] p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#EEF2F7]">
                <span className="w-6 h-6 rounded-full bg-[#1473E6] text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="text-base font-bold text-[#0F172A]">Contact Information</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#1E293B] mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jordan Lee"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#1473E6]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1E293B] mb-1.5">
                    Email Address (For Receipt &amp; Tracking)
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#1473E6]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1E293B] mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(415) 555-0194"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#1473E6]"
                  />
                </div>
              </div>
            </section>

            {/* Section 2: Shipping Address & Delivery */}
            <section className="bg-white rounded-2xl border border-[#DCE3EE] p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#EEF2F7]">
                <span className="w-6 h-6 rounded-full bg-[#1473E6] text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h2 className="text-base font-bold text-[#0F172A]">Shipping Address &amp; Delivery</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 text-xs">
                <div className="sm:col-span-6">
                  <label className="block font-semibold text-[#1E293B] mb-1.5">
                    Street Address
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#1473E6]"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-semibold text-[#1E293B] mb-1.5">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#1473E6]"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block font-semibold text-[#1E293B] mb-1.5">State</label>
                  <input
                    type="text"
                    required
                    value={stateCode}
                    onChange={(e) => setStateCode(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#1473E6]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#1E293B] mb-1.5">ZIP Code</label>
                  <input
                    type="text"
                    required
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#1473E6]"
                  />
                </div>
              </div>

              <div className="pt-2 space-y-2.5">
                <div className="text-xs font-semibold text-[#1E293B]">Select Delivery Speed</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setShippingMethod('express')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      shippingMethod === 'express'
                        ? 'border-[#1473E6] bg-[#EFF6FF] ring-1 ring-[#1473E6]/30'
                        : 'border-[#DCE3EE] bg-white hover:border-[#93B8E8]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-[#0F172A]">Express Courier (2 Days)</div>
                      <div className="text-[11px] text-[#64748B] mt-0.5">Tracked door-to-door</div>
                    </div>
                    <span className="text-xs font-bold text-[#059669]">FREE</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShippingMethod('priority')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      shippingMethod === 'priority'
                        ? 'border-[#1473E6] bg-[#EFF6FF] ring-1 ring-[#1473E6]/30'
                        : 'border-[#DCE3EE] bg-white hover:border-[#93B8E8]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-[#0F172A]">Next-Day Priority Air</div>
                      <div className="text-[11px] text-[#64748B] mt-0.5">Arrives tomorrow by 10am</div>
                    </div>
                    <span className="text-xs font-bold text-[#0F172A] tabular-nums">$24.00</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Section 3: Payment Method */}
            <section className="bg-white rounded-2xl border border-[#DCE3EE] p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#EEF2F7]">
                <span className="w-6 h-6 rounded-full bg-[#1473E6] text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h2 className="text-base font-bold text-[#0F172A]">Payment Method</h2>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`py-2.5 px-3 rounded-xl border font-semibold cursor-pointer transition-colors ${
                    paymentMethod === 'card'
                      ? 'border-[#1473E6] bg-[#EFF6FF] text-[#1473E6]'
                      : 'border-[#DCE3EE] text-[#475569] hover:border-[#93B8E8]'
                  }`}
                >
                  Credit / Debit Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`py-2.5 px-3 rounded-xl border font-semibold cursor-pointer transition-colors ${
                    paymentMethod === 'wallet'
                      ? 'border-[#1473E6] bg-[#EFF6FF] text-[#1473E6]'
                      : 'border-[#DCE3EE] text-[#475569] hover:border-[#93B8E8]'
                  }`}
                >
                  Apple Pay
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('invoice')}
                  className={`py-2.5 px-3 rounded-xl border font-semibold cursor-pointer transition-colors ${
                    paymentMethod === 'invoice'
                      ? 'border-[#1473E6] bg-[#EFF6FF] text-[#1473E6]'
                      : 'border-[#DCE3EE] text-[#475569] hover:border-[#93B8E8]'
                  }`}
                >
                  Corporate PO
                </button>
              </div>

              {paymentMethod === 'card' && (
                <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 text-xs pt-1">
                  <div className="sm:col-span-6">
                    <label className="block font-semibold text-[#1E293B] mb-1.5">Card Number</label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-[#CBD5E1] font-mono focus:outline-none focus:border-[#1473E6]"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block font-semibold text-[#1E293B] mb-1.5">Name on Card</label>
                    <input
                      type="text"
                      required
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-[#1473E6]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-[#1E293B] mb-1.5">Expiration</label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#CBD5E1] font-mono focus:outline-none focus:border-[#1473E6]"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block font-semibold text-[#1E293B] mb-1.5">CVC</label>
                    <input
                      type="text"
                      required
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-[#CBD5E1] font-mono focus:outline-none focus:border-[#1473E6]"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'wallet' && (
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#334155]">
                  Apple Pay digital wallet authorized for instant one-click verification upon clicking <strong>Complete Purchase</strong>.
                </div>
              )}

              {paymentMethod === 'invoice' && (
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#334155]">
                  Corporate Net-30 invoice will be issued directly to your billing email address upon order confirmation.
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Order Summary */}
          <aside className="lg:col-span-5 space-y-5 lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl border border-[#DCE3EE] p-6 shadow-xs space-y-5">
              <h2 className="text-base font-bold text-[#0F172A] pb-3 border-b border-[#EEF2F7]">
                Order Summary ({cart.reduce((s, i) => s + i.quantity, 0)} items)
              </h2>

              <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.product.sku} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-14 h-14 rounded-xl object-cover border border-[#E2E8F0] shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#0F172A] truncate">
                          {item.product.name}
                        </div>
                        <div className="text-[11px] text-[#64748B] mt-0.5">
                          {item.product.finish} · Qty {item.quantity}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold font-mono text-[#0F172A] tabular-nums shrink-0">
                      ${(item.product.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Promo Code */}
              <div className="pt-3 border-t border-[#EEF2F7] space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Promo code (e.g. SAVE10)"
                    className="flex-1 px-3 py-2 text-xs border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#1473E6] uppercase font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-3.5 py-2 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] text-xs font-semibold text-[#0F172A] cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {promoMessage && (
                  <p className="text-[11px] font-medium text-[#059669]">{promoMessage}</p>
                )}
              </div>

              {/* Cost Breakdown */}
              <div className="pt-3 border-t border-[#EEF2F7] space-y-2 text-xs">
                <div className="flex justify-between text-[#475569]">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold tabular-nums">
                    ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#059669] font-medium">
                    <span>Promo Savings ({promoApplied})</span>
                    <span className="font-mono tabular-nums">
                      -${discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-[#475569]">
                  <span>Shipping</span>
                  <span className="font-mono font-semibold tabular-nums">
                    {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-[#475569]">
                  <span>Estimated Tax</span>
                  <span className="font-mono font-semibold tabular-nums">$0.00</span>
                </div>
                <div className="pt-3 border-t border-[#E2E8F0] flex justify-between items-baseline">
                  <span className="text-sm font-bold text-[#0F172A]">Order Total</span>
                  <span className="text-xl font-bold font-mono text-[#0A3D82] tabular-nums">
                    ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 pt-1">
                <button
                  type="submit"
                  className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#1473E6] to-[#0D5EC2] hover:from-[#1265CC] hover:to-[#0A4CA3] text-white text-sm font-bold shadow-md shadow-[#1473E6]/20 transition-all cursor-pointer tabular-nums"
                >
                  Complete Purchase (${total.toLocaleString(undefined, { minimumFractionDigits: 2 })})
                </button>
                <button
                  type="button"
                  onClick={onCancelCheckout}
                  className="w-full py-2.5 px-4 rounded-xl bg-white border border-[#CBD5E1] hover:border-[#1473E6] text-xs font-semibold text-[#475569] hover:text-[#1473E6] transition-colors cursor-pointer"
                >
                  Cancel Checkout &amp; Return
                </button>
              </div>

              <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-[#64748B]">
                <span className="inline-flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-[#1473E6]" />
                  2-Year Warranty
                </span>
                <span className="inline-flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5 text-[#1473E6]" />
                  30-Day Returns
                </span>
              </div>
            </div>
          </aside>
        </form>
      </main>
    </div>
  );
};

interface StorefrontConfirmationPageProps {
  order: CompletedOrderReceipt;
  onContinueShopping: () => void;
}

export const StorefrontConfirmationPage: React.FC<StorefrontConfirmationPageProps> = ({
  order,
  onContinueShopping
}) => {
  const [confettiKey, setConfettiKey] = useState(1);

  return (
    <div className="min-h-full bg-gradient-to-b from-[#F0F6FF] via-[#F8FAFC] to-[#F8FAFC] text-[#0F172A] flex flex-col relative">
      {/* Left & Right Blasting Confetti Celebration */}
      <ConfettiCannonCanvas triggerKey={confettiKey} />

      {/* Header */}
      <header className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0F3D82] to-[#1473E6] text-white flex items-center justify-center">
              <ShoppingBag className="w-4.5 h-4.5" />
            </div>
            <span className="text-base font-bold tracking-tight text-[#0F172A]">
              APEX STORE
            </span>
          </div>

          <button
            type="button"
            onClick={onContinueShopping}
            className="px-4 py-2 rounded-lg bg-[#1473E6] hover:bg-[#0D5EC2] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Continue Shopping
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 space-y-7 relative z-10">
        {/* Celebratory Hero Card */}
        <section className="bg-white rounded-3xl border border-[#CFE0F5] shadow-[0_18px_48px_-18px_rgba(20,115,230,0.22)] p-8 sm:p-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#059669] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#10B981]/25">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#059669]">
              Order Confirmed
            </p>
            <h1 className="text-2xl sm:text-4xl font-bold text-[#0F172A] tracking-tight">
              Thank you for your purchase, {order.customerName}!
            </h1>
            <p className="text-sm text-[#475569] max-w-xl mx-auto">
              Order <span className="font-mono font-bold text-[#0F172A]">{order.orderId}</span> was placed on {order.placedAt}. We are preparing your hardware for shipment.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            {order.customerEmail && (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-xs font-medium text-[#1E40AF]">
                <Mail className="w-3.5 h-3.5" />
                Receipt sent to {order.customerEmail}
              </span>
            )}
            <button
              type="button"
              onClick={() => setConfettiKey((k) => k + 1)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-xs font-semibold text-[#334155] cursor-pointer transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#1473E6]" />
              <span>Celebrate Again</span>
            </button>
          </div>

          {/* 3-Step Order Progress Tracker */}
          <div className="pt-6 mt-4 border-t border-[#EEF2F7] grid grid-cols-3 gap-3 text-left max-w-2xl mx-auto">
            <div className="p-3 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#065F46]">
                <Check className="w-4 h-4 text-[#059669]" />
                <span>Order Confirmed</span>
              </div>
              <p className="text-[11px] text-[#047857] mt-0.5">Payment verified</p>
            </div>
            <div className="p-3 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E40AF]">
                <Package className="w-4 h-4 text-[#1473E6]" />
                <span>Preparing Items</span>
              </div>
              <p className="text-[11px] text-[#1D4ED8] mt-0.5">Packing at warehouse</p>
            </div>
            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#475569]">
                <Truck className="w-4 h-4 text-[#64748B]" />
                <span>{order.shippingMethod === 'priority' ? 'Priority Air' : 'Express Courier'}</span>
              </div>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                {order.shippingMethod === 'priority' ? 'Arrives tomorrow' : 'Arrives in 2 days'}
              </p>
            </div>
          </div>
        </section>

        {/* Order Receipt & Delivery Details */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 bg-white rounded-2xl border border-[#DCE3EE] p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-[#0F172A] pb-3 border-b border-[#EEF2F7]">
              Items Ordered
            </h2>

            <div className="divide-y divide-[#F1F5F9]">
              {order.items.map((item) => (
                <div key={item.product.sku} className="py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-xl object-cover border border-[#E2E8F0] shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-[#0F172A] truncate">
                        {item.product.name}
                      </div>
                      <div className="text-xs text-[#64748B] mt-0.5">
                        {item.product.finish} · Qty {item.quantity}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-bold font-mono text-[#0F172A] tabular-nums shrink-0">
                    ${(item.product.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#EEF2F7] space-y-2 text-xs">
              <div className="flex justify-between text-[#475569]">
                <span>Subtotal</span>
                <span className="font-mono font-semibold tabular-nums">
                  ${order.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-[#059669] font-medium">
                  <span>Promo Savings ({order.promoApplied})</span>
                  <span className="font-mono tabular-nums">
                    -${order.discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-[#475569]">
                <span>Shipping</span>
                <span className="font-mono font-semibold tabular-nums">
                  {order.shippingCost === 0 ? 'FREE' : `$${order.shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="pt-2.5 border-t border-[#E2E8F0] flex justify-between items-baseline">
                <span className="text-sm font-bold text-[#0F172A]">Total Paid</span>
                <span className="text-xl font-bold font-mono text-[#0A3D82] tabular-nums">
                  ${order.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-[#DCE3EE] p-6 shadow-2xs space-y-4 text-xs">
              <div>
                <div className="flex items-center gap-2 font-bold text-[#0F172A] mb-1.5">
                  <MapPin className="w-4 h-4 text-[#1473E6]" />
                  <span>Delivery Address</span>
                </div>
                <p className="text-[#475569] leading-relaxed">
                  {order.customerName}
                  <br />
                  {order.shippingAddress}
                  <br />
                  {order.shippingCity}, {order.shippingState} {order.shippingZip}
                </p>
              </div>

              <div className="pt-3 border-t border-[#EEF2F7]">
                <div className="flex items-center gap-2 font-bold text-[#0F172A] mb-1.5">
                  <CreditCard className="w-4 h-4 text-[#1473E6]" />
                  <span>Payment Method</span>
                </div>
                <p className="text-[#475569] font-mono">{order.paymentSummary}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={onContinueShopping}
                className="w-full py-3 rounded-xl bg-[#1473E6] hover:bg-[#0D5EC2] text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer"
              >
                Continue Shopping
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full py-2.5 rounded-xl bg-white border border-[#CBD5E1] hover:border-[#1473E6] text-xs font-semibold text-[#334155] hover:text-[#1473E6] inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Order Receipt</span>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
