import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Bell,
  ShoppingCart,
  Package,
  MapPin,
  Phone,
  CheckCircle,
  Clock,
  User
} from "lucide-react";

export default function FarmerDashboard({ dark }) {
  const { api } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resNotifs, resOrders] = await Promise.all([
        api.get("/notifications"),
        api.get("/orders/my-purchases"),
      ]);

      setNotifications(resNotifs.data?.notifications || []);
      setOrders(resOrders.data || []);
    } catch (error) {
      console.error("Dashboard fetch failed", error);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchData();
    } catch (error) {
      console.error("Mark read failed", error);
    }
  };

  if (loading)
    return (
      <div className="p-10 sm:p-20 text-center">
        Loading Dashboard...
      </div>
    );

  return (
    <div
      className={`min-h-screen py-10 sm:py-12 px-4 sm:px-6 lg:px-8 ${dark ? "bg-gray-950 text-white" : "bg-stone-50 text-gray-900"
        }`}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* MAIN SECTION */}

        <div className="xl:col-span-2 space-y-6 sm:space-y-8">

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">
              Farmer Dashboard
            </h1>
            <p className={dark ? "text-gray-400" : "text-gray-600"}>
              Track your orders and updates
            </p>
          </div>

          {/* ORDERS */}

          <section>
            <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
              <Package className="text-emerald-500 w-5 h-5" />
              My Purchases
            </h2>

            <div className="space-y-4">
              {orders.length === 0 ? (
                <div
                  className={`p-6 sm:p-8 text-center rounded-3xl border ${dark
                      ? "bg-gray-900 border-gray-800"
                      : "bg-white border-stone-100"
                    }`}
                >
                  <ShoppingCart className="w-10 h-10 mx-auto text-gray-500 mb-2" />
                  <p className="text-gray-500">
                    You haven't purchased anything yet.
                  </p>
                </div>
              ) : (
                orders.map((o) => (
                  <div
                    key={o._id}
                    className={`p-5 sm:p-6 rounded-3xl border transition-all ${dark
                        ? "bg-gray-900 border-gray-800"
                        : "bg-white border-stone-100 shadow-sm"
                      }`}
                  >
                    {/* ORDER HEADER */}

                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                      <div>
                        <div className="text-xs sm:text-sm text-gray-500 mb-1">
                          Order #{o._id.slice(-6)}
                        </div>

                        <h3 className="font-bold text-sm sm:text-base">
                          {o.items.map((i) => i.name).join(", ")}
                        </h3>
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full self-start ${o.status === "pending"
                            ? "bg-amber-500/20 text-amber-500"
                            : o.status === "shipped"
                              ? "bg-blue-500/20 text-blue-500"
                              : "bg-emerald-500/20 text-emerald-500"
                          }`}
                      >
                        {o.status}
                      </span>
                    </div>

                    {/* SELLER INFO */}

                    <div
                      className={`grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 sm:p-4 rounded-2xl ${dark ? "bg-gray-950" : "bg-stone-50"
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-semibold">
                          {o.sellerId.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-semibold">
                          {o.sellerId.phone || "No contact info"}
                        </span>
                      </div>
                    </div>

                    {/* FOOTER */}

                    <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 px-1">
                      <div className="text-lg sm:text-xl font-black text-emerald-500">
                        ₹{o.totalAmount}
                      </div>

                      <div className="text-xs text-gray-500 italic">
                        Expected delivery: 2–3 days
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* NOTIFICATIONS */}

        <div className="space-y-6">
          <section
            className={`p-5 sm:p-6 rounded-3xl border h-fit ${dark
                ? "bg-gray-900 border-gray-800"
                : "bg-white border-stone-100 shadow-xl"
              }`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <Bell className="text-emerald-500 w-5 h-5" />
                Alerts
              </h2>

              {notifications.filter((n) => !n.isRead).length > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">
                  New
                </span>
              )}
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No new notifications
                </p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => !n.isRead && markRead(n._id)}
                    className={`p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer ${n.isRead
                        ? dark
                          ? "bg-transparent border-gray-800 opacity-60"
                          : "bg-transparent border-stone-100 opacity-60"
                        : dark
                          ? "bg-emerald-500/10 border-emerald-500/20"
                          : "bg-emerald-50 border-emerald-100"
                      }`}
                  >
                    <p
                      className={`text-sm mb-2 ${dark ? "text-gray-200" : "text-gray-800"
                        }`}
                    >
                      {n.message}
                    </p>

                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-gray-500">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>

                      {!n.isRead && (
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}