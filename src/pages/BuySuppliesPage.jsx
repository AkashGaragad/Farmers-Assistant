import { useState, useMemo } from "react";

// ── MongoDB-ready product schema ──────────────────────────────────────────────
// Each product maps 1-to-1 with a MongoDB document in the `products` collection.
// Fields: _id (ObjectId), name, brand, category, subCategory, certifications[],
//         pricePerUnit, unit, minOrder, stock, deliveryDays, images[], tags[],
//         description, isActive, createdAt
// ─────────────────────────────────────────────────────────────────────────────

const PRODUCTS = [
  {
    _id: "prod_001",
    name: "Urea 46% Nitrogen",
    brand: "IFFCO",
    category: "fertiliser",
    subCategory: "nitrogen",
    certifications: ["ISI", "FCO Approved"],
    pricePerUnit: 285,
    unit: "50kg bag",
    minOrder: 1,
    stock: 480,
    deliveryDays: 3,
    tags: ["bestseller", "paddy", "wheat"],
    description: "High-nitrogen granular urea for basal and top-dress application.",
    rating: 4.7,
    reviews: 312,
  },
  {
    _id: "prod_002",
    name: "DAP (Di-Ammonium Phosphate)",
    brand: "Coromandel",
    category: "fertiliser",
    subCategory: "phosphate",
    certifications: ["ISI", "FCO Approved"],
    pricePerUnit: 1350,
    unit: "50kg bag",
    minOrder: 1,
    stock: 210,
    deliveryDays: 2,
    tags: ["bestseller", "all-crops"],
    description: "Premium phosphatic fertiliser boosting root development.",
    rating: 4.8,
    reviews: 198,
  },
  {
    _id: "prod_003",
    name: "NPK 10:26:26",
    brand: "Zuari",
    category: "fertiliser",
    subCategory: "npk",
    certifications: ["ISI"],
    pricePerUnit: 1480,
    unit: "50kg bag",
    minOrder: 1,
    stock: 95,
    deliveryDays: 4,
    tags: ["vegetables", "fruits"],
    description: "Balanced complex fertiliser for horticultural crops.",
    rating: 4.5,
    reviews: 87,
  },
  {
    _id: "prod_004",
    name: "Chlorpyrifos 20% EC",
    brand: "Bayer",
    category: "pesticide",
    subCategory: "insecticide",
    certifications: ["CIB Registered", "ISI"],
    pricePerUnit: 520,
    unit: "1L bottle",
    minOrder: 1,
    stock: 145,
    deliveryDays: 3,
    tags: ["paddy", "cotton", "broad-spectrum"],
    description: "Organophosphate insecticide for termites, stem borers & more.",
    rating: 4.6,
    reviews: 223,
  },
  {
    _id: "prod_005",
    name: "Mancozeb 75% WP",
    brand: "UPL",
    category: "pesticide",
    subCategory: "fungicide",
    certifications: ["CIB Registered"],
    pricePerUnit: 340,
    unit: "500g packet",
    minOrder: 2,
    stock: 320,
    deliveryDays: 2,
    tags: ["potato", "tomato", "grapes"],
    description: "Broad-spectrum protective fungicide against blight & downy mildew.",
    rating: 4.4,
    reviews: 156,
  },
  {
    _id: "prod_006",
    name: "Glyphosate 41% SL",
    brand: "Dhanuka",
    category: "pesticide",
    subCategory: "herbicide",
    certifications: ["CIB Registered", "ISI"],
    pricePerUnit: 275,
    unit: "1L bottle",
    minOrder: 1,
    stock: 200,
    deliveryDays: 3,
    tags: ["weed-control", "non-selective"],
    description: "Systemic herbicide for control of annual & perennial weeds.",
    rating: 4.3,
    reviews: 134,
  },
  {
    _id: "prod_007",
    name: "Potassium Sulphate (SOP)",
    brand: "SQM",
    category: "fertiliser",
    subCategory: "potash",
    certifications: ["ISI", "FCO Approved"],
    pricePerUnit: 1650,
    unit: "25kg bag",
    minOrder: 1,
    stock: 60,
    deliveryDays: 5,
    tags: ["fruits", "vegetables", "chloride-sensitive"],
    description: "Chloride-free potassium source ideal for quality fruits.",
    rating: 4.9,
    reviews: 45,
  },
  {
    _id: "prod_008",
    name: "Imidacloprid 17.8% SL",
    brand: "Syngenta",
    category: "pesticide",
    subCategory: "insecticide",
    certifications: ["CIB Registered"],
    pricePerUnit: 480,
    unit: "500ml bottle",
    minOrder: 1,
    stock: 175,
    deliveryDays: 2,
    tags: ["sucking-pest", "cotton", "rice"],
    description: "Systemic neonicotinoid for whiteflies, aphids & leafhoppers.",
    rating: 4.7,
    reviews: 267,
  },
];

const CATEGORIES = [
  { id: "all", label: "All Products" },
  { id: "fertiliser", label: "Fertilisers" },
  { id: "pesticide", label: "Pesticides" },
];

