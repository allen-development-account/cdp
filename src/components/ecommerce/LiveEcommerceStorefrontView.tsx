import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useCDP } from '../../context/CDPContext';
import { PageBackButton } from '../common/PageBackButton';
import {
  ShoppingBag,
  ShoppingCart,
  Search,
  Heart,
  UserCheck,
  User,
  Sparkles,
  Zap,
  Radio,
  Database,
  ArrowRight,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  CreditCard,
  Eye,
  Tag,
  ShieldCheck,
  Layers,
  Activity,
  X,
  LogOut,
  Package
} from 'lucide-react';

interface StoreProduct {
  sku: string;
  name: string;
  category: 'Audio & Wearables' | 'Workstations' | 'Cloud Hardware' | 'Smart Home';
  price: number;
  badge: string;
  rating: string;
  tagline: string;
  specs: string[];
}

interface CartItem {
  product: StoreProduct;
  quantity: number;
}

interface StreamReceipt {
  id: string;
  timestamp: string;
  eventType: string;
  summary: string;
  latencyMs: number;
  profileId: string;
  isMerged: boolean;
  databricksSynced: boolean;
  payloadPreview: Record<string, any>;
}

const STORE_PRODUCTS: StoreProduct[] = [
  {
    sku: 'XLR8-AUDIO-PRO9',
    name: 'Apex Studio ANC Headphones',
    category: 'Audio & Wearables',
    price: 349.00,
    badge: 'Best Seller',
    rating: '4.9 (412)',
    tagline: 'Spatial lossless audio with 48-hour adaptive noise cancellation.',
    specs: ['Bluetooth 5.4 Lossless', '48h Battery', 'Titanium Drivers']
  },
  {
    sku: 'XLR8-WORK-M4MAX',
    name: 'QuantumBook Pro 16" Workstation',
    category: 'Workstations',
    price: 2499.00,
    badge: 'Flagship',
    rating: '4.9 (289)',
    tagline: '128GB unified memory mobile compute workstation built for ML & Spark.',
    specs: ['16-Core Neural Engine', '2TB NVMe Gen5', '120Hz XDR Display']
  },
  {
    sku: 'XLR8-CLOUD-NODE8',
    name: 'EdgeCluster Rack Server 8X',
    category: 'Cloud Hardware',
    price: 1420.00,
    badge: 'Enterprise',
    rating: '4.8 (164)',
    tagline: 'Compact rackmount inference appliance with dual 25GbE fiber uplinks.',
    specs: ['Dual 25GbE SFP28', 'ECC DDR5 192GB', 'Zero-Touch Provisioning']
  },
  {
    sku: 'XLR8-WEAR-CHRONO',
    name: 'Pulse Titanium Smart Watch',
    category: 'Audio & Wearables',
    price: 499.00,
    badge: 'New Release',
    rating: '4.7 (198)',
    tagline: 'Aerospace titanium wearable with continuous biometric telemetry.',
    specs: ['Sapphire Glass', 'Dual-Band GPS', '14-Day Power']
  },
  {
    sku: 'XLR8-HOME-MESH7',
    name: 'OmniFi Wi-Fi 7 Tri-Band Mesh',
    category: 'Smart Home',
    price: 599.00,
    badge: 'Top Rated',
    rating: '4.8 (327)',
    tagline: 'Ultra-low latency 10Gbps wireless fabric for connected homes & studios.',
    specs: ['320MHz Channels', '10G WAN/LAN', '6,500 sq ft Coverage']
  },
  {
    sku: 'XLR8-WORK-DOCK',
    name: 'Thunderbolt 5 Studio Dock',
    category: 'Workstations',
    price: 289.00,
    badge: 'Accessory',
    rating: '4.9 (510)',
    tagline: 'Single-cable 140W host charging with triple 6K display output.',
    specs: ['120Gbps Bandwidth', '2.5Gb Ethernet', 'SD UHS-II Reader']
  }
];

const CATEGORIES = ['All', 'Audio & Wearables', 'Workstations', 'Cloud Hardware', 'Smart Home'] as const;

const PRESET_SHOPPERS = [
  { label: 'Elena Rostova (CloudScale)', email: 'elena.rostova@cloudscale.io', firstName: 'Elena', lastName: 'Rostova', city: 'San Francisco' },
  { label: 'Marcus Vance (VanceMedia)', email: 'marcus.vance@vancemedia.io', firstName: 'Marcus', lastName: 'Vance', city: 'New York' },
  { label: 'Sophia Tanaka (DesignStudios)', email: 'sophia.tanaka@designstudios.jp', firstName: 'Sophia', lastName: 'Tanaka', city: 'Seattle' }
];

