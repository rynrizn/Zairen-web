import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';

export interface POSProduct {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  image: string;
  stock: { [size: string]: number };
}

export interface CartItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
}

export interface SaleRecord {
  id: string;
  ticketNumber: string;
  time: string;
  clientName: string;
  clientPhone: string;
  itemsSummary: string;
  paymentMethod: string;
  total: number;
  discount: number;
}

const mockCatalog: POSProduct[] = [
  {
    id: 'pos-1',
    sku: 'ZRN-MK-01',
    name: 'Samurai Mecha Kanji',
    category: 'Anime Mecha',
    price: 145.0,
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=400&auto=format&fit=crop',
    stock: { S: 4, M: 18, L: 12, XL: 0 },
  },
  {
    id: 'pos-2',
    sku: 'ZRN-CG-04',
    name: 'Cyber Geisha Tee',
    category: 'Anime Mecha',
    price: 135.0,
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=400&auto=format&fit=crop',
    stock: { S: 6, M: 8, L: 8, XL: 2 },
  },
  {
    id: 'pos-3',
    sku: 'ZRN-VG-09',
    name: 'Tokyo Vanguard Acid',
    category: 'Streetwear Zen',
    price: 130.0,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=400&auto=format&fit=crop',
    stock: { S: 0, M: 7, L: 5, XL: 3 },
  },
  {
    id: 'pos-4',
    sku: 'ZRN-HD-12',
    name: 'Zen Kanji Shadow',
    category: 'Streetwear Zen',
    price: 125.0,
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=400&auto=format&fit=crop',
    stock: { S: 2, M: 0, L: 4, XL: 0 },
  },
  {
    id: 'pos-5',
    sku: 'ZRN-AN-99',
    name: 'Kuro Heavy Anorak',
    category: 'Cyberpunk Outerwear',
    price: 280.0,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=400&auto=format&fit=crop',
    stock: { S: 2, M: 5, L: 8, XL: 4 },
  },
  {
    id: 'pos-6',
    sku: 'ZRN-TC-78',
    name: 'Void Tactical Cargo',
    category: 'Cyberpunk Outerwear',
    price: 310.0,
    image: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?q=80&w=400&auto=format&fit=crop',
    stock: { S: 1, M: 8, L: 10, XL: 4 },
  },
];

const initialRecentSales: SaleRecord[] = [
  {
    id: 'sal-1',
    ticketNumber: '#V-2026-088',
    time: '16:42',
    clientName: 'Hiroshi Tanaka',
    clientPhone: '+591 78912345',
    itemsSummary: '2x Samurai Mecha Kanji (XL, M)',
    paymentMethod: 'QR Simple',
    total: 290.0,
    discount: 0,
  },
  {
    id: 'sal-2',
    ticketNumber: '#V-2026-087',
    time: '15:18',
    clientName: 'Valeria Montenegro',
    clientPhone: '+591 60192837',
    itemsSummary: '1x Kuro Heavy Anorak (L)',
    paymentMethod: 'Transferencia',
    total: 280.0,
    discount: 0,
  },
  {
    id: 'sal-3',
    ticketNumber: '#V-2026-086',
    time: '14:05',
    clientName: 'Cliente Mostrador (S/N)',
    clientPhone: '',
    itemsSummary: '1x Cyber Geisha Tee (M)',
    paymentMethod: 'Efectivo',
    total: 135.0,
    discount: 0,
  },
  {
    id: 'sal-4',
    ticketNumber: '#V-2026-085',
    time: '12:30',
    clientName: 'Mateo Céspedes',
    clientPhone: '+591 77123456',
    itemsSummary: '2x Zen Kanji Hoodie, Tokyo Acid',
    paymentMethod: 'QR Simple',
    total: 255.0,
    discount: 0,
  },
];