const SUB_CATEGORIES = {
  fertiliser: ["nitrogen", "phosphate", "potash", "npk"],
  pesticide: ["insecticide", "fungicide", "herbicide"],
};

const SORT_OPTIONS = [
  { id: "popular", label: "Most Popular" },
  { id: "price_asc", label: "Price: Low to High" },
  { id: "price_desc", label: "Price: High to Low" },
  { id: "rating", label: "Top Rated" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const categoryColor = {
  fertiliser: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  pesticide: { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" },
};

const subCatIcon = {
  nitrogen: "🌿", phosphate: "🌱", potash: "🍇", npk: "⚗️",
  insecticide: "🐛", fungicide: "🍄", herbicide: "🌾",
};

function StarRating({ rating }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} viewBox="0 0 12 12" className={`w-3 h-3 ${s <= Math.round(rating) ? "text-amber-400" : "text-gray-200"}`} fill="currentColor">
          <path d="M6 1l1.3 2.6L10 4l-2 1.9.5 2.7L6 7.4 3.5 8.6 4 5.9 2 4l2.7-.4z" />
        </svg>
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating}</span>
    </span>
  );
}

function Badge({ text, color = "rose" }) {
  const map = {
    rose: "bg-rose-100 text-rose-700",
    emerald: "bg-emerald-100 text-emerald-700",
    blue: "bg-blue-100 text-blue-700",
    amber: "bg-amber-100 text-amber-700",
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${map[color]}`}>{text}</span>
  );
}

function ProductCard({ product, onAddToCart, qty }) {
  const c = categoryColor[product.category];
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group">
      {/* Top accent strip */}
      <div className={`h-1 w-full ${product.category === "fertiliser" ? "bg-gradient-to-r from-emerald-400 to-teal-400" : "bg-gradient-to-r from-orange-400 to-rose-400"}`} />

      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
                {subCatIcon[product.subCategory]} {product.subCategory}
              </span>
              {product.tags.includes("bestseller") && (
                <Badge text="Bestseller" color="amber" />
              )}
            </div>
            <h3 className="font-bold text-gray-800 text-sm leading-tight">{product.name}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{product.brand}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-extrabold text-gray-900">₹{product.pricePerUnit.toLocaleString()}</p>
            <p className="text-[11px] text-gray-400">per {product.unit}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{product.description}</p>

        {/* Certs */}
        <div className="flex flex-wrap gap-1">
          {product.certifications.map((c) => (
            <span key={c} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">✓ {c}</span>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <StarRating rating={product.rating} />
          <span>{product.reviews} reviews</span>
          <span className="flex items-center gap-1">
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-rose-400" fill="currentColor"><path d="M8 1.5a6.5 6.5 0 100 13A6.5 6.5 0 008 1.5zm.75 7.25H7.5V4.5h1.25v4.25zm0 2H7.5V9.5h1.25v1.25z"/></svg>
            {product.deliveryDays}d delivery
          </span>
        </div>

        {/* Cart control */}
        <div className="mt-auto pt-2 border-t border-gray-50">
          {qty > 0 ? (
            <div className="flex items-center justify-between bg-rose-50 rounded-xl px-3 py-2">
              <button onClick={() => onAddToCart(product, -1)} className="w-7 h-7 rounded-full bg-white border border-rose-200 text-rose-600 font-bold text-lg flex items-center justify-center hover:bg-rose-100 transition">−</button>
              <span className="font-bold text-rose-700 text-sm">{qty} × {product.unit}</span>
              <button onClick={() => onAddToCart(product, 1)} className="w-7 h-7 rounded-full bg-rose-500 text-white font-bold text-lg flex items-center justify-center hover:bg-rose-600 transition">+</button>
            </div>
          ) : (
            <button
              onClick={() => onAddToCart(product, 1)}
              className="w-full py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-semibold rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all duration-150 shadow-sm shadow-rose-200 group-hover:shadow-rose-300"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CartDrawer({ cart, products, onAddToCart, onClose, onCheckout }) {
  const cartItems = Object.entries(cart)
    .filter(([, q]) => q > 0)
    .map(([id, qty]) => ({ ...products.find((p) => p._id === id), qty }));

  const total = cartItems.reduce((s, i) => s + i.pricePerUnit * i.qty, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-rose-500 to-pink-500">
          <div>
            <h2 className="font-bold text-white text-lg">Your Cart</h2>
            <p className="text-rose-100 text-xs">{cartItems.length} item(s) · Village Delivery</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30">✕</button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">🛒</p>
              <p className="font-medium">Your cart is empty</p>
              <p className="text-sm mt-1">Add some products to get started</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item._id} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${item.category === "fertiliser" ? "bg-emerald-100" : "bg-orange-100"}`}>
                  {subCatIcon[item.subCategory]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.brand} · {item.unit}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <button onClick={() => onAddToCart(item, -1)} className="w-6 h-6 rounded-full bg-white border border-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold hover:border-rose-300">−</button>
                    <span className="text-sm font-bold text-gray-700">{item.qty}</span>
                    <button onClick={() => onAddToCart(item, 1)} className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-sm font-bold hover:bg-rose-600">+</button>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-gray-800 text-sm">₹{(item.pricePerUnit * item.qty).toLocaleString()}</p>
                  <p className="text-xs text-gray-400">₹{item.pricePerUnit} each</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-4 border-t border-gray-100 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Subtotal</span>
              <span className="font-bold text-gray-800">₹{total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Delivery</span>
              <span className="text-emerald-600 font-semibold text-sm">FREE · Village Doorstep</span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-100 pt-2">
              <span className="font-bold text-gray-800">Total</span>
              <span className="font-extrabold text-rose-600 text-lg">₹{total.toLocaleString()}</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold rounded-xl hover:from-rose-600 hover:to-pink-600 transition shadow-lg shadow-rose-200"
            >
              Place Order (Cash on Delivery) →
            </button>
            <p className="text-center text-xs text-gray-400">No advance payment · Pay when delivered</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function BuySuppliesPage() {
  const [category, setCategory] = useState("all");
  const [subFilter, setSubFilter] = useState(null);
  const [sortBy, setSortBy] = useState("popular");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0);

  const handleAddToCart = (product, delta) => {
    setCart((prev) => {
      const current = prev[product._id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [product._id]: next };
    });
  };

  const handleCheckout = () => {
    setCartOpen(false);
    setOrderPlaced(true);
    setCart({});
  };

  const filtered = useMemo(() => {
    let list = PRODUCTS.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (subFilter && p.subCategory !== subFilter) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
          !p.brand.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    if (sortBy === "popular") list = [...list].sort((a, b) => b.reviews - a.reviews);
    else if (sortBy === "price_asc") list = [...list].sort((a, b) => a.pricePerUnit - b.pricePerUnit);
    else if (sortBy === "price_desc") list = [...list].sort((a, b) => b.pricePerUnit - a.pricePerUnit);
    else if (sortBy === "rating") list = [...list].sort((a, b) => b.rating - a.rating);

    return list;
  }, [category, subFilter, sortBy, search]);

  const subCats = category !== "all" ? SUB_CATEGORIES[category] || [] : [];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">🚚 Doorstep Delivery</span>
                <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">✓ ISI Certified</span>
                <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">💵 Cash on Delivery</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">
                🛒 Buy Fertilisers & Pesticides
              </h1>
              <p className="text-rose-100 mt-1 text-sm max-w-xl">
                Government-approved, ISI-certified products — delivered to your village. No fake products, no travel required.
              </p>
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative bg-white text-rose-600 font-bold px-5 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all shrink-0 flex items-center gap-2"
            >
              🛒
              <span className="hidden sm:inline text-sm">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 text-white text-xs font-extrabold rounded-full flex items-center justify-center shadow">{cartCount}</span>
              )}
            </button>
          </div>

          {/* Search */}
          <div className="mt-5 relative max-w-lg">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1016.65 16.65z" />
            </svg>
            <input
              type="text"
              placeholder="Search by product or brand…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/20 placeholder-rose-200 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => { setCategory(c.id); setSubFilter(null); }}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${category === c.id ? "bg-rose-500 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {c.label}
              </button>
            ))}
            {subCats.map((s) => (
              <button
                key={s}
                onClick={() => setSubFilter(subFilter === s ? null : s)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all capitalize ${subFilter === s ? "bg-gray-800 text-white" : "bg-gray-50 text-gray-500 border border-gray-200 hover:border-gray-400"}`}
              >
                {subCatIcon[s]} {s}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-5xl mb-4">🌾</p>
            <p className="font-semibold text-lg text-gray-600">No products found</p>
            <p className="text-sm mt-1">Try a different search or category</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-4">{filtered.length} products</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((p) => (
                <ProductCard
                  key={p._id}
                  product={p}
                  onAddToCart={handleAddToCart}
                  qty={cart[p._id] || 0}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Trust Bar */}
      <div className="bg-white border-t border-gray-100 mt-4">
        <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { icon: "✅", title: "100% Certified", sub: "ISI & CIB approved only" },
            { icon: "🚚", title: "Village Delivery", sub: "3–5 day doorstep delivery" },
            { icon: "💵", title: "Cash on Delivery", sub: "Pay when you receive" },
            { icon: "🔄", title: "Easy Returns", sub: "7-day return policy" },
          ].map((t) => (
            <div key={t.title} className="flex flex-col items-center gap-1">
              <span className="text-2xl">{t.icon}</span>
              <p className="font-bold text-gray-800 text-sm">{t.title}</p>
              <p className="text-xs text-gray-400">{t.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Drawer */}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          products={PRODUCTS}
          onAddToCart={handleAddToCart}
          onClose={() => setCartOpen(false)}
          onCheckout={handleCheckout}
        />
      )}

      {/* Order Success Toast */}
      {orderPlaced && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <span className="text-2xl">🎉</span>
          <div>
            <p className="font-bold">Order Placed Successfully!</p>
            <p className="text-emerald-100 text-xs">Your supplies will arrive at your village in 3–5 days.</p>
          </div>
          <button onClick={() => setOrderPlaced(false)} className="ml-2 text-emerald-200 hover:text-white">✕</button>
        </div>
      )}
    </div>
  );
}
