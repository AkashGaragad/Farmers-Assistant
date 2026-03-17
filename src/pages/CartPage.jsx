import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Trash2,
  Plus,
  Minus,
  CreditCard,
  MapPin,
  Phone,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CartPage({ dark }) {
  const { api } = useAuth();
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [shipping, setShipping] = useState({ phone: "", address: "" });

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(items);
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get("/profile");
      setShipping({
        phone: data.phone || "",
        address: data.address || "",
      });
    } catch (e) { }
  };

  const updateQty = (id, delta) => {
    const newCart = cart.map((item) => {
      if (item._id === id) {
        return {
          ...item,
          quantity: Math.max(1, item.quantity + delta),
        };
      }
      return item;
    });

    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const removeItem = (id) => {
    const newCart = cart.filter((item) => item._id !== id);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    if (!shipping.phone || !shipping.address) {
      alert("Please provide shipping details!");
      return;
    }

    setLoading(true);

    try {
      const sellers = [...new Set(cart.map((i) => i.sellerId._id))];

      for (const sellerId of sellers) {
        const sellerItems = cart
          .filter((i) => i.sellerId._id === sellerId)
          .map((i) => ({
            productId: i._id,
            name: i.name,
            price: i.price,
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
          shippingAddress: shipping,
        });
      }

      localStorage.removeItem("cart");
      setCart([]);

      alert("Orders placed successfully! 🎉");

      navigate("/farmer-dashboard");
    } catch (error) {
      console.error("Checkout failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen py-10 sm:py-12 px-4 sm:px-6 lg:px-8 ${dark ? "bg-gray-950 text-white" : "bg-stone-50 text-gray-900"
        }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row gap-8 lg:gap-12">

        {/* CART ITEMS */}

        <div className="flex-1 space-y-6 sm:space-y-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
              Your Shopping Cart
            </h1>
            <p className={dark ? "text-gray-400" : "text-gray-600"}>
              Review items before checkout
            </p>
          </div>

          <div className="space-y-4">
            {cart.length === 0 ? (
              <div className="p-10 sm:p-20 text-center opacity-40">
                <ShoppingBag className="w-14 h-14 mx-auto mb-4" />
                <p className="text-lg font-bold">Your cart is empty.</p>

                <button
                  onClick={() => navigate("/marketplace")}
                  className="mt-4 text-emerald-500 font-bold underline"
                >
                  Go to Marketplace
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item._id}
                  className={`p-4 sm:p-5 rounded-3xl border flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 ${dark
                      ? "bg-gray-900 border-gray-800"
                      : "bg-white border-stone-100 shadow-sm"
                    }`}
                >

                  {/* PRODUCT ICON */}

                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-stone-100 flex items-center justify-center text-2xl sm:text-3xl shrink-0">
                    {item.category === "Fertiliser" ? "🧪" : "🌱"}
                  </div>

                  {/* PRODUCT INFO */}

                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-bold text-base sm:text-lg">
                      {item.name}
                    </h3>

                    <p className="text-xs text-gray-500">
                      Seller: {item.sellerId.name}
                    </p>

                    <div className="text-emerald-500 font-black mt-1 text-sm sm:text-base">
                      ₹{item.price}
                    </div>
                  </div>

                  {/* QUANTITY */}

                  <div className="flex items-center gap-3 bg-gray-500/5 p-2 rounded-xl border border-gray-500/10">
                    <button
                      onClick={() => updateQty(item._id, -1)}
                      className="p-2 rounded-lg hover:bg-emerald-500 hover:text-white transition"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <span className="font-bold w-6 text-center">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => updateQty(item._id, 1)}
                      className="p-2 rounded-lg hover:bg-emerald-500 hover:text-white transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* PRICE */}

                  <div className="text-center sm:text-right sm:w-24">
                    <div className="text-lg font-black">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>

                  {/* DELETE */}

                  <button
                    onClick={() => removeItem(item._id)}
                    className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ORDER SUMMARY */}

        <div className="w-full xl:w-96 space-y-6">
          <div
            className={`p-6 sm:p-8 rounded-3xl border sticky top-28 ${dark
                ? "bg-gray-900 border-gray-800"
                : "bg-white border-stone-200 shadow-xl"
              }`}
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-6">
              Order Summary
            </h2>

            {/* PRICE DETAILS */}

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-500 font-medium">
                <span>Subtotal</span>
                <span className={dark ? "text-white" : "text-gray-900"}>
                  ₹{total}
                </span>
              </div>

              <div className="flex justify-between text-gray-500 font-medium border-b border-gray-300 pb-4">
                <span>Village Delivery</span>
                <span className="text-emerald-500 font-bold">
                  FREE
                </span>
              </div>

              <div className="flex justify-between items-end">
                <span className="font-bold uppercase tracking-widest text-xs">
                  Total Amount
                </span>

                <span className="text-2xl sm:text-3xl font-black text-emerald-500">
                  ₹{total}
                </span>
              </div>
            </div>

            {/* SHIPPING */}

            <div className="space-y-4 mb-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                Delivery Details
              </h3>

              <div className="space-y-3">

                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-500" />

                  <input
                    type="text"
                    placeholder="Contact Phone"
                    value={shipping.phone}
                    onChange={(e) =>
                      setShipping({
                        ...shipping,
                        phone: e.target.value,
                      })
                    }
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${dark
                        ? "bg-gray-950 border-gray-800"
                        : "bg-stone-50 border-stone-200"
                      }`}
                  />
                </div>

                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-500" />

                  <textarea
                    placeholder="Village, Landmark, District"
                    value={shipping.address}
                    onChange={(e) =>
                      setShipping({
                        ...shipping,
                        address: e.target.value,
                      })
                    }
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${dark
                        ? "bg-gray-950 border-gray-800"
                        : "bg-stone-50 border-stone-200"
                      }`}
                  />
                </div>
              </div>
            </div>

            {/* CHECKOUT BUTTON */}

            <button
              onClick={handleCheckout}
              disabled={loading || cart.length === 0}
              className={`w-full py-3 sm:py-4 rounded-2xl bg-emerald-600 text-white font-bold sm:font-black text-base sm:text-lg flex items-center justify-center gap-2 transition-all hover:bg-emerald-700 ${loading || cart.length === 0
                  ? "opacity-50 cursor-not-allowed"
                  : ""
                }`}
            >
              <CreditCard className="w-5 h-5" />

              {loading ? "Processing..." : "Place Order (COD)"}

              <ArrowRight className="ml-auto w-5 h-5" />
            </button>

            <p className="mt-4 text-[10px] text-center text-gray-500 uppercase tracking-widest font-bold">
              Payments are collected on delivery
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}