export function POSTerminal() {
  const [catalog] = useState<POSProduct[]>(mockCatalog);
  const [cart, setCart] = useState<CartItem[]>([
    {
      id: 'cart-1',
      productId: 'pos-1',
      sku: 'ZRN-MK-01',
      name: 'Samurai Mecha Kanji',
      size: 'L',
      price: 145.0,
      quantity: 1,
      image: mockCatalog[0].image,
    },
    {
      id: 'cart-2',
      productId: 'pos-3',
      sku: 'ZRN-VG-09',
      name: 'Tokyo Vanguard Acid',
      size: 'M',
      price: 130.0,
      quantity: 1,
      image: mockCatalog[2].image,
    },
  ]);

  // Selected sizes for each product card
  const [selectedSizes, setSelectedSizes] = useState<{ [productId: string]: string }>({
    'pos-1': 'L',
    'pos-2': 'M',
    'pos-3': 'M',
    'pos-4': 'L',
    'pos-5': 'L',
    'pos-6': 'M',
  });

  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [customerMode, setCustomerMode] = useState<'registered' | 'counter'>('registered');
  const [clientName, setClientName] = useState<string>('Andrés Villena');
  const [clientPhone, setClientPhone] = useState<string>('+591 789 45210');
  const [coupon, setCoupon] = useState<string>('DROP01');
  const [discount, setDiscount] = useState<number>(15.0);
  const [paymentMethod, setPaymentMethod] = useState<'QR Simple' | 'Transferencia' | 'Efectivo'>('QR Simple');
  const [cashGiven, setCashGiven] = useState<string>('300');
  const [recentSales, setRecentSales] = useState<SaleRecord[]>(initialRecentSales);

  // Modal de Recibo Térmico
  const [activeReceipt, setActiveReceipt] = useState<SaleRecord | null>(null);

  // Filtrado de catálogo
  const filteredCatalog = useMemo(() => {
    return catalog.filter((prod) => {
      const matchesSearch =
        prod.name.toLowerCase().includes(search.toLowerCase()) ||
        prod.sku.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === 'Todas' || prod.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [catalog, search, selectedCategory]);

  // Totales
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const total = Math.max(0, subtotal - discount);

  const cashChange = useMemo(() => {
    const given = parseFloat(cashGiven) || 0;
    return Math.max(0, given - total);
  }, [cashGiven, total]);

  const handleSelectSize = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleAddToCart = (product: POSProduct) => {
    const size = selectedSizes[product.id] || 'M';
    const available = product.stock[size] ?? 0;
    if (available <= 0) {
      toast.error(`Talla ${size} sin stock disponible`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id && item.size === size);
      if (existing) {
        return prev.map((item) =>
          item.id === existing.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: `cart-${Date.now()}`,
          productId: product.id,
          sku: product.sku,
          name: product.name,
          size,
          price: product.price,
          quantity: 1,
          image: product.image,
        },
      ];
    });

    toast.success(`+1 ${product.name} (${size}) añadido a la orden`);
  };

  const handleUpdateQuantity = (cartId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === cartId ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (cartId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartId));
  };

  const handleApplyCoupon = () => {
    if (coupon.toUpperCase() === 'DROP01') {
      setDiscount(15.0);
      toast.success('Cupón DROP01 aplicado: -Bs 15.00');
    } else if (coupon.trim() === '') {
      setDiscount(0);
    } else {
      toast.error('Cupón no válido');
    }
  };

  const handleProcessSale = () => {
    if (cart.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    const ticketNumber = `#V-2026-0${Math.floor(100 + Math.random() * 900)}`;
    const itemsSummary = cart.map((i) => `${i.quantity}x ${i.name} (${i.size})`).join(', ');

    const newSale: SaleRecord = {
      id: `sal-${Date.now()}`,
      ticketNumber,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      clientName: customerMode === 'registered' ? clientName : 'Cliente Mostrador (S/N)',
      clientPhone: customerMode === 'registered' ? clientPhone : '',
      itemsSummary,
      paymentMethod,
      total,
      discount,
    };

    setRecentSales([newSale, ...recentSales]);
    setActiveReceipt(newSale);
    setCart([]);
    toast.success(`Venta ${ticketNumber} registrada exitosamente`, {
      description: `Total cobrado: Bs ${total.toFixed(2)} (${paymentMethod})`,
    });
  };

  return (
    <div className="flex flex-col gap-8">
      {/* 1. Header: Operational Shift Bar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-white/[0.06] relative">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 font-mono text-xs text-[#dc143c] uppercase tracking-widest font-bold">
            <span className="inline-flex w-2 h-2 rounded-full bg-[#dc143c] shadow-[0_0_10px_#dc143c] animate-ping"></span>
            <span>ONLINE NODE // TOKYO-03</span>
            <span className="text-[#5c3f3f]">/</span>
            <span>ADMIN-POS-INTERFACE</span>
          </div>
          <h1 className="font-headline text-2xl md:text-4xl font-bold text-[#e5e2e1] uppercase tracking-tight flex items-center gap-3">
            TERMINAL DE REGISTRO DE VENTAS
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-[#201f1f] text-[#ffb3b3] border border-white/[0.06]">
              POS & CONCIERGE
            </span>
          </h1>
          <p className="font-sans text-xs text-[#ac8888]">
            Punto de despacho táctico, sincronización de existencias e inventario en tiempo real.
          </p>
        </div>

        {/* Shift KPIs Compact Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-[#141416] p-2 rounded-xl border border-white/[0.06] shadow-xl">
          <div className="flex items-center gap-2.5 px-3 py-1.5 bg-[#1c1b1b] rounded-lg border border-white/[0.04]">
            <span className="material-symbols-outlined text-[18px] text-[#dc143c]">payments</span>
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-[#ac8888] uppercase">Turno Actual</span>
              <span className="font-headline text-sm text-white font-bold">Bs 1,240.00</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1.5 bg-[#1c1b1b] rounded-lg border border-white/[0.04]">
            <span className="material-symbols-outlined text-[18px] text-[#ffb3b3]">receipt_long</span>
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-[#ac8888] uppercase">Tickets Hoy</span>
              <span className="font-headline text-sm text-white font-bold">{recentSales.length} Tx</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1.5 bg-[#1c1b1b] rounded-lg border border-white/[0.04]">
            <span className="material-symbols-outlined text-[18px] text-[#34d399]">badge</span>
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-[#ac8888] uppercase">Vendedor</span>
              <span className="font-headline text-xs text-[#34d399] font-bold">Kenji S. // SuperAdmin</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Operational Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Product Catalog Picker (7 Cols) */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          {/* Search & Barcode Input + Category Filter Bar */}
          <div className="bg-[#1c1b1b]/90 backdrop-blur-xl p-4 rounded-2xl border border-white/[0.08] shadow-lg flex flex-col gap-3">
            <div className="relative w-full flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-[#ac8888] text-[20px] pointer-events-none">
                barcode_scanner
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Escanear código de barras, SKU o nombre (ej: ZRN-MK-01)..."
                className="w-full pl-11 pr-24 py-2.5 bg-[#141416] text-white font-mono text-xs rounded-xl border border-white/[0.06] focus:border-[#dc143c] focus:outline-none"
              />
              <div className="absolute right-2 flex items-center gap-1 font-mono text-[10px] text-[#ac8888] bg-[#201f1f] px-2 py-1 rounded border border-white/[0.04]">
                <span className="text-[#dc143c] font-bold">⌘K</span>
                <span>SCAN</span>
              </div>
            </div>

            {/* Fast Collection Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {['Todas', 'Anime Mecha', 'Streetwear Zen', 'Cyberpunk Outerwear'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full font-mono text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-[#dc143c] text-white font-bold shadow-sm'
                      : 'bg-[#141416] text-[#ac8888] hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog Compact Grid (Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredCatalog.map((product) => {
              const currentSize = selectedSizes[product.id] || 'M';
              const availableInSize = product.stock[currentSize] ?? 0;

              return (
                <article
                  key={product.id}
                  className="bg-[#1c1b1b]/90 backdrop-blur-md rounded-2xl p-3 flex flex-col justify-between border border-white/[0.06] hover:border-[#dc143c]/50 transition-all shadow-md group"
                >
                  <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-[#141416] mb-2">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#141416]/80 backdrop-blur-md font-mono text-[9px] text-[#ffb3b3] tracking-wider uppercase font-bold">
                      STOCK: {availableInSize}
                    </span>
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#dc143c] text-white font-mono text-[10px] font-bold">
                      {product.sku}
                    </span>
                  </div>

                  <div className="space-y-1 mb-2">
                    <h3 className="font-headline text-xs text-white font-bold truncate">
                      {product.name}
                    </h3>
                    <p className="font-price text-sm text-[#dc143c] font-bold">
                      Bs {product.price.toFixed(2)}
                    </p>
                  </div>

                  {/* Size Selector Pills & Add Button */}
                  <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1 font-mono text-[11px]">
                      {(['S', 'M', 'L', 'XL'] as const).map((sz) => {
                        const inStock = (product.stock[sz] ?? 0) > 0;
                        const isSelected = currentSize === sz;

                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => handleSelectSize(product.id, sz)}
                            disabled={!inStock}
                            className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs transition-colors cursor-pointer ${
                              !inStock
                                ? 'opacity-30 line-through text-[#ac8888] cursor-not-allowed bg-[#141416]'
                                : isSelected
                                ? 'bg-[#dc143c] text-white shadow-sm'
                                : 'bg-[#141416] text-[#ac8888] hover:text-white'
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      disabled={availableInSize <= 0}
                      className="w-7 h-7 rounded-full bg-[#dc143c] hover:bg-[#ff2d55] disabled:opacity-40 text-white flex items-center justify-center shadow-md active:scale-90 transition-transform cursor-pointer"
                      title="Añadir a la orden"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Right Column: Active Cart & Checkout Concierge (5 Cols) */}
        <section className="lg:col-span-5 bg-[#1c1b1b]/95 backdrop-blur-2xl rounded-2xl p-5 border border-white/[0.08] shadow-2xl relative flex flex-col gap-4">
          {/* Order Header & ID Badge */}
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#dc143c] shadow-[0_0_8px_#dc143c]"></span>
                <h2 className="font-headline text-base text-white tracking-tight uppercase">
                  ORDEN ACTIVA
                </h2>
              </div>
              <p className="font-mono text-xs text-[#dc143c] font-bold">ID: #V-2026-LIVE</p>
            </div>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={() => setCart([])}
                className="font-mono text-xs text-[#ac8888] hover:text-red-400 transition-colors flex items-center gap-1 uppercase cursor-pointer"
                title="Limpiar carrito"
              >
                <span className="material-symbols-outlined text-[16px]">delete_sweep</span> Limpiar
              </button>
            )}
          </div>

          {/* Customer Mode Toggle */}
          <div className="flex flex-col gap-2 bg-[#141416] p-3 rounded-xl border border-white/[0.04]">
            <div className="grid grid-cols-2 p-1 bg-[#1c1b1b] rounded-lg font-mono text-[11px] uppercase tracking-wider text-center">
              <button
                type="button"
                onClick={() => setCustomerMode('registered')}
                className={`py-1.5 rounded-md transition-all cursor-pointer ${
                  customerMode === 'registered'
                    ? 'bg-[#dc143c] text-white font-bold shadow-sm'
                    : 'text-[#ac8888] hover:text-white'
                }`}
              >
                Cliente Registrado
              </button>
              <button
                type="button"
                onClick={() => setCustomerMode('counter')}
                className={`py-1.5 rounded-md transition-all cursor-pointer ${
                  customerMode === 'counter'
                    ? 'bg-[#dc143c] text-white font-bold shadow-sm'
                    : 'text-[#ac8888] hover:text-white'
                }`}
              >
                Mostrador Ocasional
              </button>
            </div>

            {customerMode === 'registered' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] text-[#ac8888] uppercase">
                    Nombre del Cliente
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#1c1b1b] text-white font-sans text-xs rounded-lg border border-white/[0.06] focus:border-[#dc143c] focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] text-[#ac8888] uppercase">
                    WhatsApp / Contacto
                  </label>
                  <input
                    type="text"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#1c1b1b] text-white font-mono text-xs rounded-lg border border-white/[0.06] focus:border-[#dc143c] focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Added Items Line List */}
          <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
            {cart.length > 0 ? (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#141416] border border-white/[0.04]"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-[#201f1f] overflow-hidden flex-shrink-0 border border-white/[0.06]">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-sans text-xs text-white font-semibold line-clamp-1">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-2 font-mono text-[10px] text-[#ac8888]">
                        <span className="px-1.5 py-0.2 bg-[#dc143c]/20 text-[#dc143c] rounded font-bold">
                          Talla {item.size}
                        </span>
                        <span>Bs {item.price.toFixed(2)} c/u</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-[#1c1b1b] px-1.5 py-0.5 rounded font-mono text-xs">
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.id, -1)}
                        className="w-5 h-5 flex items-center justify-center text-[#ac8888] hover:text-[#dc143c] cursor-pointer"
                      >
                        −
                      </button>
                      <span className="w-4 text-center font-bold text-white">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                        className="w-5 h-5 flex items-center justify-center text-[#ac8888] hover:text-[#dc143c] cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-price text-xs text-white font-bold min-w-[55px] text-right">
                      Bs {(item.price * item.quantity).toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-[#ac8888] hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs font-mono text-[#ac8888]">
                El carrito está vacío. Haz clic en las prendas para añadirlas.
              </div>
            )}
          </div>

          {/* Coupon / Discount Bar */}
          <div className="flex items-center gap-2 pt-1">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-[#dc143c]">
                sell
              </span>
              <input
                type="text"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                placeholder="CUPÓN DE DESCUENTO"
                className="w-full pl-8 pr-3 py-1.5 bg-[#141416] text-white font-mono text-xs uppercase rounded-lg border border-white/[0.06] focus:border-[#dc143c] focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleApplyCoupon}
              className="px-3 py-1.5 rounded-lg bg-[#201f1f] hover:bg-[#dc143c] text-white font-mono text-xs font-bold transition-all cursor-pointer"
            >
              Aplicar
            </button>
          </div>

          {/* Payment Method Selector */}
          <div className="flex flex-col gap-2 pt-1">
            <span className="font-mono text-[10px] text-[#ac8888] uppercase tracking-wider">
              Método de Pago
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('QR Simple')}
                className={`p-2 rounded-xl flex flex-col items-center gap-1 text-center transition-all cursor-pointer ${
                  paymentMethod === 'QR Simple'
                    ? 'bg-[#dc143c]/20 text-white border border-[#dc143c] shadow-[0_0_12px_rgba(220,20,60,0.2)]'
                    : 'bg-[#141416] text-[#ac8888] hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[18px] text-[#dc143c]">
                  qr_code_2
                </span>
                <span className="font-mono text-[10px] uppercase font-bold">QR Simple</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Transferencia')}
                className={`p-2 rounded-xl flex flex-col items-center gap-1 text-center transition-all cursor-pointer ${
                  paymentMethod === 'Transferencia'
                    ? 'bg-[#dc143c]/20 text-white border border-[#dc143c] shadow-[0_0_12px_rgba(220,20,60,0.2)]'
                    : 'bg-[#141416] text-[#ac8888] hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[18px] text-[#34d399]">
                  account_balance
                </span>
                <span className="font-mono text-[10px] uppercase font-bold">Transferencia</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Efectivo')}
                className={`p-2 rounded-xl flex flex-col items-center gap-1 text-center transition-all cursor-pointer ${
                  paymentMethod === 'Efectivo'
                    ? 'bg-[#dc143c]/20 text-white border border-[#dc143c] shadow-[0_0_12px_rgba(220,20,60,0.2)]'
                    : 'bg-[#141416] text-[#ac8888] hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[18px] text-[#fbbf24]">
                  payments
                </span>
                <span className="font-mono text-[10px] uppercase font-bold">Efectivo</span>
              </button>
            </div>

            {/* QR Inmediato Visual Box */}
            {paymentMethod === 'QR Simple' && (
              <div className="flex items-center gap-3 bg-[#141416] p-3 rounded-xl border border-white/[0.06] mt-1">
                <div className="w-16 h-16 bg-white p-1 rounded-lg flex-shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full text-black" fill="currentColor" viewBox="0 0 100 100">
                    <rect height="30" width="30" x="0" y="0"></rect>
                    <rect fill="white" height="20" width="20" x="5" y="5"></rect>
                    <rect height="12" width="12" x="9" y="9"></rect>
                    <rect height="30" width="30" x="70" y="0"></rect>
                    <rect fill="white" height="20" width="20" x="75" y="5"></rect>
                    <rect height="12" width="12" x="79" y="79"></rect>
                    <rect height="30" width="30" x="0" y="70"></rect>
                    <rect fill="white" height="20" width="20" x="5" y="75"></rect>
                    <rect height="12" width="12" x="9" y="79"></rect>
                    <rect height="20" width="10" x="40" y="10"></rect>
                    <rect height="10" width="20" x="40" y="40"></rect>
                    <rect height="15" width="10" x="55" y="20"></rect>
                    <rect height="10" width="20" x="70" y="45"></rect>
                    <rect height="25" width="10" x="25" y="45"></rect>
                    <rect height="15" width="15" x="45" y="65"></rect>
                    <rect height="25" width="25" x="70" y="70"></rect>
                  </svg>
                </div>
                <div className="flex flex-col justify-center text-left">
                  <span className="font-mono text-[10px] text-[#dc143c] font-bold uppercase tracking-wider">
                    BANCO BISA // QR SIMPLE 3.0
                  </span>
                  <span className="font-sans text-xs text-[#e5e2e1] leading-tight">
                    Monto vinculado: Bs {total.toFixed(2)}
                  </span>
                  <span className="font-mono text-[10px] text-[#ac8888] mt-0.5">
                    Glosa: ZAIREN-{Date.now().toString().slice(-4)}
                  </span>
                </div>
              </div>
            )}

            {/* Efectivo - Calculador de Cambio */}
            {paymentMethod === 'Efectivo' && (
              <div className="bg-[#141416] p-3 rounded-xl border border-white/[0.06] space-y-2 mt-1">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-xs text-[#ac8888] uppercase">
                    Efectivo Recibido (Bs):
                  </label>
                  <input
                    type="number"
                    value={cashGiven}
                    onChange={(e) => setCashGiven(e.target.value)}
                    className="w-24 text-right px-2 py-1 bg-[#1c1b1b] text-white font-price text-sm rounded border border-white/[0.08] focus:border-[#dc143c] focus:outline-none"
                  />
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
                  <span className="font-mono text-xs text-amber-300 font-bold uppercase">
                    Cambio a Devolver:
                  </span>
                  <span className="font-price text-base text-amber-300 font-bold">
                    Bs {cashChange.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Breakdown & Grand Total */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-white/[0.06]">
            <div className="flex justify-between font-mono text-xs text-[#ac8888]">
              <span>Subtotal ({cart.reduce((a, b) => a + b.quantity, 0)} prendas)</span>
              <span>Bs {subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between font-mono text-xs text-[#dc143c]">
                <span>Descuento ({coupon})</span>
                <span>- Bs {discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-2">
              <span className="font-headline text-xs text-white uppercase font-bold tracking-wider">
                TOTAL A COBRAR:
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-sm text-[#dc143c] font-bold">Bs</span>
                <span className="font-headline text-3xl text-[#dc143c] font-bold">
                  {total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Final Confirm Button */}
          <button
            type="button"
            onClick={handleProcessSale}
            disabled={cart.length === 0}
            className="w-full py-3.5 px-6 rounded-full bg-[#dc143c] hover:bg-[#ff2d55] disabled:opacity-40 text-white font-headline text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_24px_rgba(220,20,60,0.4)] active:scale-[0.98] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">verified</span>
            <span>CONFIRMAR Y REGISTRAR VENTA →</span>
          </button>
        </section>
      </div>

      {/* 3. Bottom Section: Recent Sales Today */}
      <section className="flex flex-col gap-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#dc143c] text-[20px]">history</span>
            <h3 className="font-headline text-base text-white tracking-tight uppercase">
              ÚLTIMAS VENTAS REGISTRADAS HOY
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-[#141416] font-mono text-[10px] text-[#ffb3b3]">
              {recentSales.length} REGISTROS
            </span>
          </div>

          <button
            type="button"
            onClick={() => toast.success('Reporte de cierre de caja descargado')}
            className="px-4 py-1.5 rounded-full bg-[#141416] hover:bg-[#201f1f] text-[#e5e2e1] font-mono text-xs uppercase flex items-center gap-1.5 transition-colors border border-white/[0.06] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">file_download</span>
            <span>Exportar Cierre</span>
          </button>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto rounded-2xl bg-[#1c1b1b]/80 border border-white/[0.08] shadow-lg">
          <table className="w-full text-left font-sans text-xs">
            <thead className="bg-[#141416]/60 font-mono text-[10px] text-[#ac8888] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Hora</th>
                <th className="py-3 px-3">Ticket #</th>
                <th className="py-3 px-3">Cliente</th>
                <th className="py-3 px-4">Prendas Vendidas</th>
                <th className="py-3 px-3">Método</th>
                <th className="py-3 px-3 text-right">Total</th>
                <th className="py-3 px-3 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-[#e5e2e1]">
              {recentSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-[#201f1f]/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-[#ac8888]">{sale.time}</td>
                  <td className="py-3 px-3 font-mono text-xs font-bold text-[#dc143c]">
                    {sale.ticketNumber}
                  </td>
                  <td className="py-3 px-3 font-semibold text-white">{sale.clientName}</td>
                  <td className="py-3 px-4 text-[#ac8888] truncate max-w-xs">
                    {sale.itemsSummary}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#141416] text-[#ffb3b3] border border-white/[0.04]">
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-price font-bold text-white whitespace-nowrap">
                    Bs {sale.total.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-mono text-[10px] font-bold">
                      CONFIRMADO
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setActiveReceipt(sale)}
                        className="p-1.5 rounded-full bg-[#141416] hover:bg-[#201f1f] text-[#ac8888] hover:text-white transition-colors cursor-pointer"
                        title="Ver Comprobante Térmico"
                      >
                        <span className="material-symbols-outlined text-[16px]">print</span>
                      </button>
                      {sale.clientPhone && (
                        <a
                          href={`https://wa.me/${sale.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Hola ${sale.clientName}, tu comprobante de compra ${sale.ticketNumber} por Bs ${sale.total.toFixed(2)} en ZAIREN LAB ha sido emitido.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-full bg-[#141416] hover:bg-emerald-600 text-[#ac8888] hover:text-white transition-colors"
                          title="Enviar por WhatsApp"
                        >
                          <span className="material-symbols-outlined text-[16px]">chat</span>
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal: Recibo Térmico Digital */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141416] border border-white/[0.1] rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative text-center">
            <button
              type="button"
              onClick={() => setActiveReceipt(null)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#201f1f] text-[#ac8888] hover:text-white flex items-center justify-center text-xs"
            >
              ✕
            </button>

            {/* Recibo formato térmico */}
            <div className="bg-[#1c1b1b] p-5 rounded-xl border border-dashed border-white/[0.15] space-y-3 text-left font-mono text-xs">
              <div className="text-center space-y-1 pb-3 border-b border-dashed border-white/[0.15]">
                <h4 className="font-headline text-base font-bold text-white tracking-widest uppercase">
                  ZAIREN LAB
                </h4>
                <p className="text-[10px] text-[#ac8888]">TOKYO EXPERIMENTAL APPAREL</p>
                <p className="text-[9px] text-[#ac8888]">NIT: 10293847012 • LA PAZ, BOLIVIA</p>
                <p className="text-[10px] text-[#dc143c] font-bold">{activeReceipt.ticketNumber}</p>
              </div>

              <div className="space-y-1 text-[11px] text-[#e5e2e1]">
                <p><span className="text-[#ac8888]">FECHA:</span> {new Date().toLocaleDateString()} {activeReceipt.time}</p>
                <p><span className="text-[#ac8888]">CLIENTE:</span> {activeReceipt.clientName}</p>
                {activeReceipt.clientPhone && (
                  <p><span className="text-[#ac8888]">TEL:</span> {activeReceipt.clientPhone}</p>
                )}
                <p><span className="text-[#ac8888]">PAGO:</span> {activeReceipt.paymentMethod}</p>
              </div>

              <div className="py-2 border-y border-dashed border-white/[0.15] text-[11px] space-y-1">
                <p className="text-white font-bold">{activeReceipt.itemsSummary}</p>
              </div>

              <div className="flex justify-between items-baseline pt-1">
                <span className="font-bold text-white">TOTAL PAGADO:</span>
                <span className="font-price text-base font-bold text-[#dc143c]">
                  Bs {activeReceipt.total.toFixed(2)}
                </span>
              </div>

              <div className="text-center pt-3 text-[9px] text-[#ac8888] border-t border-dashed border-white/[0.15]">
                ¡GRACIAS POR SU COMPRA!
                <br />
                www.zairenlab.com // @zairen.lab
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                  toast.success('Enviado a impresora térmica');
                }}
                className="flex-1 py-2.5 rounded-full bg-[#dc143c] hover:bg-[#ff2d55] text-white font-headline text-xs font-bold uppercase transition-all cursor-pointer"
              >
                Imprimir Recibo
              </button>
              <button
                type="button"
                onClick={() => setActiveReceipt(null)}
                className="px-4 py-2.5 rounded-full bg-[#201f1f] text-[#ac8888] hover:text-white font-mono text-xs uppercase cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
