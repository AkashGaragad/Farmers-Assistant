import { useState, useMemo, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

// ── MongoDB-ready product schema ──────────────────────────────────────────────
// Each product maps 1-to-1 with a MongoDB document in the `products` collection.
// Fields: _id (ObjectId), name, brand, category, subCategory, certifications[],
//         pricePerUnit, unit, minOrder, stock, deliveryDays, images[], tags[],
//         description, isActive, createdAt
// ─────────────────────────────────────────────────────────────────────────────

// Initial empty list, will be populated from API
const INITIAL_PRODUCTS = [];

const CATEGORIES = [
  { id: "all", label: "All Products" },
  { id: "Fertiliser", label: "Fertilisers" },
  { id: "Pesticides", label: "Pesticides" },
];

const SUB_CATEGORIES = {
  Fertiliser: ["nitrogen", "phosphate", "potash", "npk"],
  Pesticides: ["insecticide", "fungicide", "herbicide"],
};

const SORT_OPTIONS = [
  { id: "popular", label: "Most Popular" },
  { id: "price_asc", label: "Price: Low to High" },
  { id: "price_desc", label: "Price: High to Low" },
  { id: "rating", label: "Top Rated" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const categoryColor = {
  Fertiliser: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  Pesticides: { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" },
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

function ProductCard({ product, onAddToCart, qty, viewMode, dark }) {
  const c = categoryColor[product.category] || categoryColor.Fertiliser;
  const isList = viewMode === "list";
  const accentGradient = product.category === "Fertiliser" ? "from-emerald-500 to-green-400" : "from-rose-500 to-orange-400";

  if (isList) {
    return (
      <div className={`p-4 rounded-3xl border transition-all duration-300 flex items-center gap-5 group ${dark ? "bg-gray-900 border-gray-800 hover:border-rose-500/50 hover:shadow-2xl hover:shadow-rose-500/10" : "bg-white border-stone-100 hover:shadow-xl hover:border-rose-500 shadow-sm"}`}>
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shrink-0 transition-transform duration-300 group-hover:scale-110 ${product.category === "Fertiliser" ? "bg-emerald-100/50" : "bg-orange-100/50"}`}>
          {subCatIcon[product.subCategory]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
             <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${c.bg} ${c.text}`}>{product.subCategory}</span>
             {product.tags.includes("bestseller") && <Badge text="Bestseller" color="amber" />}
          </div>
          <h3 className={`font-black text-base truncate ${dark ? "text-white" : "text-gray-900"}`}>{product.name}</h3>
          <p className="text-xs text-gray-400 font-medium">{product.brand}</p>
          <div className="flex flex-wrap gap-2 mt-2">
             {product.certifications.slice(0, 2).map(cert => (
               <span key={cert} className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${dark ? "bg-gray-800 text-gray-400" : "bg-stone-50 text-gray-500"}`}>✓ {cert}</span>
             ))}
          </div>
        </div>
        <div className="text-right shrink-0 px-4">
           <p className={`text-xl font-black ${dark ? "text-emerald-400" : "text-emerald-600"}`}>₹{(product.price || product.pricePerUnit).toLocaleString()}</p>
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">per {product.unit}</p>
        </div>
        <div className="shrink-0">
           {qty > 0 ? (
             <div className={`flex items-center gap-3 rounded-2xl p-1.5 px-3 border transition-all ${dark ? "bg-gray-950 border-gray-800" : "bg-rose-50 border-rose-100"}`}>
               <button onClick={() => onAddToCart(product, -1)} className={`w-8 h-8 rounded-xl font-black text-base flex items-center justify-center transition ${dark ? "bg-gray-800 text-rose-400 hover:bg-gray-700" : "bg-white text-rose-600 hover:bg-rose-100 shadow-sm"}`}>−</button>
               <span className={`font-black text-sm ${dark ? "text-white" : "text-rose-700"}`}>{qty}</span>
               <button onClick={() => onAddToCart(product, 1)} className="w-8 h-8 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black text-base flex items-center justify-center hover:shadow-lg hover:shadow-rose-500/40 transition">+</button>
             </div>
           ) : (
             <button
               onClick={() => onAddToCart(product, 1)}
               className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:shadow-xl hover:shadow-rose-500/40 hover:scale-105 active:scale-95 transition-all"
             >
               Add to Basket
             </button>
           )}
        </div>
      </div>
    );
  }

  return (
    <div className={`group relative rounded-[2.5rem] border transition-all duration-500 flex flex-col overflow-hidden h-full ${dark ? "bg-gray-900 border-gray-800 hover:border-rose-500/50 hover:shadow-2xl hover:shadow-rose-500/20" : "bg-white border-stone-200 shadow-sm hover:shadow-2xl hover:shadow-rose-500/10 hover:border-rose-500"}`}>
      {/* Top accent gradient line like home cards */}
      <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${accentGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      <div className="p-7 flex flex-col flex-1 gap-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${c.bg} ${c.text}`}>
                {product.subCategory}
              </span>
              {product.tags.includes("bestseller") && <Badge text="Bestseller" color="amber" />}
            </div>
            <h3 className={`font-black tracking-tight text-base leading-tight transition-colors duration-300 ${dark ? "text-white group-hover:text-rose-400" : "text-gray-900"}`}>{product.name}</h3>
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mt-1">{product.brand}</p>
          </div>
          <div className="text-right shrink-0">
            <p className={`text-2xl font-black ${dark ? "text-rose-400" : "text-rose-600"}`}>₹{(product.price || product.pricePerUnit).toLocaleString()}</p>
            <p className="text-[10px] uppercase font-black text-gray-400 letter-spacing-wide">/ {product.unit}</p>
          </div>
        </div>

        {/* Media Container */}
        <div className={`h-32 rounded-3xl flex items-center justify-center text-6xl relative overflow-hidden transition-all duration-500 group-hover:scale-[1.03] ${dark ? "bg-gray-950/50" : "bg-stone-50 shadow-inner"}`}>
           <span className="relative z-10 transition-transform duration-500 group-hover:rotate-12">{subCatIcon[product.subCategory]}</span>
           <div className={`absolute inset-0 opacity-5 bg-gradient-to-br transition-all duration-500 group-hover:opacity-15 ${accentGradient}`} />
           {/* Glow effect on hover */}
           <div className={`absolute -inset-10 bg-gradient-to-r ${accentGradient} blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-700`} />
        </div>

        {/* Description & Highlights */}
        <div className="space-y-3">
           <p className={`text-xs leading-relaxed line-clamp-2 font-medium ${dark ? "text-gray-400" : "text-gray-500"}`}>{product.description}</p>
           <ul className="flex flex-col gap-1.5">
              {product.certifications.slice(0, 2).map((h) => (
                <li key={h} className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-tight ${dark ? "text-gray-500" : "text-gray-400"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${accentGradient} flex-shrink-0`} />
                  {h}
                </li>
              ))}
           </ul>
        </div>

        {/* Stats Strip */}
        <div className={`flex items-center justify-between py-3 px-4 rounded-2xl border transition-colors ${dark ? "bg-gray-950/30 border-gray-800" : "bg-stone-50/50 border-stone-100"}`}>
          <StarRating rating={product.rating} />
          <div className="w-px h-3 bg-gray-500/20" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{product.reviews} SOLD</span>
          <div className="w-px h-3 bg-gray-500/20" />
          <span className={`font-black text-[10px] ${dark ? "text-gray-400" : "text-gray-500"}`}>
             🚚 {product.deliveryDays}D
          </span>
        </div>

        {/* Cart control */}
        <div className="mt-auto pt-2">
          {qty > 0 ? (
            <div className={`flex items-center justify-between rounded-2xl px-3 py-2 border transition-all ${dark ? "bg-gray-950 border-gray-800" : "bg-rose-50 border-rose-100 shadow-inner"}`}>
              <button 
                 onClick={() => onAddToCart(product, -1)} 
                 className={`w-10 h-10 rounded-xl font-black text-2xl flex items-center justify-center transition shadow-sm ${dark ? "bg-gray-800 text-rose-400 hover:bg-gray-700 hover:text-rose-300" : "bg-white text-rose-600 hover:bg-rose-100 border border-rose-200"}`}
              >−</button>
              <div className="text-center">
                <span className={`font-black text-lg ${dark ? "text-white" : "text-rose-700"}`}>{qty}</span>
                <p className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-black">{product.unit}</p>
              </div>
              <button 
                 onClick={() => onAddToCart(product, 1)} 
                 className="w-10 h-10 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black text-2xl flex items-center justify-center hover:shadow-xl hover:shadow-rose-500/40 hover:scale-105 active:scale-95 transition-all"
              >+</button>
            </div>
          ) : (
            <button
              onClick={() => onAddToCart(product, 1)}
              className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-[1.5rem] shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-rose-500/40 active:scale-95 group-hover:from-rose-600 group-hover:to-pink-600"
            >
              Add to Basket
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CartDrawer({ cart, onAddToCart, onClose, onCheckout, dark }) {
  const cartItems = cart;
  const total = cartItems.reduce((s, i) => s + (i.price || i.pricePerUnit) * i.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className={`absolute inset-0 backdrop-blur-sm ${dark ? "bg-black/60" : "bg-black/30"}`} onClick={onClose} />
      <div className={`relative w-full max-w-sm h-full flex flex-col shadow-2xl transition-colors duration-300 ${dark ? "bg-gray-950 border-l border-gray-800" : "bg-white"}`}>
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
              <div key={item._id} className={`flex gap-3 rounded-2xl p-3 border transition-colors ${dark ? "bg-gray-900 border-gray-800" : "bg-gray-50 border-gray-100"}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${item.category === "Fertiliser" ? "bg-emerald-100/30" : "bg-orange-100/30"}`}>
                  {subCatIcon[item.subCategory]}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-black text-xs truncate ${dark ? "text-white" : "text-gray-900"}`}>{item.name}</h4>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">₹{(item.price || item.pricePerUnit).toLocaleString()} / {item.unit}</p>
                  <div className="mt-2 flex items-center gap-4">
                    <button onClick={() => onAddToCart(item, -1)} className={`w-7 h-7 rounded-lg font-black text-sm flex items-center justify-center transition ${dark ? "bg-gray-800 text-gray-400 hover:text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"}`}>−</button>
                    <span className={`text-sm font-black ${dark ? "text-rose-400" : "text-gray-700"}`}>{item.quantity}</span>
                    <button onClick={() => onAddToCart(item, 1)} className="w-7 h-7 rounded-lg bg-rose-500 text-white font-black text-sm flex items-center justify-center hover:bg-rose-600">+</button>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-black text-xs ${dark ? "text-emerald-400" : "text-gray-900"}`}>₹{((item.price || item.pricePerUnit) * item.quantity).toLocaleString()}</p>
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
export default function BuySuppliesPage({ dark }) {
  const [category, setCategory] = useState("all");
  const [subFilter, setSubFilter] = useState(null);
  const [sortBy, setSortBy] = useState("popular");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [loading, setLoading] = useState(true);

  const { api, user, navigate } = useAuth(); // Added navigate

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get("/products");
        // Filter only agricultural supplies if needed, or show all
        const supplies = data.filter(p => p.category === "Fertiliser" || p.category === "Pesticides");
        setProducts(supplies);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    // Load cart from localStorage
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
  }, [api]);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const handleAddToCart = (product, qty) => {
    setCart((prev) => {
      const existing = prev.find((i) => i._id === product._id);
      let newCart;
      if (existing) {
        newCart = prev.map((i) =>
          i._id === product._id ? { ...i, quantity: Math.max(0, i.quantity + qty) } : i
        ).filter(i => i.quantity > 0); // Remove items with 0 quantity
      } else if (qty > 0) { // Only add if quantity is positive
        newCart = [...prev, { ...product, quantity: qty }];
      } else {
        newCart = prev; // If qty is negative and item not found, do nothing
      }
      localStorage.setItem("cart", JSON.stringify(newCart));
      return newCart;
    });
    setCartOpen(true);
  };

  const handleCheckout = async () => {
    try {
      if (cart.length === 0) return;

      // Group items by seller to create separate orders if multiple sellers
      const sellers = [...new Set(cart.map((i) => i.sellerId._id))];

      for (const sellerId of sellers) {
        const sellerItems = cart
          .filter((i) => i.sellerId._id === sellerId)
          .map((i) => ({
            productId: i._id,
            name: i.name,
            price: i.price || i.pricePerUnit, // Use pricePerUnit if price is not available
            quantity: i.quantity,
          }));

        const sellerTotal = sellerItems.reduce(
          (s, i) => s + i.price * i.quantity,
          0
        );

        await api.post("/orders", {
          items: sellerItems,
          totalAmount: sellerTotal,
          sellerId,
          shippingAddress: {
            address: user.address,
            phone: user.phone
          }
        });
      }

      localStorage.removeItem("cart");
      setCart([]);
      setCartOpen(false);
      setOrderPlaced(true); // Keep the toast for this page
      // alert("Order placed successfully! 🎉 Check your dashboard for updates."); // Removed alert to use toast
      // navigate("/farmer-dashboard"); // Removed navigation to stay on page and show toast
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Failed to place order. Please try again.");
    }
  };

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (subFilter && p.subCategory !== subFilter) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
          !p.brand?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    if (sortBy === "popular") list = [...list].sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
    else if (sortBy === "price_asc") list = [...list].sort((a, b) => (a.price || a.pricePerUnit) - (b.price || b.pricePerUnit));
    else if (sortBy === "price_desc") list = [...list].sort((a, b) => (b.price || b.pricePerUnit) - (a.price || b.pricePerUnit));
    else if (sortBy === "rating") list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));

    return list;
  }, [category, subFilter, sortBy, search, products]); // Added products to dependency array

  const subCats = category !== "all" ? SUB_CATEGORIES[category] || [] : [];

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans relative ${dark ? "bg-gray-950 text-gray-100" : "bg-stone-50 text-gray-900"}`}>
      
      {/* Background blobs like home page */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-rose-500/5 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-green-400/10 blur-3xl pointer-events-none" />

      {/* Hero Header */}
      <div className={`relative pt-12 pb-16 px-4 overflow-hidden`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-8">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${dark ? "bg-emerald-950/60 text-emerald-300 border-emerald-700 shadow-lg shadow-emerald-500/10" : "bg-emerald-100 text-emerald-700 border-emerald-300"}`}>🌱 Village Sourcing</span>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${dark ? "bg-rose-950/60 text-rose-300 border-rose-700" : "bg-rose-100 text-rose-700 border-rose-300"}`}>💵 Pay at Door</span>
                <Badge text="ISI Certified" color="blue" />
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 tracking-tighter leading-none">
                <span className={dark ? "text-white" : "text-gray-900"}>Premium</span>
                <br />
                <span className="bg-gradient-to-r from-rose-500 via-rose-400 to-pink-500 bg-clip-text text-transparent">
                  Agricultural Supplies
                </span>
              </h1>
              <p className={`text-lg max-w-xl leading-relaxed ${dark ? "text-gray-400" : "text-gray-600"}`}>
                Government-approved fertilisers and pesticides delivered directly to your doorstep. Save time, money, and guarantee your yield quality.
              </p>
            </div>

            {/* Cart Counter Card */}
            <div 
              onClick={() => setCartOpen(true)}
              className={`group cursor-pointer p-6 rounded-[2.5rem] border flex flex-col items-center gap-4 transition-all duration-300 relative overflow-hidden shrink-0 w-full md:w-48 ${dark ? "bg-gray-900 border-gray-800 hover:border-rose-500 shadow-2xl" : "bg-white border-stone-200 hover:shadow-2xl shadow-sm"}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-4xl shadow-inner ${dark ? "bg-gray-950" : "bg-stone-50"}`}>
                 🛒
                 {cartCount > 0 && <span className="absolute top-4 right-4 w-6 h-6 bg-rose-500 text-white text-[11px] font-black rounded-full flex items-center justify-center animate-bounce">{cartCount}</span>}
              </div>
              <div className="text-center relative z-10">
                <p className={`text-sm font-black uppercase tracking-widest ${dark ? "text-white" : "text-gray-900"}`}>My Basket</p>
                <p className="text-[10px] text-gray-500 font-bold mt-0.5">₹{cart.reduce((s, i) => s + (i.price || i.pricePerUnit) * i.quantity, 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative max-w-2xl">
            <div className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${dark ? "text-rose-500" : "text-rose-400"}`}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1016.65 16.65z" /></svg>
            </div>
            <input
              type="text"
              placeholder="Search specific brands or compounds..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-14 pr-6 py-4.5 rounded-[2rem] text-lg font-medium border transition-all ${dark ? "bg-gray-900 border-gray-800 text-white placeholder-gray-600 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10" : "bg-white border-stone-200 text-gray-900 shadow-xl focus:ring-4 focus:ring-rose-500/5 focus:border-rose-400"}`}
            />
          </div>
        </div>
      </div>

      {/* Sub-Stats Strip */}
      <div className={`py-8 border-y transition-all ${dark ? "bg-gray-900/40 border-gray-800" : "bg-white border-stone-100"}`}>
         <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { val: "24h", label: "Dispatch Time", color: "text-emerald-500" },
              { val: "100%", label: "Lab Tested", color: "text-rose-500" },
              { val: "50k+", label: "Happy Farmers", color: "text-blue-500" },
              { val: "0% ", label: "Platform Fee", color: "text-amber-500" }
            ].map(s => (
              <div key={s.label} className="text-center group">
                 <p className={`text-2xl font-black transition-transform group-hover:scale-110 ${s.color}`}>{s.val}</p>
                 <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
         </div>
      </div>

      {/* Control Bar */}
      <div className={`sticky top-0 z-40 backdrop-blur-md border-b transition-all duration-300 ${dark ? "bg-gray-950/80 border-gray-800 px-4" : "bg-white/80 border-gray-100 px-4 shadow-sm"}`}>
        <div className="max-w-6xl mx-auto py-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => { setCategory(c.id); setSubFilter(null); }}
                className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-200 border ${category === c.id 
                  ? "bg-rose-500 border-rose-400 text-white shadow-lg shadow-rose-500/30" 
                  : dark ? "bg-gray-900 border-gray-800 text-gray-400 hover:text-white" : "bg-gray-100 border-stone-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className={`flex items-center p-1 rounded-2xl border ${dark ? "bg-gray-900 border-gray-800" : "bg-gray-100 border-gray-200 shadow-inner"}`}>
               <button 
                 onClick={() => setViewMode("grid")}
                 className={`p-2 rounded-xl transition-all ${viewMode === "grid" ? (dark ? "bg-gray-800 text-white shadow-lg" : "bg-white text-rose-500 shadow-md") : "text-gray-500 hover:text-rose-400"}`}
                 title="Grid View"
               >
                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
               </button>
               <button 
                 onClick={() => setViewMode("list")}
                 className={`p-2 rounded-xl transition-all ${viewMode === "list" ? (dark ? "bg-gray-800 text-white shadow-lg" : "bg-white text-rose-500 shadow-md") : "text-gray-500 hover:text-rose-400"}`}
                 title="List View"
               >
                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
               </button>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`text-xs font-black uppercase tracking-widest border rounded-[1rem] px-4 py-2 focus:outline-none transition-all ${dark ? "bg-gray-900 border-gray-800 text-white focus:border-rose-500" : "bg-white border-stone-200 text-gray-600 focus:ring-2 focus:ring-rose-300"}`}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sub-category Pills */}
      {subCats.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 py-4 flex gap-3 overflow-x-auto scrollbar-hide">
           {subCats.map((s) => (
            <button
              key={s}
              onClick={() => setSubFilter(subFilter === s ? null : s)}
              className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${subFilter === s ? "bg-gray-800 border-gray-700 text-white" : dark ? "bg-gray-900/50 border-gray-800 text-gray-500 hover:text-rose-400 hover:border-rose-400" : "bg-white text-gray-500 border-stone-200 hover:border-gray-400"}`}
            >
              {subCatIcon[s]} {s}
            </button>
          ))}
        </div>
      )}

      {/* Products Display */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        {loading ? (
          <div className="text-center py-24 text-gray-400">
            <div className="animate-spin w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading supplies...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-5xl mb-4">🌾</p>
            <p className="font-semibold text-lg text-gray-600">No products found</p>
            <p className="text-sm mt-1">Try a different search or category</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8 px-2">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">{filtered.length} products available</p>
               <div className="h-px bg-gray-500/10 flex-1 ml-4" />
            </div>
            <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "flex flex-col gap-4"}>
              {filtered.map((p) => (
                <ProductCard
                  key={p._id}
                  product={p}
                  onAddToCart={handleAddToCart}
                  qty={cart.find(i => i._id === p._id)?.quantity || 0}
                  viewMode={viewMode}
                  dark={dark}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Trust Bar */}
      <div className={`border-t transition-all ${dark ? "bg-gray-900/50 border-gray-800" : "bg-white border-stone-100"}`}>
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: "🛡️", title: "100% Certified", sub: "ISI & CIB approved only", accent: "from-blue-500 to-cyan-400" },
            { icon: "📦", title: "Village Delivery", sub: "3–5 day doorstep delivery", accent: "from-emerald-500 to-teal-400" },
            { icon: "🤝", title: "Cash on Delivery", sub: "Pay when you receive", accent: "from-amber-500 to-yellow-400" },
            { icon: "🔄", title: "Easy Returns", sub: "7-day return policy", accent: "from-rose-500 to-pink-400" },
          ].map((t) => (
            <div key={t.title} className={`p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden group hover:scale-[1.02] ${dark ? "bg-gray-950/50 border-gray-800 hover:border-emerald-500" : "bg-white border-stone-100 hover:shadow-xl hover:border-emerald-500"}`}>
              <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r ${t.accent} rounded-b-full opacity-50 group-hover:opacity-100 transition-opacity`} />
              <div className="text-3xl mb-4">{t.icon}</div>
              <p className={`font-black text-sm uppercase tracking-widest ${dark ? "text-white" : "text-gray-900"}`}>{t.title}</p>
              <p className="text-[10px] text-gray-500 font-bold mt-1">{t.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Drawer */}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          onAddToCart={handleAddToCart}
          onClose={() => setCartOpen(false)}
          onCheckout={handleCheckout}
          dark={dark}
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
