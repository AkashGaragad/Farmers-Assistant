import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { ShoppingCart, Search, Package } from "lucide-react";

export default function Marketplace({ dark }) {
  const { api, user } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    fetchProducts();
    updateCartCount();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/products");
      setProducts(data);
    } catch (error) {
      console.error("Marketplace fetch failed", error);
    } finally {
      setLoading(false);
    }
  };

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartCount(cart.length);
  };

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    const existing = cart.find((item) => item._id === product._id);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    updateCartCount();

    alert("Added to cart! 🛒");
  };

  const filteredProducts = products.filter(
    (p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "All" || p.category === category;
      return matchesSearch && matchesCategory;
    }
  );

  if (loading)
    return (
      <div className="p-10 sm:p-20 text-center">
        Opening Marketplace...
      </div>
    );

  return (
    <div
      className={`min-h-screen py-10 sm:py-12 px-4 sm:px-6 lg:px-8 ${dark ? "bg-gray-950 text-white" : "bg-stone-50 text-gray-900"
        }`}
    >
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">

          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
              Marketplace
            </h1>

            <p className={dark ? "text-gray-400" : "text-gray-600"}>
              Genuine supplies delivered to your village
            </p>
          </div>

          {/* SEARCH + CART */}

          <div className="flex w-full lg:w-auto gap-3 items-center">

            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />

              <input
                type="text"
                placeholder="Search fertiliser, seeds, tools..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${dark
                  ? "bg-gray-900 border-gray-800"
                  : "bg-white border-stone-200 shadow-sm"
                  }`}
              />
            </div>

            {user?.role === "farmer" && (
              <button
                onClick={() => (window.location.href = "/cart")}
                className="relative p-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 transition"
              >
                <ShoppingCart className="w-6 h-6" />

                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* CATEGORY BAR */}

        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {[
            "All",
            "Fertiliser",
            "Seeds",
            "Pesticides",
            "Tools",
            "Machines",
          ].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-semibold border transition ${category === cat
                ? (dark ? "bg-emerald-600 border-emerald-500 text-white" : "bg-emerald-600 border-emerald-500 text-white")
                : (dark ? "border-gray-800 hover:border-emerald-500" : "border-stone-200 bg-white hover:border-emerald-500")
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* PRODUCTS GRID */}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">

          {filteredProducts.map((p) => (
            <div
              key={p._id}
              className={`group flex flex-col rounded-3xl border overflow-hidden transition ${dark
                ? "bg-gray-900 border-gray-800 hover:border-emerald-500"
                : "bg-white border-stone-100 shadow-sm hover:shadow-xl hover:border-emerald-500"
                }`}
            >

              {/* IMAGE AREA */}

              <div className="h-40 sm:h-48 bg-stone-200 flex items-center justify-center text-4xl relative">
                {p.category === "Fertiliser"
                  ? "🧪"
                  : p.category === "Seeds"
                    ? "🌱"
                    : "📦"}

                <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-black/60 text-[10px] font-bold text-white uppercase">
                  {p.category}
                </div>
              </div>

              {/* CONTENT */}

              <div className="p-4 sm:p-5 flex flex-col flex-1">

                <h3 className="font-bold text-base sm:text-lg mb-1">
                  {p.name}
                </h3>

                <p
                  className={`text-xs mb-4 line-clamp-2 ${dark ? "text-gray-500" : "text-gray-400"
                    }`}
                >
                  {p.description}
                </p>

                {/* SELLER */}

                <div className="flex items-center gap-2 mb-4 p-2 rounded-xl bg-gray-600/5 border border-gray-600/10">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-xs">
                    🏪
                  </div>

                  <div className="text-[10px]">
                    <div className="font-bold text-emerald-500">
                      {p.sellerId?.name}
                    </div>

                    <div className="text-gray-500">
                      {p.sellerId?.address}
                    </div>
                  </div>
                </div>

                {/* PRICE */}

                <div className="flex items-center justify-between mt-auto">

                  <div>
                    <span className="text-xl sm:text-2xl font-black text-emerald-500">
                      ₹{p.price}
                    </span>

                    <span className="text-xs text-gray-400">
                      /{p.unit}
                    </span>
                  </div>

                  {user?.role === "farmer" && (
                    <button
                      onClick={() => addToCart(p)}
                      className="p-2 sm:p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* EMPTY STATE */}

        {filteredProducts.length === 0 && (
          <div className="p-10 sm:p-20 text-center opacity-40">
            <Package className="w-14 h-14 mx-auto mb-4" />

            <p className="text-lg sm:text-xl font-bold">
              No products found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Plus({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={3}
        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
      />
    </svg>
  );
}