function getOrCreateStoreECID(): string {
  try {
    const existing = localStorage.getItem('xlr8_ecid');
    if (existing) return existing;
    const created = `ecid_store_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem('xlr8_ecid', created);
    return created;
  } catch {
    return `ecid_store_${Date.now().toString(36)}`;
  }
}

export const LiveEcommerceStorefrontView: React.FC = () => {
  const {
    streamEcommerceEvent,
    databricksStatus,
    setActiveTab,
    setSelectedProfileId,
    profiles,
    isLiveStreamConnected,
    liveWebSocketPingMs
  } = useCDP();

  const [ecid, setEcid] = useState<string>(() => getOrCreateStoreECID());
  const [shopperEmail, setShopperEmail] = useState<string>('');
  const [shopperName, setShopperName] = useState<string>('Guest Shopper');
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [customEmailInput, setCustomEmailInput] = useState('');
  const [customNameInput, setCustomNameInput] = useState('');

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [quickViewProduct, setQuickViewProduct] = useState<StoreProduct | null>(null);
  const [wishlistSkus, setWishlistSkus] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutSuccessOrder, setCheckoutSuccessOrder] = useState<{ orderId: string; total: number } | null>(null);
  const [abandonNotice, setAbandonNotice] = useState<string | null>(null);

  // Idle abandonment countdown timer (seconds remaining before auto-emit CartAbandoned)
  const [autoAbandonEnabled, setAutoAbandonEnabled] = useState<boolean>(true);
  const [abandonSecondsLeft, setAbandonSecondsLeft] = useState<number | null>(null);
  const abandonEmittedForCurrentCartRef = useRef<boolean>(false);

  // Live Edge Decisioning offer
  const [edgeOffer, setEdgeOffer] = useState<{ headline: string; badge: string; promoCode?: string } | null>(null);

  // Stream Receipts HUD
  const [receipts, setReceipts] = useState<StreamReceipt[]>([]);
  const [lastProfileId, setLastProfileId] = useState<string | null>(null);

  const cartTotal = Number(cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(2));
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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
          badge: decision.selectedOffer.badge || 'Edge Real-Time Offer',
          promoCode: decision.selectedOffer.promoCode
        });
      }
    } catch {
      // ignore
    }
  }, []);

  const emitStoreEvent = useCallback(async (
    eventType: string,
    summary: string,
    extraPayload: Record<string, any> = {},
    overrideIdentity?: { email?: string; fullName?: string; firstName?: string; lastName?: string; city?: string }
  ) => {
    const emailToSend = overrideIdentity?.email !== undefined ? overrideIdentity.email : shopperEmail;
    const payload: Record<string, any> = {
      event_name: eventType,
      anon_cookie_id: ecid,
      ...(emailToSend ? { customer_email: emailToSend } : {}),
      ...(overrideIdentity?.fullName ? { fullName: overrideIdentity.fullName } : {}),
      ...(overrideIdentity?.firstName ? { firstName: overrideIdentity.firstName } : {}),
      ...(overrideIdentity?.lastName ? { lastName: overrideIdentity.lastName } : {}),
      ...(overrideIdentity?.city ? { city: overrideIdentity.city } : {}),
      page_url: `https://apex-store.xlr8.io/shop/${selectedCategory.toLowerCase().replace(/\s+/g, '-')}`,
      storefront_app: 'XLR8 Apex Commerce',
      ...extraPayload
    };

    try {
      const ack = await streamEcommerceEvent(payload);
      if (ack?.profileId) {
        setLastProfileId(ack.profileId);
      }
      const receipt: StreamReceipt = {
        id: `rcpt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`,
        timestamp: new Date().toLocaleTimeString(),
        eventType,
        summary,
        latencyMs: ack?.latencyMs ?? 2.4,
        profileId: ack?.profileId || 'pending',
        isMerged: Boolean(ack?.isMerged),
        databricksSynced: Boolean(ack?.databricksSynced ?? true),
        payloadPreview: payload
      };
      setReceipts((prev) => [receipt, ...prev].slice(0, 18));
      fetchEdgeOffer(ecid, emailToSend);
    } catch {
      // ignore network interruption
    }
  }, [ecid, shopperEmail, selectedCategory, streamEcommerceEvent, fetchEdgeOffer]);

  // Emit initial PageView when entering storefront
  const didMountPageView = useRef(false);
  useEffect(() => {
    if (!didMountPageView.current) {
      didMountPageView.current = true;
      emitStoreEvent('PageView', 'Landed on XLR8 Apex Storefront', {
        cart_total: 0,
        cart_items_count: 0
      });
    }
  }, [emitStoreEvent]);

  // Cart abandonment countdown effect
  useEffect(() => {
    if (!autoAbandonEnabled || cart.length === 0 || isCheckoutOpen) {
      setAbandonSecondsLeft(null);
      return;
    }

    if (abandonEmittedForCurrentCartRef.current) {
      return;
    }

    setAbandonSecondsLeft(20);
    const interval = setInterval(() => {
      setAbandonSecondsLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(interval);
          if (!abandonEmittedForCurrentCartRef.current && cart.length > 0) {
            abandonEmittedForCurrentCartRef.current = true;
            const totalNow = Number(cart.reduce((s, i) => s + i.product.price * i.quantity, 0).toFixed(2));
            const countNow = cart.reduce((s, i) => s + i.quantity, 0);
            emitStoreEvent('CartAbandoned', `Idle timeout: abandoned $${totalNow.toLocaleString()} cart`, {
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
            setAbandonNotice(`CartAbandoned event streamed ($${totalNow.toLocaleString()}) -> CDP Profile & Databricks Gold Cart Mart`);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoAbandonEnabled, cart, isCheckoutOpen, emitStoreEvent]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    emitStoreEvent('PageView', `Browsed category: ${cat}`, {
      category: cat,
      cart_total: cartTotal,
      cart_items_count: cartItemsCount
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    emitStoreEvent('Search', `Searched catalog for "${searchQuery.trim()}"`, {
      search_query: searchQuery.trim(),
      cart_total: cartTotal,
      cart_items_count: cartItemsCount
    });
  };

  const handleQuickView = (product: StoreProduct) => {
    setQuickViewProduct(product);
    emitStoreEvent('ProductView', `Viewed ${product.name} ($${product.price})`, {
      sku: product.sku,
      product_name: product.name,
      category: product.category,
      unit_price: product.price,
      cart_total: cartTotal,
      cart_items_count: cartItemsCount
    });
  };

  const handleToggleWishlist = (product: StoreProduct) => {
    const exists = wishlistSkus.includes(product.sku);
    setWishlistSkus((prev) => exists ? prev.filter((s) => s !== product.sku) : [...prev, product.sku]);
    if (!exists) {
      emitStoreEvent('WishlistAdd', `Saved ${product.name} to wishlist`, {
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
    abandonEmittedForCurrentCartRef.current = false;
    setAbandonNotice(null);
    setCheckoutSuccessOrder(null);

    const existing = cart.find((c) => c.product.sku === product.sku);
    const nextCart = existing
      ? cart.map((c) => c.product.sku === product.sku ? { ...c, quantity: c.quantity + 1 } : c)
      : [...cart, { product, quantity: 1 }];

    setCart(nextCart);
    const nextTotal = Number(nextCart.reduce((s, i) => s + i.product.price * i.quantity, 0).toFixed(2));
    const nextCount = nextCart.reduce((s, i) => s + i.quantity, 0);

    emitStoreEvent('AddToCart', `Added ${product.name} ($${product.price}) to cart`, {
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

    abandonEmittedForCurrentCartRef.current = false;
    setAbandonNotice(null);

    const nextCart = cart
      .map((c) => c.product.sku === sku ? { ...c, quantity: c.quantity + delta } : c)
      .filter((c) => c.quantity > 0);
    setCart(nextCart);

    const nextTotal = Number(nextCart.reduce((s, i) => s + i.product.price * i.quantity, 0).toFixed(2));
    const nextCount = nextCart.reduce((s, i) => s + i.quantity, 0);

    if (delta < 0) {
      emitStoreEvent('RemoveFromCart', `Removed ${target.product.name} from cart`, {
        sku: target.product.sku,
        product_name: target.product.name,
        category: target.product.category,
        unit_price: target.product.price,
        quantity: Math.abs(delta),
        cart_total: nextTotal,
        cart_items_count: nextCount
      });
    } else {
      emitStoreEvent('AddToCart', `Increased qty of ${target.product.name}`, {
        sku: target.product.sku,
        product_name: target.product.name,
        category: target.product.category,
        unit_price: target.product.price,
        quantity: delta,
        cart_total: nextTotal,
        cart_items_count: nextCount
      });
    }
  };

  const handleTriggerExplicitAbandon = () => {
    if (cart.length === 0) return;
    abandonEmittedForCurrentCartRef.current = true;
    setAbandonSecondsLeft(0);
    setIsCheckoutOpen(false);
    emitStoreEvent('CartAbandoned', `Shopper exited with $${cartTotal.toLocaleString()} cart`, {
      cart_total: cartTotal,
      cart_items_count: cartItemsCount,
      abandon_reason: 'explicit_exit_intent',
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
    setAbandonNotice(`CartAbandoned streamed ($${cartTotal.toLocaleString()}) -> Shopper entered Cart Recovery funnel & Databricks Gold Mart`);
  };

  const handleStartCheckout = () => {
    if (cart.length === 0) return;
    setIsCheckoutOpen(true);
    setAbandonNotice(null);
    emitStoreEvent('CheckoutStarted', `Started checkout ($${cartTotal.toLocaleString()})`, {
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

  const handleCompletePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const purchasedTotal = cartTotal;
    const purchasedItems = [...cart];

    emitStoreEvent('Purchase', `Order ${orderId} completed ($${purchasedTotal.toLocaleString()})`, {
      transaction_id: orderId,
      total_amount: purchasedTotal,
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
    });

    setCart([]);
    setIsCheckoutOpen(false);
    setAbandonNotice(null);
    abandonEmittedForCurrentCartRef.current = false;
    setCheckoutSuccessOrder({ orderId, total: purchasedTotal });
  };

  const handleSignInShopper = (preset: { email: string; firstName: string; lastName: string; city?: string }) => {
    const cleanEmail = preset.email.trim().toLowerCase();
    const fullName = `${preset.firstName} ${preset.lastName || ''}`.trim();
    setShopperEmail(cleanEmail);
    setShopperName(fullName || cleanEmail.split('@')[0]);
    setIsSignInOpen(false);
    emitStoreEvent(
      'Identify',
      `Stitched ECID ${ecid} -> ${cleanEmail}`,
      {
        cart_total: cartTotal,
        cart_items_count: cartItemsCount
      },
      {
        email: cleanEmail,
        fullName,
        firstName: preset.firstName,
        lastName: preset.lastName,
        city: preset.city || 'San Francisco'
      }
    );
  };

  const handleNewAnonymousSession = () => {
    const newEcid = `ecid_store_${Math.random().toString(36).slice(2, 8)}`;
    try {
      localStorage.setItem('xlr8_ecid', newEcid);
    } catch {
      // ignore
    }
    setEcid(newEcid);
    setShopperEmail('');
    setShopperName('Guest Shopper');
    setCart([]);
    setAbandonNotice(null);
    setCheckoutSuccessOrder(null);
    abandonEmittedForCurrentCartRef.current = false;
    emitStoreEvent('PageView', `Started fresh anonymous session (${newEcid})`, {
      cart_total: 0,
      cart_items_count: 0
    }, { email: '' });
  };

  const filteredProducts = STORE_PRODUCTS.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const activeProfile = profiles.find((p) => p.id === lastProfileId);

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto overflow-y-auto h-full text-[#1E2229]">
      <PageBackButton />

      {/* Top Hero Strip */}
      <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white rounded-xl border border-[#0E4DA4] p-5 shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0 shadow-xs">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-white">XLR8 Apex Storefront — Live Real-Time Stream</h2>
              <span className="inline-flex items-center space-x-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/15 border border-white/25 text-sky-100">
                <span className={`w-1.5 h-1.5 rounded-full ${isLiveStreamConnected ? 'bg-[#38BDF8] animate-pulse' : 'bg-sky-300'}`} />
                <span>{isLiveStreamConnected ? `Streaming Live (${liveWebSocketPingMs}ms)` : 'HTTP Collect Active'}</span>
              </span>
            </div>
            <p className="text-xs text-blue-100 mt-1 max-w-2xl">
              Every click, search, cart addition, abandonment, and order below streams live via <span className="font-mono text-white">POST /api/v1/collect</span> into Customer 360 Identity Resolution and Databricks Delta tables.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('databricks_warehouse')}
            className="px-3.5 py-2 bg-white text-[#0D66D0] hover:bg-[#F2F7FE] font-bold text-xs rounded-lg shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Database className="w-4 h-4 text-[#1473E6]" />
            <span>Open Databricks Lakehouse</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {lastProfileId && (
            <button
              onClick={() => {
                setSelectedProfileId(lastProfileId);
                setActiveTab('profiles');
              }}
              className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white font-semibold text-xs rounded-lg border border-white/25 transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-sky-200" />
              <span>Inspect Stitched Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout: Interactive Storefront (Left 8 cols) + Live Stream & Databricks HUD (Right 4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* LEFT: Live E-Commerce Storefront */}
        <div className="xl:col-span-8 bg-white rounded-xl border border-[#E1E5EA] shadow-xs overflow-hidden">
          {/* Storefront Header Bar */}
          <div className="px-5 py-3.5 bg-[#F8FAFC] border-b border-[#E1E5EA] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#38BDF8] to-[#1473E6] flex items-center justify-center text-white shadow-2xs">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#1E2229] flex items-center gap-2">
                  <span>APEX HARDWARE &amp; AUDIO</span>
                  <span className="text-[10px] font-mono bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD] px-2 py-0.5 rounded">
                    Web SDK Active
                  </span>
                </div>
                <div className="text-[11px] text-[#475569] font-mono">
                  ECID: <span className="text-[#1473E6] font-semibold">{ecid}</span>
                  {shopperEmail && (
                    <> · Stitched: <span className="text-[#0369A1] font-semibold">{shopperEmail}</span></>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSignInOpen(true)}
                className="px-3 py-1.5 bg-white hover:bg-[#F2F7FE] border border-[#D0D7DE] rounded-lg text-xs font-semibold text-[#1E2229] flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                {shopperEmail ? <UserCheck className="w-3.5 h-3.5 text-[#1473E6]" /> : <User className="w-3.5 h-3.5 text-[#0284C7]" />}
                <span>{shopperEmail ? shopperName : 'Sign In / Stitch Identity'}</span>
              </button>

              <button
                onClick={handleNewAnonymousSession}
                title="Start new anonymous browser cookie session"
                className="px-2.5 py-1.5 bg-white hover:bg-[#F2F4F7] border border-[#D0D7DE] rounded-lg text-[11px] font-semibold text-[#475569] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 text-[#1473E6]" />
                <span>New Session</span>
              </button>
            </div>
          </div>

          {/* Real-Time Edge Personalization Banner */}
          {edgeOffer && (
            <div className="px-5 py-2.5 bg-gradient-to-r from-[#EFF6FF] to-[#E0F2FE] border-b border-[#BFDBFE] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#1473E6] shrink-0" />
                <span className="font-bold text-[#0A3D82]">{edgeOffer.badge}:</span>
                <span className="text-[#1E2229] font-medium">{edgeOffer.headline}</span>
              </div>
              {edgeOffer.promoCode && (
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-white text-[#1473E6] border border-[#BFDBFE]">
                  CODE: {edgeOffer.promoCode}
                </span>
              )}
            </div>
          )}

          {/* Abandonment or Order Success Alerts */}
          {abandonNotice && (
            <div className="mx-5 mt-4 p-3 rounded-lg bg-[#EFF6FF] border border-[#93C5FD] flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2.5">
                <AlertTriangle className="w-4 h-4 text-[#1473E6] shrink-0" />
                <span className="font-semibold text-[#0A3D82]">{abandonNotice}</span>
              </div>
              <button
                onClick={() => setActiveTab('databricks_warehouse')}
                className="text-[11px] font-bold text-[#1473E6] hover:underline shrink-0 cursor-pointer"
              >
                Verify in Databricks →
              </button>
            </div>
          )}

          {checkoutSuccessOrder && (
            <div className="mx-5 mt-4 p-3 rounded-lg bg-[#E0F2FE] border border-[#7DD3FC] flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#0284C7] shrink-0" />
                <span className="font-semibold text-[#0A3D82]">
                  Order {checkoutSuccessOrder.orderId} confirmed (${checkoutSuccessOrder.total.toLocaleString()}) — streamed Purchase event to CDP &amp; Databricks!
                </span>
              </div>
              <button
                onClick={() => setCheckoutSuccessOrder(null)}
                className="text-[#0369A1] font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Search & Category Filter Bar */}
          <div className="p-5 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#1473E6] text-white shadow-2xs'
                      : 'bg-[#F2F4F7] text-[#1E2229] hover:bg-[#E1E5EA]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#1473E6] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog (Enter streams)..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#D0D7DE] rounded-lg focus:outline-none focus:border-[#1473E6]"
              />
            </form>
          </div>

          {/* Product Grid + Cart Section */}
          <div className="p-5 pt-2 grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Catalog Grid */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredProducts.map((product) => {
                const isWishlisted = wishlistSkus.includes(product.sku);
                return (
                  <div
                    key={product.sku}
                    className="rounded-xl border border-[#E1E5EA] bg-white hover:border-[#1473E6] hover:shadow-sm transition-all p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
                          {product.badge}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleQuickView(product)}
                            title="Product Quick View (Emits ProductView)"
                            className="p-1.5 rounded-lg hover:bg-[#EFF6FF] text-[#1473E6] cursor-pointer transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleWishlist(product)}
                            title="Add to Wishlist (Emits WishlistAdd)"
                            className="p-1.5 rounded-lg hover:bg-[#EFF6FF] text-[#1473E6] cursor-pointer transition-colors"
                          >
                            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-[#1473E6]' : ''}`} />
                          </button>
                        </div>
                      </div>

                      <div className="text-[10px] font-mono text-[#64748B] mb-0.5">{product.category} · {product.sku}</div>
                      <h4 className="text-sm font-bold text-[#1E2229] leading-snug">{product.name}</h4>
                      <p className="text-[11px] text-[#475569] mt-1 leading-relaxed">{product.tagline}</p>

                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {product.specs.map((spec) => (
                          <span key={spec} className="text-[10px] px-1.5 py-0.5 bg-[#F8FAFC] border border-[#E1E5EA] rounded text-[#334155]">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#E1E5EA] flex items-center justify-between gap-2">
                      <div>
                        <span className="text-base font-bold font-mono text-[#0A3D82]">${product.price.toLocaleString()}</span>
                        <span className="block text-[10px] text-[#64748B]">★ {product.rating}</span>
                      </div>

                      <button
                        onClick={() => handleAddToCart(product)}
                        className="px-3 py-1.5 bg-gradient-to-r from-[#1473E6] to-[#0D66D0] hover:from-[#0D66D0] hover:to-[#0A3D82] text-white font-bold text-xs rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Shopping Cart & Cart Abandonment Panel */}
            <div className="lg:col-span-5 bg-[#F8FAFC] rounded-xl border border-[#D0D7DE] p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#E1E5EA]">
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="w-4 h-4 text-[#1473E6]" />
                    <h3 className="text-sm font-bold text-[#1E2229]">Active Cart ({cartItemsCount})</h3>
                  </div>
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[#334155] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoAbandonEnabled}
                      onChange={(e) => setAutoAbandonEnabled(e.target.checked)}
                      className="accent-[#1473E6]"
                    />
                    <span>Auto-Abandon (20s)</span>
                  </label>
                </div>

                {abandonSecondsLeft !== null && abandonSecondsLeft > 0 && cart.length > 0 && (
                  <div className="mt-3 px-3 py-2 rounded-lg bg-[#E0F2FE] border border-[#BAE6FD] flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-[#0369A1] font-semibold">
                      <Clock className="w-3.5 h-3.5 text-[#0284C7]" />
                      <span>Idle abandonment trigger in:</span>
                    </div>
                    <span className="font-mono font-bold text-[#0A3D82]">{abandonSecondsLeft}s</span>
                  </div>
                )}

                {cart.length === 0 ? (
                  <div className="py-10 text-center space-y-2">
                    <ShoppingBag className="w-8 h-8 text-[#93C5FD] mx-auto" />
                    <p className="text-xs font-semibold text-[#475569]">Your storefront cart is empty</p>
                    <p className="text-[11px] text-[#64748B]">Click &ldquo;Add to Cart&rdquo; on any product to start streaming cart telemetry.</p>
                  </div>
                ) : (
                  <div className="mt-3 space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div key={item.product.sku} className="p-2.5 bg-white rounded-lg border border-[#E1E5EA] flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#1E2229] truncate">{item.product.name}</div>
                          <div className="text-[11px] font-mono text-[#1473E6]">
                            ${item.product.price.toLocaleString()} × {item.quantity}
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            onClick={() => handleUpdateQty(item.product.sku, -1)}
                            className="p-1 rounded border border-[#D0D7DE] hover:bg-[#F2F4F7] text-[#1E2229] cursor-pointer"
                            title="Decrease / RemoveFromCart"
                          >
                            {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-[#1473E6]" /> : <Minus className="w-3 h-3" />}
                          </button>
                          <span className="w-5 text-center text-xs font-mono font-bold">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQty(item.product.sku, 1)}
                            className="p-1 rounded border border-[#D0D7DE] hover:bg-[#F2F4F7] text-[#1E2229] cursor-pointer"
                            title="Increase / AddToCart"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#E1E5EA] space-y-2.5">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span className="text-[#475569]">Cart Subtotal</span>
                  <span className="font-mono text-[#0A3D82]">${cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <button
                    disabled={cart.length === 0}
                    onClick={handleStartCheckout}
                    className="w-full py-2 px-3 bg-gradient-to-r from-[#1473E6] to-[#0F58B8] hover:from-[#0F58B8] hover:to-[#0A3D82] disabled:opacity-45 text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Proceed to Checkout ({cartItemsCount})</span>
                  </button>

                  <button
                    disabled={cart.length === 0}
                    onClick={handleTriggerExplicitAbandon}
                    className="w-full py-2 px-3 bg-white hover:bg-[#EFF6FF] disabled:opacity-45 text-[#0D66D0] border border-[#93C5FD] font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-[#1473E6]" />
                    <span>Simulate Abandon Cart &amp; Exit</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Real-Time Stream & Databricks Lakehouse Live HUD */}
        <div className="xl:col-span-4 space-y-4">
          {/* Stitched Profile + Databricks Delta Counters */}
          <div className="bg-white rounded-xl border border-[#B3D4FA] shadow-xs overflow-hidden">
            <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-sky-200" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Databricks Delta Sync HUD</h3>
              </div>
              <span className="text-[10px] font-mono bg-white/15 px-2 py-0.5 rounded border border-white/25">
                {databricksStatus?.mode === 'live_cloud' ? 'Live Cloud SQL' : 'Delta Lakehouse'}
              </span>
            </div>

            <div className="p-4 space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E1E5EA]">
                  <span className="text-[10px] font-bold text-[#475569] block">Bronze Events</span>
                  <span className="text-base font-mono font-bold text-[#1473E6]">
                    {(databricksStatus?.totalEventsStreamed ?? 0).toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E1E5EA]">
                  <span className="text-[10px] font-bold text-[#475569] block">Silver Profiles</span>
                  <span className="text-base font-mono font-bold text-[#0284C7]">
                    {(databricksStatus?.totalProfilesMerged ?? 0).toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E1E5EA]">
                  <span className="text-[10px] font-bold text-[#475569] block">Abandoned</span>
                  <span className="text-base font-mono font-bold text-[#0A3D82]">
                    {(databricksStatus?.totalCartAbandonments ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {activeProfile && (
                <div className="p-3 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0A3D82] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#1473E6]" />
                      <span>Unified Profile: {activeProfile.unifiedName}</span>
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-[#1473E6] border border-[#BFDBFE]">
                      {activeProfile.attributes.customerTier}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#334155] flex flex-wrap gap-x-3 gap-y-0.5 font-mono">
                    <span>Spend: ${activeProfile.attributes.totalSpend.toLocaleString()}</span>
                    <span>Cart: ${(activeProfile.attributes.activeCartValue || 0).toLocaleString()}</span>
                    <span>Identities: {activeProfile.identities.length}</span>
                  </div>
                  <div className="text-[10px] text-[#0369A1] font-semibold">
                    Next Best Action: {activeProfile.predictions.nextBestAction}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('databricks_warehouse')}
                  className="flex-1 py-1.5 px-3 bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Query Delta Tables</span>
                </button>
                <button
                  onClick={() => setActiveTab('ingestion')}
                  className="flex-1 py-1.5 px-3 bg-[#F2F4F7] hover:bg-[#E1E5EA] text-[#1E2229] border border-[#D0D7DE] text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Radio className="w-3.5 h-3.5 text-[#1473E6]" />
                  <span>Ingestion Stream</span>
                </button>
              </div>
            </div>
          </div>

          {/* Live Event Stream Feed */}
          <div className="bg-white rounded-xl border border-[#E1E5EA] shadow-xs overflow-hidden">
            <div className="px-4 py-3 bg-[#F8FAFC] border-b border-[#E1E5EA] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-[#1473E6]" />
                <h3 className="text-xs font-bold text-[#1E2229]">Live /api/v1/collect Stream</h3>
              </div>
              <span className="text-[10px] font-mono text-[#0369A1] bg-[#E0F2FE] px-2 py-0.5 rounded border border-[#BAE6FD]">
                {receipts.length} emitted
              </span>
            </div>

            <div className="divide-y divide-[#E1E5EA] max-h-[420px] overflow-y-auto">
              {receipts.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#64748B]">
                  Waiting for storefront interactions...
                </div>
              ) : (
                receipts.map((rcpt) => (
                  <div key={rcpt.id} className="p-3 hover:bg-[#F8FAFC] transition-colors space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0A3D82] bg-[#E0F2FE] border border-[#BAE6FD] px-2 py-0.5 rounded">
                        <Zap className="w-3 h-3 text-[#1473E6]" />
                        {rcpt.eventType}
                      </span>
                      <span className="text-[10px] font-mono text-[#64748B]">
                        {rcpt.latencyMs}ms · {rcpt.timestamp}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-[#1E2229]">{rcpt.summary}</p>
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#475569]">
                      <span>Profile: {rcpt.profileId}</span>
                      <span className="text-[#0284C7] font-bold">
                        {rcpt.isMerged ? 'Identity Merged · ' : ''}Delta Synced ✓
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sign In / Identity Stitching Modal */}
      {isSignInOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full border border-[#E1E5EA] shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E1E5EA]">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#1473E6]" />
                <h3 className="text-base font-bold text-[#1E2229]">Sign In &amp; Stitch Web ECID</h3>
              </div>
              <button onClick={() => setIsSignInOpen(false)} className="text-[#475569] hover:text-[#1E2229] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#475569]">
              Signing in sends an <span className="font-mono text-[#1473E6]">Identify</span> event linking anonymous cookie <span className="font-mono">{ecid}</span> to a unified Customer 360 profile.
            </p>

            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase text-[#64748B]">Quick Customer Profiles</span>
              {PRESET_SHOPPERS.map((p) => (
                <button
                  key={p.email}
                  onClick={() => handleSignInShopper(p)}
                  className="w-full p-2.5 text-left rounded-lg border border-[#E1E5EA] hover:border-[#1473E6] hover:bg-[#EFF6FF] transition-all flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-bold text-[#1E2229]">{p.label}</div>
                    <div className="text-[11px] font-mono text-[#1473E6]">{p.email}</div>
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
                handleSignInShopper({
                  email: customEmailInput,
                  firstName: parts[0] || customEmailInput.split('@')[0],
                  lastName: parts.slice(1).join(' ')
                });
              }}
              className="pt-3 border-t border-[#E1E5EA] space-y-2.5"
            >
              <span className="text-[11px] font-bold uppercase text-[#64748B] block">Or Sign In With Custom Email</span>
              <input
                type="text"
                placeholder="Full Name (e.g. Jordan Lee)"
                value={customNameInput}
                onChange={(e) => setCustomNameInput(e.target.value)}
                className="w-full p-2 text-xs border border-[#D0D7DE] rounded-lg focus:outline-none focus:border-[#1473E6]"
              />
              <input
                type="email"
                required
                placeholder="Email (e.g. jordan.lee@acme.io)"
                value={customEmailInput}
                onChange={(e) => setCustomEmailInput(e.target.value)}
                className="w-full p-2 text-xs border border-[#D0D7DE] rounded-lg focus:outline-none focus:border-[#1473E6]"
              />
              <button
                type="submit"
                className="w-full py-2 bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Authenticate &amp; Stitch Identity
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full border border-[#E1E5EA] shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E1E5EA]">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#1473E6]" />
                <h3 className="text-base font-bold text-[#1E2229]">Express Storefront Checkout</h3>
              </div>
              <button onClick={() => setIsCheckoutOpen(false)} className="text-[#475569] hover:text-[#1E2229] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E1E5EA] space-y-1.5 text-xs">
              {cart.map((item) => (
                <div key={item.product.sku} className="flex justify-between">
                  <span className="text-[#1E2229]">{item.product.name} × {item.quantity}</span>
                  <span className="font-mono font-semibold">${(item.product.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-[#E1E5EA] flex justify-between font-bold text-sm text-[#0A3D82]">
                <span>Order Total</span>
                <span className="font-mono">${cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <form onSubmit={handleCompletePurchase} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#1E2229] mb-1">Shopper Email (Receipt &amp; Identity)</label>
                <input
                  type="email"
                  value={shopperEmail}
                  onChange={(e) => setShopperEmail(e.target.value)}
                  placeholder="Optional if continuing as guest ECID"
                  className="w-full p-2 border border-[#D0D7DE] rounded-lg focus:outline-none focus:border-[#1473E6]"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleTriggerExplicitAbandon}
                  className="flex-1 py-2 px-3 bg-white border border-[#93C5FD] text-[#0D66D0] hover:bg-[#EFF6FF] font-bold rounded-lg cursor-pointer"
                >
                  Cancel &amp; Abandon Cart
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 bg-gradient-to-r from-[#1473E6] to-[#0A3D82] text-white font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  Place Order (${cartTotal.toLocaleString()})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full border border-[#E1E5EA] shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E1E5EA]">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#1473E6]" />
                <h3 className="text-base font-bold text-[#1E2229]">{quickViewProduct.name}</h3>
              </div>
              <button onClick={() => setQuickViewProduct(null)} className="text-[#475569] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs font-mono text-[#64748B]">SKU: {quickViewProduct.sku} · {quickViewProduct.category}</div>
            <p className="text-xs text-[#334155] leading-relaxed">{quickViewProduct.tagline}</p>
            <div className="flex flex-wrap gap-1.5">
              {quickViewProduct.specs.map((s) => (
                <span key={s} className="text-[11px] px-2 py-0.5 rounded bg-[#EFF6FF] text-[#0D66D0] border border-[#BFDBFE] font-semibold">
                  {s}
                </span>
              ))}
            </div>
            <div className="pt-3 border-t border-[#E1E5EA] flex items-center justify-between">
              <span className="text-lg font-mono font-bold text-[#0A3D82]">${quickViewProduct.price.toLocaleString()}</span>
              <button
                onClick={() => {
                  handleAddToCart(quickViewProduct);
                  setQuickViewProduct(null);
                }}
                className="px-4 py-2 bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Add to Cart &amp; Stream
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
