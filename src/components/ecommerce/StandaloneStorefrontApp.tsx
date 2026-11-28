import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  ShoppingBag,
  ShoppingCart,
  Search,
  Heart,
  User,
  UserCheck,
  Sparkles,
  Plus,
  Minus,
  Trash2,
  Eye,
  X,
  Shield,
  Truck,
  RotateCcw,
  Star,
  ArrowRight,
  LogOut,
  Check,
  ChevronDown,
  Lock
} from 'lucide-react';
import {
  StorefrontCheckoutPage,
  StorefrontConfirmationPage,
  CompletedOrderReceipt
} from './StorefrontCheckoutPages';

import headphonesImg from '../../assets/images/store_headphones_1795866085443.jpg';
import laptopImg from '../../assets/images/store_laptop_1795866086198.jpg';
import serverImg from '../../assets/images/store_server_1795866086634.jpg';
import watchImg from '../../assets/images/store_watch_1795866086056.jpg';
import routerImg from '../../assets/images/store_router_1795866086961.jpg';
import dockImg from '../../assets/images/store_dock_1795866086796.jpg';
import speakersImg from '../../assets/images/store_speakers_1795866087427.jpg';
import securityImg from '../../assets/images/store_security_1795866087797.jpg';

interface StoreProduct {
  sku: string;
  name: string;
  category: 'Audio & Wearables' | 'Workstations' | 'Cloud Hardware' | 'Smart Home';
  price: number;
  originalPrice?: number;
  badge?: string;
  rating: number;
  reviewsCount: number;
  tagline: string;
  features: string[];
  specs: string[];
  image: string;
  finish: string;
  deliveryNote: string;
}

interface CartItem {
  product: StoreProduct;
  quantity: number;
}

type SortOption = 'featured' | 'price_asc' | 'price_desc' | 'rating';

const STORE_PRODUCTS: StoreProduct[] = [
  {
    sku: 'XLR8-AUDIO-PRO9',
    name: 'Apex Studio ANC Headphones',
    category: 'Audio & Wearables',
    price: 349,
    originalPrice: 399,
    badge: 'Best Seller',
    rating: 4.9,
    reviewsCount: 412,
    tagline: 'Spatial lossless wireless audio with adaptive hybrid noise cancellation.',
    features: ['48-hour battery life', 'Lossless USB-C & BT 5.4', 'Memory foam earcups'],
    specs: ['Bluetooth 5.4 Lossless', '48h Battery Life', '40mm Titanium Drivers', 'USB-C Fast Charge'],
    image: headphonesImg,
    finish: 'Midnight Navy',
    deliveryNote: 'Free 2-Day Delivery'
  },
  {
    sku: 'XLR8-WORK-M4MAX',
    name: 'QuantumBook Pro 16" Workstation',
    category: 'Workstations',
    price: 2499,
    badge: 'Flagship',
    rating: 4.9,
    reviewsCount: 289,
    tagline: '128GB unified memory pro workstation built for engineering and creative studios.',
    features: ['128GB unified memory', '2TB NVMe Gen5 SSD', '120Hz Liquid XDR display'],
    specs: ['16-Core Neural Engine', '2TB NVMe Gen5', '120Hz XDR Display', '140W GaN Charger'],
    image: laptopImg,
    finish: 'Anodized Titanium',
    deliveryNote: 'Free Express Shipping'
  },
  {
    sku: 'XLR8-CLOUD-NODE8',
    name: 'EdgeCluster Rack Server 8X',
    category: 'Cloud Hardware',
    price: 1420,
    badge: 'Enterprise',
    rating: 4.8,
    reviewsCount: 164,
    tagline: 'Compact rackmount compute appliance engineered for quiet office deployment.',
    features: ['Dual 25GbE fiber uplinks', '192GB ECC DDR5 RAM', 'Redundant hot-swap PSU'],
    specs: ['Dual 25GbE SFP28', 'ECC DDR5 192GB', 'Zero-Touch Provisioning', 'Redundant PSU'],
    image: serverImg,
    finish: 'Slate Aluminum',
    deliveryNote: 'Ships Next Business Day'
  },
  {
    sku: 'XLR8-WEAR-CHRONO',
    name: 'Pulse Titanium Smart Watch',
    category: 'Audio & Wearables',
    price: 499,
    badge: 'New Release',
    rating: 4.7,
    reviewsCount: 198,
    tagline: 'Grade-5 brushed titanium wearable with sapphire crystal glass and dual-band GPS.',
    features: ['14-day battery autonomy', 'Sapphire crystal glass', '100m water resistance'],
    specs: ['Sapphire Glass', 'Dual-Band GPS', '14-Day Power', '100m Water Resistance'],
    image: watchImg,
    finish: 'Brushed Titanium',
    deliveryNote: 'Free 2-Day Delivery'
  },
  {
    sku: 'XLR8-HOME-MESH7',
    name: 'OmniFi Wi-Fi 7 Tri-Band Mesh',
    category: 'Smart Home',
    price: 599,
    originalPrice: 679,
    badge: 'Top Rated',
    rating: 4.8,
    reviewsCount: 327,
    tagline: 'Ultra-low latency 10Gbps wireless coverage for connected homes and studios.',
    features: ['Up to 6,500 sq ft range', 'Multi-Gig 10G WAN/LAN', '320MHz Wi-Fi 7 channels'],
    specs: ['320MHz Channels', '10G WAN/LAN', '6,500 sq ft Coverage', 'WPA3 Security'],
    image: routerImg,
    finish: 'Porcelain Matte',
    deliveryNote: 'Free 2-Day Delivery'
  },
  {
    sku: 'XLR8-WORK-DOCK',
    name: 'Thunderbolt 5 Studio Dock',
    category: 'Workstations',
    price: 289,
    rating: 4.9,
    reviewsCount: 510,
    tagline: 'Single-cable 140W laptop charging with triple 6K display output and high-speed I/O.',
    features: ['120Gbps bandwidth', '140W host charging', 'SD UHS-II + 2.5GbE'],
    specs: ['120Gbps Bandwidth', '2.5Gb Ethernet', 'SD UHS-II Reader', '140W Host Delivery'],
    image: dockImg,
    finish: 'Space Gray',
    deliveryNote: 'Free 2-Day Delivery'
  },
  {
    sku: 'XLR8-AUDIO-MON5',
    name: 'StudioWave Reference Speakers',
    category: 'Audio & Wearables',
    price: 649,
    badge: 'Studio Grade',
    rating: 4.9,
    reviewsCount: 145,
    tagline: 'Bi-amplified nearfield monitors tuned for balanced vocal and bass clarity.',
    features: ['180W Class-D bi-amp', 'Acoustic room calibration', 'Balanced TRS & USB-C'],
    specs: ['Class-D 180W Bi-Amp', 'Room EQ Calibration', 'Balanced TRS & USB-C', 'Isolation Pads Included'],
    image: speakersImg,
    finish: 'Charcoal & Copper',
    deliveryNote: 'Free Express Shipping'
  },
  {
    sku: 'XLR8-HOME-VAULT',
    name: 'Apex Edge Home Security Hub',
    category: 'Smart Home',
    price: 379,
    rating: 4.8,
    reviewsCount: 214,
    tagline: 'Private encrypted local video storage and Matter controller with zero monthly fees.',
    features: ['4TB encrypted storage', 'No subscription fees', 'Matter & Thread built-in'],
    specs: ['4TB Encrypted NVMe', 'Matter & Thread', 'Local AI Detection', 'PoE+ Ready'],
    image: securityImg,
    finish: 'Graphite Glass',
    deliveryNote: 'Free 2-Day Delivery'
  }
];

const CATEGORIES = ['All', 'Audio & Wearables', 'Workstations', 'Cloud Hardware', 'Smart Home'] as const;

const PRESET_SHOPPERS = [
  { label: 'Elena Rostova (CloudScale)', email: 'elena.rostova@cloudscale.io', firstName: 'Elena', lastName: 'Rostova', city: 'San Francisco' },
  { label: 'Marcus Vance (VanceMedia)', email: 'marcus.vance@vancemedia.io', firstName: 'Marcus', lastName: 'Vance', city: 'New York' },
  { label: 'Sophia Tanaka (DesignStudios)', email: 'sophia.tanaka@designstudios.jp', firstName: 'Sophia', lastName: 'Tanaka', city: 'Seattle' }
];

export const StandaloneStorefrontApp: React.FC = () => {
  const params = new URLSearchParams(window.location.search);
  const initialMode = params.get('mode') === 'customer' ? 'customer' : 'guest';
  const initialEmail = params.get('email') || '';
  const initialName = params.get('name') || (initialEmail ? initialEmail.split('@')[0] : 'Guest Shopper');
  const initialFirstName = params.get('firstName') || initialName.split(' ')[0] || '';
  const initialLastName = params.get('lastName') || initialName.split(' ').slice(1).join(' ') || '';
  const initialCity = params.get('city') || 'San Francisco';
  const paramEcid = params.get('ecid');

  const [ecid, setEcid] = useState<string>(() => {
    if (paramEcid) {
      try {
        localStorage.setItem('xlr8_ecid', paramEcid);
      } catch {
        // ignore
      }
      return paramEcid;
    }
    try {
      const saved = localStorage.getItem('xlr8_ecid');
      if (saved) return saved;
      const created = `ecid_store_${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem('xlr8_ecid', created);
      return created;
    } catch {
      return `ecid_store_${Date.now().toString(36)}`;
    }
  });

  const [shopperEmail, setShopperEmail] = useState<string>(initialMode === 'customer' ? initialEmail : '');
  const [shopperName, setShopperName] = useState<string>(initialMode === 'customer' && initialEmail ? initialName : 'Guest Shopper');

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [quickViewProduct, setQuickViewProduct] = useState<StoreProduct | null>(null);
  const [wishlistSkus, setWishlistSkus] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [customNameInput, setCustomNameInput] = useState('');
  const [customEmailInput, setCustomEmailInput] = useState('');

  const [storePage, setStorePage] = useState<'catalog' | 'checkout' | 'confirmation'>('catalog');
  const [shippingCity, setShippingCity] = useState(initialCity);
  const [completedReceipt, setCompletedReceipt] = useState<CompletedOrderReceipt | null>(null);
  const [addedFeedbackSku, setAddedFeedbackSku] = useState<string | null>(null);

  const abandonEmittedRef = useRef<boolean>(false);
  const catalogSectionRef = useRef<HTMLElement | null>(null);
  const scrollViewportRef = useRef<HTMLDivElement | null>(null);

  const navigateStorePage = useCallback((nextPage: 'catalog' | 'checkout' | 'confirmation') => {
    setStorePage(nextPage);
    requestAnimationFrame(() => {
      scrollViewportRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }, []);

  // Personalized edge offer
  const [edgeOffer, setEdgeOffer] = useState<{ headline: string; badge: string; promoCode?: string } | null>(null);

  const cartTotal = Number(cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(2));
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Ensure body is cleanly scrollable in standalone storefront tab
  useEffect(() => {
    document.title = 'Apex Hardware & Audio — Official Online Store';
    document.body.classList.remove('overflow-hidden');
    document.body.classList.add('overflow-y-auto', 'bg-[#F8FAFC]');
    return () => {
      document.body.classList.add('overflow-hidden');
      document.body.classList.remove('overflow-y-auto', 'bg-[#F8FAFC]');
    };
  }, []);

  const fetchEdgeOffer = useCallback(async (currentEcid: string, currentEmail: string) => {
    try {
      const res = await fetch('/api/v1/edge/decide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ecid: currentEcid,
          email: currentEmail || undefined,
          placement: 'storefront_hero'
        })
      });
      if (!res.ok) return;
      const decision = await res.json();
      if (decision?.selectedOffer) {
        setEdgeOffer({
          headline: decision.selectedOffer.headline || decision.selectedOffer.title,
          badge: decision.selectedOffer.badge || 'Member Offer',
          promoCode: decision.selectedOffer.promoCode
        });
      }
    } catch {
      // ignore
    }
  }, []);

  const sendCollectEvent = useCallback(async (
    eventType: string,
    extraPayload: Record<string, any> = {},
    overrideIdentity?: { email?: string; fullName?: string; firstName?: string; lastName?: string; city?: string }
  ) => {
    const emailToSend = overrideIdentity?.email !== undefined ? overrideIdentity.email : shopperEmail;
    const payload = {
      timestamp: new Date().toISOString(),
      channel: 'Web SDK',
      schemaId: 'xdm_experience_event',
      event_name: eventType,
      anon_cookie_id: ecid,
      ...(emailToSend ? { customer_email: emailToSend } : {}),
      ...(overrideIdentity?.fullName ? { fullName: overrideIdentity.fullName } : {}),
      ...(overrideIdentity?.firstName ? { firstName: overrideIdentity.firstName } : {}),
      ...(overrideIdentity?.lastName ? { lastName: overrideIdentity.lastName } : {}),
      ...(overrideIdentity?.city ? { city: overrideIdentity.city } : {}),
      page_url: window.location.href,
      storefront_app: 'Apex Hardware Storefront',
      ...extraPayload
    };

    try {
      await fetch('/api/v1/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      fetchEdgeOffer(ecid, emailToSend);
    } catch {
      // ignore
    }
  }, [ecid, shopperEmail, fetchEdgeOffer]);

  // Initial PageView or Identify on store entry
  const didInitRef = useRef(false);
  useEffect(() => {
    if (!didInitRef.current) {
      didInitRef.current = true;
      if (initialMode === 'customer' && initialEmail) {
        sendCollectEvent(
          'Identify',
          { cart_total: 0, cart_items_count: 0 },
          {
            email: initialEmail,
            fullName: initialName,
            firstName: initialFirstName,
            lastName: initialLastName,
            city: initialCity
          }
        );
      } else {
        sendCollectEvent('PageView', {
          category: 'All',
          cart_total: 0,
          cart_items_count: 0
        });
      }
    }
  }, [initialMode, initialEmail, initialName, initialFirstName, initialLastName, initialCity, sendCollectEvent]);

  // Background idle cart abandonment check (20s)
  useEffect(() => {
    if (cart.length === 0 || storePage !== 'catalog') return;
    if (abandonEmittedRef.current) return;

    const timer = setTimeout(() => {
      if (!abandonEmittedRef.current && cart.length > 0) {
        abandonEmittedRef.current = true;
        const totalNow = Number(cart.reduce((s, i) => s + i.product.price * i.quantity, 0).toFixed(2));
        const countNow = cart.reduce((s, i) => s + i.quantity, 0);
        sendCollectEvent('CartAbandoned', {
          cart_total: totalNow,
          cart_items_count: countNow,
          abandon_reason: 'idle_session_timeout_20s',
          sku: cart[0]?.product.sku,
          product_name: cart[0]?.product.name,
          category: cart[0]?.product.category,
          items: cart.map((i) => ({
            sku: i.product.sku,
            name: i.product.name,
            qty: i.quantity,
            unit_price: i.product.price
          }))
        });
      }
    }, 20000);

    return () => clearTimeout(timer);
  }, [cart, storePage, sendCollectEvent]);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    sendCollectEvent('PageView', {
      category: cat,
      cart_total: cartTotal,
      cart_items_count: cartItemsCount
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    sendCollectEvent('Search', {
      search_query: searchQuery.trim(),
      cart_total: cartTotal,
      cart_items_count: cartItemsCount
    });
    catalogSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleQuickView = (product: StoreProduct) => {
    setQuickViewProduct(product);
    sendCollectEvent('ProductView', {
      sku: product.sku,
      product_name: product.name,
      category: product.category,
      unit_price: product.price,
      cart_total: cartTotal,
      cart_items_count: cartItemsCount
    });
  };

  const handleWishlistToggle = (product: StoreProduct) => {
    const exists = wishlistSkus.includes(product.sku);
    setWishlistSkus((prev) => (exists ? prev.filter((s) => s !== product.sku) : [...prev, product.sku]));
    if (!exists) {
      sendCollectEvent('WishlistAdd', {
        sku: product.sku,
        product_name: product.name,
        category: product.category,
        unit_price: product.price,
        cart_total: cartTotal,
        cart_items_count: cartItemsCount
      });
    }
  };

  const handleAddToCart = (product: StoreProduct) => {
    abandonEmittedRef.current = false;
    setAddedFeedbackSku(product.sku);
    setTimeout(() => setAddedFeedbackSku((cur) => (cur === product.sku ? null : cur)), 1300);

    const existing = cart.find((c) => c.product.sku === product.sku);
    const nextCart = existing
      ? cart.map((c) => (c.product.sku === product.sku ? { ...c, quantity: c.quantity + 1 } : c))
      : [...cart, { product, quantity: 1 }];

    setCart(nextCart);
    const nextTotal = Number(nextCart.reduce((s, i) => s + i.product.price * i.quantity, 0).toFixed(2));
    const nextCount = nextCart.reduce((s, i) => s + i.quantity, 0);

    sendCollectEvent('AddToCart', {
      sku: product.sku,
      product_name: product.name,
      category: product.category,
      unit_price: product.price,
      quantity: 1,
      cart_total: nextTotal,
      cart_items_count: nextCount,
      items: nextCart.map((i) => ({
        sku: i.product.sku,
        name: i.product.name,
        qty: i.quantity,
        unit_price: i.product.price
      }))
    });
  };

  const handleUpdateQty = (sku: string, delta: number) => {
    const target = cart.find((c) => c.product.sku === sku);
    if (!target) return;

    abandonEmittedRef.current = false;
    const nextCart = cart
      .map((c) => (c.product.sku === sku ? { ...c, quantity: c.quantity + delta } : c))
      .filter((c) => c.quantity > 0);
    setCart(nextCart);

    const nextTotal = Number(nextCart.reduce((s, i) => s + i.product.price * i.quantity, 0).toFixed(2));
    const nextCount = nextCart.reduce((s, i) => s + i.quantity, 0);

    sendCollectEvent(delta < 0 ? 'RemoveFromCart' : 'AddToCart', {
      sku: target.product.sku,
      product_name: target.product.name,
      category: target.product.category,
      unit_price: target.product.price,
      quantity: Math.abs(delta),
      cart_total: nextTotal,
      cart_items_count: nextCount
    });
  };

  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    setIsCartOpen(false);
    navigateStorePage('checkout');
    sendCollectEvent('CheckoutStarted', {
      cart_total: cartTotal,
      cart_items_count: cartItemsCount,
      sku: cart[0]?.product.sku,
      product_name: cart[0]?.product.name,
      items: cart.map((i) => ({
        sku: i.product.sku,
        name: i.product.name,
        qty: i.quantity,
        unit_price: i.product.price
      }))
    });
  };

  const handleAbandonCheckout = () => {
    if (cart.length === 0) {
      navigateStorePage('catalog');
      return;
    }
    abandonEmittedRef.current = true;
    setIsCartOpen(false);
    navigateStorePage('catalog');
    sendCollectEvent('CartAbandoned', {
      cart_total: cartTotal,
      cart_items_count: cartItemsCount,
      abandon_reason: 'checkout_cancelled',
      sku: cart[0]?.product.sku,
      product_name: cart[0]?.product.name,
      category: cart[0]?.product.category
    });
  };

  const handleCompleteCheckoutOrder = (details: {
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
  }) => {
    if (cart.length === 0) return;
    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const purchasedItems = [...cart];
    const subtotal = Number(
      purchasedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(2)
    );
    const cleanEmail = details.email.trim().toLowerCase();
    const cleanName = details.fullName.trim();

    if (cleanEmail) setShopperEmail(cleanEmail);
    if (cleanName) setShopperName(cleanName);
    if (details.city) setShippingCity(details.city);

    sendCollectEvent(
      'Purchase',
      {
        transaction_id: orderId,
        total_amount: details.total,
        discount_amount: details.discountAmount,
        promo_code: details.promoApplied,
        shipping_method: details.shippingMethod,
        cart_total: 0,
        cart_items_count: 0,
        sku: purchasedItems[0]?.product.sku,
        product_name: purchasedItems[0]?.product.name,
        category: purchasedItems[0]?.product.category,
        items: purchasedItems.map((i) => ({
          sku: i.product.sku,
          name: i.product.name,
          qty: i.quantity,
          unit_price: i.product.price
        }))
      },
      {
        email: cleanEmail || shopperEmail,
        fullName: cleanName || shopperName,
        firstName: cleanName ? cleanName.split(' ')[0] : undefined,
        lastName: cleanName ? cleanName.split(' ').slice(1).join(' ') : undefined,
        city: details.city
      }
    );

    setCart([]);
    abandonEmittedRef.current = false;
    setCompletedReceipt({
      orderId,
      placedAt: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }),
      customerName: cleanName || shopperName || 'Valued Customer',
      customerEmail: cleanEmail || shopperEmail,
      shippingAddress: details.address,
      shippingCity: details.city,
      shippingState: details.state,
      shippingZip: details.zip,
      shippingMethod: details.shippingMethod,
      shippingCost: details.shippingCost,
      discountAmount: details.discountAmount,
      promoApplied: details.promoApplied,
      subtotal,
      total: details.total,
      paymentSummary: details.paymentSummary,
      items: purchasedItems
    });
    navigateStorePage('confirmation');
  };

  const handleSignInCustomer = (customer: { email: string; firstName: string; lastName: string; city?: string }) => {
    const cleanEmail = customer.email.trim().toLowerCase();
    const fullName = `${customer.firstName} ${customer.lastName || ''}`.trim();
    setShopperEmail(cleanEmail);
    setShopperName(fullName || cleanEmail.split('@')[0]);
    if (customer.city) setShippingCity(customer.city);
    setIsSignInOpen(false);

    sendCollectEvent(
      'Identify',
      { cart_total: cartTotal, cart_items_count: cartItemsCount },
      {
        email: cleanEmail,
        fullName,
        firstName: customer.firstName,
        lastName: customer.lastName,
        city: customer.city || 'San Francisco'
      }
    );
  };

  const handleSignOutGuest = () => {
    const freshEcid = `ecid_store_${Math.random().toString(36).slice(2, 8)}`;
    try {
      localStorage.setItem('xlr8_ecid', freshEcid);
    } catch {
      // ignore
    }
    setEcid(freshEcid);
    setShopperEmail('');
    setShopperName('Guest Shopper');
    setCart([]);
    setCompletedReceipt(null);
    navigateStorePage('catalog');
    abandonEmittedRef.current = false;
    sendCollectEvent('PageView', { category: selectedCategory, cart_total: 0, cart_items_count: 0 }, { email: '' });
  };

  const filteredProducts = useMemo(() => {
    const list = STORE_PRODUCTS.filter((p) => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.features.some((f) => f.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });

    if (sortBy === 'price_asc') return [...list].sort((a, b) => a.price - b.price);
    if (sortBy === 'price_desc') return [...list].sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') return [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [selectedCategory, searchQuery, sortBy]);

  return (
    <div ref={scrollViewportRef} className="h-full w-full overflow-y-auto bg-[#F8FAFC]">
      {storePage === 'checkout' && cart.length > 0 ? (
        <StorefrontCheckoutPage
          cart={cart}
          initialName={shopperName}
          initialEmail={shopperEmail}
          initialCity={shippingCity}
          defaultPromoCode={edgeOffer?.promoCode}
          onBackToStore={() => navigateStorePage('catalog')}
          onCancelCheckout={handleAbandonCheckout}
          onCompleteOrder={handleCompleteCheckoutOrder}
        />
      ) : storePage === 'confirmation' && completedReceipt ? (
        <StorefrontConfirmationPage
          order={completedReceipt}
          onContinueShopping={() => navigateStorePage('catalog')}
        />
      ) : (
      <div className="min-h-full bg-[#F8FAFC] text-[#0F172A] flex flex-col">
      {/* Top Promo Banner */}
      <div className="bg-[#0B2245] text-white text-xs py-2.5 px-4 text-center">
        {edgeOffer ? (
          <div className="inline-flex flex-wrap items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#7DD3FC]" />
            <span className="font-semibold">{edgeOffer.badge}:</span>
            <span className="text-[#E2EEFD]">{edgeOffer.headline}</span>
            {edgeOffer.promoCode && (
              <span className="font-mono font-bold px-2 py-0.5 rounded bg-white/15 text-[#93C5FD]">
                {edgeOffer.promoCode}
              </span>
            )}
          </div>
        ) : (
          <span>Complimentary Express Shipping on Orders Over $250 · 30-Day Hassle-Free Returns · 2-Year Warranty</span>
        )}
      </div>

      {/* Storefront Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => handleCategorySelect('All')}
            className="flex items-center gap-2.5 shrink-0 cursor-pointer text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0F3D82] to-[#1473E6] text-white flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-[#0F172A] block leading-none">
                APEX STORE
              </span>
              <span className="text-[11px] text-[#64748B]">Audio, Workstations &amp; Smart Home</span>
            </div>
          </button>

          <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-lg relative">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search headphones, laptops, servers, smart home..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-[#F1F5F9] border border-transparent focus:bg-white focus:border-[#1473E6] rounded-full focus:outline-none transition-colors"
            />
          </form>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsSignInOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-[#DCE3EE] bg-white hover:border-[#1473E6] text-xs font-semibold text-[#0F172A] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {shopperEmail ? (
                <UserCheck className="w-4 h-4 text-[#1473E6]" />
              ) : (
                <User className="w-4 h-4 text-[#475569]" />
              )}
              <span>{shopperEmail ? shopperName : 'Sign In'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1473E6] hover:bg-[#0D5EC2] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0 tabular-nums"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Cart ({cartItemsCount})</span>
            </button>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="border-t border-[#F1F5F9] bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 overflow-x-auto">
            <div className="flex items-center gap-2">
              {CATEGORIES.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategorySelect(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-[#0F172A] text-white'
                        : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {wishlistSkus.length > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-[#475569] shrink-0 tabular-nums">
                <Heart className="w-3.5 h-3.5 fill-[#1473E6] text-[#1473E6]" />
                {wishlistSkus.length} Saved
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Storefront Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* Flagship Retail Hero Banner */}
        <section className="rounded-3xl bg-gradient-to-br from-[#0B1E3D] via-[#11376F] to-[#1473E6] text-white p-7 sm:p-11 shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9BC4FF]">
              2026 Hardware Collection
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
              Precision Audio &amp; Workstations Built for Performance.
            </h1>
            <p className="text-sm sm:text-base text-[#DCE8FA] leading-relaxed max-w-2xl">
              Discover flagship studio headphones, 128GB unified-memory laptops, and zero-subscription smart home hardware—crafted with anodized titanium and acoustic precision.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => catalogSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="px-5 py-2.5 rounded-full bg-white text-[#0F2A54] hover:bg-[#EFF6FF] text-sm font-semibold transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Shop All Hardware</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleQuickView(STORE_PRODUCTS[0])}
                className="px-5 py-2.5 rounded-full bg-white/12 hover:bg-white/20 text-white border border-white/25 text-sm font-semibold transition-colors cursor-pointer"
              >
                Explore Studio ANC
              </button>
            </div>

            <div className="pt-3 flex flex-wrap items-center gap-6 text-xs text-[#CFE2FC]">
              <span className="inline-flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#7DD3FC]" />
                Free 2-Day Shipping
              </span>
              <span className="inline-flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[#7DD3FC]" />
                30-Day Easy Returns
              </span>
              <span className="inline-flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#7DD3FC]" />
                2-Year Hardware Warranty
              </span>
            </div>
          </div>

          {/* Featured Flagship Card with Real Product Photo */}
          <div className="lg:col-span-5 bg-white text-[#0F172A] rounded-2xl overflow-hidden shadow-xl">
            <div className="h-48 sm:h-52 bg-[#F4F5F7] overflow-hidden relative">
              <img
                src={STORE_PRODUCTS[1].image}
                alt={STORE_PRODUCTS[1].name}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#0B2245] text-white">
                Featured Flagship
              </span>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-[#0F172A]">{STORE_PRODUCTS[1].name}</h2>
                  <p className="text-xs text-[#64748B] mt-0.5">128GB Unified Memory · 2TB NVMe · XDR Display</p>
                </div>
                <span className="text-lg font-bold text-[#0F172A] tabular-nums">$2,499</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAddToCart(STORE_PRODUCTS[1])}
                  className="flex-1 py-2.5 rounded-xl bg-[#1473E6] hover:bg-[#0D5EC2] text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Add to Cart
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickView(STORE_PRODUCTS[1])}
                  className="px-3.5 py-2.5 rounded-xl border border-[#DCE3EE] hover:border-[#1473E6] text-xs font-semibold text-[#334155] cursor-pointer"
                >
                  Specs
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile Search Bar */}
        <form onSubmit={handleSearch} className="md:hidden relative">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#DCE3EE] rounded-xl focus:outline-none focus:border-[#1473E6]"
          />
        </form>

        {/* Catalog Grid */}
        <section ref={catalogSectionRef} className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">
                {selectedCategory === 'All' ? 'All Products' : selectedCategory}
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5 tabular-nums">
                Showing {filteredProducts.length} product{filteredProducts.length === 1 ? '' : 's'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="store-sort" className="text-xs font-medium text-[#64748B]">
                Sort by:
              </label>
              <div className="relative">
                <select
                  id="store-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none bg-white border border-[#DCE3EE] rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#1473E6] cursor-pointer"
                >
                  <option value="featured">Featured</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#64748B] pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center space-y-3">
              <p className="text-base font-semibold text-[#0F172A]">No matching products found</p>
              <p className="text-xs text-[#64748B]">Try clearing your search or choosing another category.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  handleCategorySelect('All');
                }}
                className="px-4 py-2 rounded-lg bg-[#1473E6] text-white text-xs font-semibold cursor-pointer"
              >
                View All Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const isWishlisted = wishlistSkus.includes(product.sku);
                const isJustAdded = addedFeedbackSku === product.sku;
                return (
                  <article
                    key={product.sku}
                    className="group bg-white rounded-2xl border border-[#E2E8F0] hover:border-[#93B8E8] hover:shadow-lg transition-all overflow-hidden flex flex-col"
                  >
                    {/* Studio Product Photo */}
                    <div className="relative h-52 bg-[#F4F4F2] overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        onClick={() => handleQuickView(product)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                      />
                      {product.badge && (
                        <span className="absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white/95 text-[#0F172A] shadow-2xs">
                          {product.badge}
                        </span>
                      )}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleQuickView(product)}
                          title="Quick View & Specs"
                          className="w-8 h-8 rounded-full bg-white/95 hover:bg-white text-[#334155] hover:text-[#1473E6] flex items-center justify-center shadow-xs cursor-pointer transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleWishlistToggle(product)}
                          title="Save to Wishlist"
                          className="w-8 h-8 rounded-full bg-white/95 hover:bg-white text-[#1473E6] flex items-center justify-center shadow-xs cursor-pointer transition-colors"
                        >
                          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#1473E6]' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Product Info & Key Features */}
                    <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-xs text-[#64748B]">
                          <span>{product.category}</span>
                          <span className="inline-flex items-center gap-1 font-semibold text-[#0F172A] tabular-nums">
                            <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                            {product.rating} ({product.reviewsCount})
                          </span>
                        </div>

                        <div>
                          <h3
                            onClick={() => handleQuickView(product)}
                            className="text-base font-bold text-[#0F172A] hover:text-[#1473E6] cursor-pointer leading-snug"
                          >
                            {product.name}
                          </h3>
                          <p className="text-xs text-[#475569] mt-1 leading-relaxed">
                            {product.tagline}
                          </p>
                        </div>

                        {/* Relevant Features List */}
                        <ul className="space-y-1 pt-1">
                          {product.features.map((feat) => (
                            <li key={feat} className="flex items-center gap-2 text-xs text-[#334155]">
                              <Check className="w-3.5 h-3.5 text-[#1473E6] shrink-0" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-3 border-t border-[#F1F5F9] space-y-3">
                        <div className="flex items-center justify-between text-[11px] text-[#059669] font-medium">
                          <span>{product.finish}</span>
                          <span>{product.deliveryNote}</span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="tabular-nums">
                            <span className="text-lg font-bold text-[#0F172A]">
                              ${product.price.toLocaleString()}
                            </span>
                            {product.originalPrice && (
                              <span className="ml-1.5 text-xs text-[#94A3B8] line-through">
                                ${product.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAddToCart(product)}
                            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                              isJustAdded
                                ? 'bg-[#10B981] text-white'
                                : 'bg-[#1473E6] hover:bg-[#0D5EC2] text-white'
                            }`}
                          >
                            {isJustAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span>Add to Cart</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Retail Value Propositions Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#1473E6] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">Fast Tracked Delivery</h3>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Free 2-day insured courier shipping on all orders above $250.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#1473E6] flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">2-Year Hardware Coverage</h3>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Every device includes direct manufacturer support and advance replacement.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#1473E6] flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">Secure Encrypted Checkout</h3>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Encrypted checkout with instant digital receipts and 30-day returns.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Authentic Store Footer */}
      <footer className={`border-t border-[#E2E8F0] bg-white pt-8 px-4 sm:px-6 mt-12 ${cartItemsCount > 0 ? 'pb-28' : 'pb-8'}`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <div className="flex items-center gap-2 font-semibold text-[#0F172A]">
            <ShoppingBag className="w-4 h-4 text-[#1473E6]" />
            <span>Apex Hardware &amp; Audio</span>
          </div>
          <div>© 2026 Apex Hardware Inc. All rights reserved.</div>
          <div>{shopperEmail ? `Signed in as ${shopperEmail}` : 'Shopping as Guest'}</div>
        </div>
      </footer>

      {/* Floating Bottom Cart Bar */}
      {cartItemsCount > 0 && !isCartOpen && storePage === 'catalog' && (
        <div className="fixed bottom-5 inset-x-4 z-40 flex justify-center pointer-events-none">
          <div className="pointer-events-auto max-w-2xl w-full bg-[#0B2245] text-white rounded-2xl border border-[#1E4F96] shadow-[0_20px_45px_-12px_rgba(11,34,69,0.55)] px-5 py-3.5 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-3.5 text-left cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-white/15 ring-1 ring-white/25 flex items-center justify-center shrink-0">
                <ShoppingCart className="w-4.5 h-4.5 text-[#7DD3FC]" />
              </div>
              <div className="tabular-nums">
                <div className="text-sm font-bold text-white group-hover:text-[#93C5FD] transition-colors">
                  {cartItemsCount} {cartItemsCount === 1 ? 'item' : 'items'} in your cart
                </div>
                <div className="text-xs text-[#C8DAF6]">
                  Subtotal: ${cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} · View Cart
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={handleOpenCheckout}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1473E6] hover:bg-[#2584F7] text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Slide-Over Shopping Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-2xs">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#1473E6]" />
                <h2 className="text-base font-bold text-[#0F172A]">Your Shopping Cart ({cartItemsCount})</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {cart.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <ShoppingBag className="w-10 h-10 text-[#CBD5E1] mx-auto" />
                  <p className="text-sm font-semibold text-[#334155]">Your cart is empty</p>
                  <p className="text-xs text-[#64748B]">Explore our headphones, laptops, and smart home hardware to get started.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.sku}
                    className="p-3 rounded-xl border border-[#E2E8F0] bg-[#FAFBFD] flex items-center gap-3"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-14 h-14 rounded-lg object-cover shrink-0 border border-[#E2E8F0]"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-[#0F172A] truncate">{item.product.name}</div>
                      <div className="text-xs text-[#1473E6] font-mono tabular-nums mt-0.5">
                        ${item.product.price.toLocaleString()} × {item.quantity}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(item.product.sku, -1)}
                        className="p-1.5 rounded-lg bg-white border border-[#CBD5E1] hover:bg-[#F1F5F9] cursor-pointer"
                      >
                        {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-[#1473E6]" /> : <Minus className="w-3.5 h-3.5" />}
                      </button>
                      <span className="w-6 text-center text-xs font-mono font-bold tabular-nums">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(item.product.sku, 1)}
                        className="p-1.5 rounded-lg bg-white border border-[#CBD5E1] hover:bg-[#F1F5F9] cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-[#E2E8F0] bg-[#F8FAFC] space-y-4">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-[#475569]">
                    <span>Shipping</span>
                    <span className="font-medium text-[#059669]">Free Express</span>
                  </div>
                  <div className="flex justify-between font-bold text-base text-[#0F172A]">
                    <span>Subtotal</span>
                    <span className="tabular-nums">${cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleOpenCheckout}
                    className="w-full py-3 rounded-xl bg-[#1473E6] hover:bg-[#0D5EC2] text-white text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Proceed to Checkout</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAbandonCheckout}
                    className="w-full py-2.5 rounded-xl bg-white border border-[#CBD5E1] hover:border-[#1473E6] text-[#475569] hover:text-[#1473E6] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Save for Later &amp; Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E2E8F0] shadow-2xl overflow-hidden my-auto">
            <div className="h-60 bg-[#F4F4F2] relative overflow-hidden">
              <button
                type="button"
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white text-[#334155] flex items-center justify-center shadow-sm cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <img
                src={quickViewProduct.image}
                alt={quickViewProduct.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-6 space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs text-[#1473E6] font-semibold">
                  <span>{quickViewProduct.category} · {quickViewProduct.finish}</span>
                  <span className="inline-flex items-center gap-1 text-[#0F172A] tabular-nums">
                    <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                    {quickViewProduct.rating} ({quickViewProduct.reviewsCount} reviews)
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] mt-1">{quickViewProduct.name}</h3>
                <p className="text-sm text-[#475569] mt-2 leading-relaxed">{quickViewProduct.tagline}</p>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-[#64748B] mb-2">
                  Key Features &amp; Specifications
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickViewProduct.specs.map((spec) => (
                    <span
                      key={spec}
                      className="text-xs px-2.5 py-1 rounded-lg bg-[#F1F5F9] text-[#334155] font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-[#0F172A] tabular-nums">
                    ${quickViewProduct.price.toLocaleString()}
                  </span>
                  <div className="text-xs text-[#059669] font-medium">{quickViewProduct.deliveryNote}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleAddToCart(quickViewProduct);
                    setQuickViewProduct(null);
                    setIsCartOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#1473E6] hover:bg-[#0D5EC2] text-white text-sm font-semibold cursor-pointer inline-flex items-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account Sign-In / Switch Customer Modal */}
      {isSignInOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E2E8F0] shadow-2xl p-6 space-y-5 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-base font-bold text-[#0F172A]">Sign In to Apex Store</h3>
              <button
                type="button"
                onClick={() => setIsSignInOpen(false)}
                className="text-[#64748B] hover:text-[#0F172A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {shopperEmail && (
              <div className="p-3.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#0F172A]">{shopperName}</div>
                  <div className="text-xs font-mono text-[#1473E6]">{shopperEmail}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleSignOutGuest();
                    setIsSignInOpen(false);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-xs font-semibold text-[#334155] hover:border-[#1473E6] cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}

            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                Express Account Sign-In
              </span>
              {PRESET_SHOPPERS.map((p) => (
                <button
                  key={p.email}
                  type="button"
                  onClick={() => handleSignInCustomer(p)}
                  className="w-full p-3 rounded-xl border border-[#E2E8F0] hover:border-[#1473E6] hover:bg-[#F8FAFF] text-left flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div>
                    <div className="text-sm font-semibold text-[#0F172A]">{p.label}</div>
                    <div className="text-xs font-mono text-[#1473E6]">{p.email}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#1473E6]" />
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!customEmailInput.trim()) return;
                const parts = customNameInput.trim().split(' ');
                handleSignInCustomer({
                  email: customEmailInput,
                  firstName: parts[0] || customEmailInput.split('@')[0],
                  lastName: parts.slice(1).join(' ')
                });
              }}
              className="pt-4 border-t border-[#E2E8F0] space-y-2.5"
            >
              <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wide block">
                Or Continue With Email
              </span>
              <input
                type="text"
                placeholder="Full Name"
                value={customNameInput}
                onChange={(e) => setCustomNameInput(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#1473E6]"
              />
              <input
                type="email"
                required
                placeholder="Email address"
                value={customEmailInput}
                onChange={(e) => setCustomEmailInput(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#1473E6]"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-[#1473E6] hover:bg-[#0D5EC2] text-white text-xs font-semibold cursor-pointer"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      )}
      </div>
      )}
    </div>
  );
};
