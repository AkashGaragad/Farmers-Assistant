import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";


// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n) { return "₹" + n.toLocaleString("en-IN"); }
function fmtTime(s) {
  if (s <= 0) return "Ended";
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}
function pctGain(base, cur) { return Math.round(((cur - base) / base) * 100); }

// ─── Countdown hook ───────────────────────────────────────────────────────────
function useCountdown(initial) {
  const [t, setT] = useState(initial);
  useEffect(() => {
    if (t <= 0) return;
    const i = setInterval(() => setT((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(i);
  }, [t]);
  return t;
}

// ─── Components ───────────────────────────────────────────────────────────────

function Pulse({ on }) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full bg-red-500 transition-opacity duration-300 ${on ? "opacity-100" : "opacity-20"}`} />
  );
}

function Timer({ seconds, dark }) {
  const t = useCountdown(seconds);
  const urgent = t < 60;
  return (
    <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${urgent ? "bg-red-500/20 text-red-400 animate-pulse" : (dark ? "bg-gray-800 text-gray-300" : "bg-stone-100 text-gray-500")}`}>
      ⏱ {fmtTime(t)}
    </span>
  );
}

function Badge({ children, color = "gray", dark }) {
  const map = dark ? {
    gray: "bg-gray-800 text-gray-400",
    green: "bg-emerald-500/15 text-emerald-400",
    orange: "bg-orange-500/15 text-orange-400",
    red: "bg-red-500/15 text-red-400",
    blue: "bg-blue-500/15 text-blue-400",
  } : {
    gray: "bg-stone-100 text-stone-500",
    green: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
    red: "bg-red-50 text-red-600",
    blue: "bg-blue-50 text-blue-600",
  };
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${map[color]}`}>{children}</span>;
}

// ─── Bid Modal ────────────────────────────────────────────────────────────────
function BidModal({ lot, onClose, onBid, dark }) {
  const [amount, setAmount] = useState(lot.currentBid + 50);
  const [step] = useState(50);
  const [submitted, setSubmitted] = useState(false);

  function handleBid() {
    if (amount <= lot.currentBid) return;
    onBid(lot._id || lot.id, amount);
    setSubmitted(true);
    setTimeout(onClose, 1500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`relative w-full max-w-md border rounded-3xl overflow-hidden shadow-2xl ${dark ? "bg-gray-950 border-gray-800" : "bg-white border-stone-100"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* top accent */}
        <div className="h-0.5 bg-gradient-to-r from-orange-500 to-red-500 w-full" />
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">🎉</div>
              <p className={`text-xl font-bold ${dark ? "text-white" : "text-gray-900"}`}>Bid Placed!</p>
              <p className={`${dark ? "text-gray-400" : "text-gray-500"} text-sm mt-1`}>You bid {fmt(amount)} on {lot.crop}</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className={`${dark ? "text-gray-500" : "text-gray-400"} text-xs uppercase tracking-widest`}>Placing Bid On</p>
                  <h3 className={`text-xl font-extrabold mt-0.5 ${dark ? "text-white" : "text-gray-900"}`}>{lot.emoji} {lot.crop}</h3>
                  <p className={`${dark ? "text-gray-500" : "text-gray-400"} text-xs mt-0.5`}>by {lot.farmer} · {lot.qty} {lot.unit}</p>
                </div>
                <button onClick={onClose} className={`${dark ? "text-gray-600 hover:text-white" : "text-gray-400 hover:text-gray-700"} text-xl transition-colors`}>✕</button>
              </div>

              <div className={`rounded-2xl p-4 mb-5 ${dark ? "bg-gray-900" : "bg-stone-50"}`}>
                <div className="flex justify-between text-sm">
                  <span className={dark ? "text-gray-500" : "text-gray-400"}>Base Price</span>
                  <span className={`font-semibold ${dark ? "text-gray-300" : "text-gray-700"}`}>{fmt(lot.basePrice)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className={dark ? "text-gray-500" : "text-gray-400"}>Highest Bid</span>
                  <span className="text-emerald-400 font-bold">{fmt(lot.currentBid)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className={dark ? "text-gray-500" : "text-gray-400"}>Total Bids</span>
                  <span className={`font-semibold ${dark ? "text-gray-300" : "text-gray-700"}`}>{lot.bids} bids</span>
                </div>
              </div>

              <label className={`block text-xs uppercase tracking-widest mb-2 ${dark ? "text-gray-400" : "text-gray-500"}`}>Your Bid Amount</label>
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => setAmount((a) => Math.max(lot.currentBid + step, a - step))}
                  className={`w-10 h-10 rounded-xl font-bold transition-colors ${dark ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-stone-100 text-gray-600 hover:bg-stone-200"}`}
                >−</button>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className={`flex-1 text-center border rounded-xl px-4 py-2.5 font-bold text-lg focus:outline-none focus:border-orange-500 ${dark ? "bg-gray-900 border-gray-700 text-white" : "bg-stone-50 border-stone-200 text-gray-900"}`}
                />
                <button
                  onClick={() => setAmount((a) => a + step)}
                  className={`w-10 h-10 rounded-xl font-bold transition-colors ${dark ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-stone-100 text-gray-600 hover:bg-stone-200"}`}
                >+</button>
              </div>
              {amount <= lot.currentBid && (
                <p className="text-red-400 text-xs mb-3">⚠ Bid must be higher than current bid ({fmt(lot.currentBid)})</p>
              )}

              <button
                onClick={handleBid}
                disabled={amount <= lot.currentBid}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-sm hover:from-orange-400 hover:to-red-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed mt-2"
              >
                🔨 Place Bid · {fmt(amount)}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Lot Card (Buyer) ────────────────────────────────────────────────────────────────
function LotCard({ lot, pulse, onBid, dark }) {
  const gain = pctGain(lot.basePrice, lot.currentBid);
  const isSold = lot.status === "sold";
  return (
    <div className={`group relative border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col
      ${dark ? "bg-gray-900" : "bg-white"}
      ${isSold
        ? (dark ? "border-gray-700 opacity-75" : "border-stone-200 opacity-75")
        : (dark ? "border-gray-800 hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-0.5" : "border-stone-200 hover:border-orange-400 hover:shadow-xl hover:shadow-orange-200/50 hover:-translate-y-0.5")
      }`}>
      {/* color band */}
      <div className={`h-0.5 bg-gradient-to-r ${isSold ? "from-gray-600 to-gray-500" : "from-orange-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"}`} />

      <div className="p-5 flex-1 flex flex-col">
        {/* header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{lot.emoji}</span>
            <div>
              <h3 className={`font-bold text-base leading-tight ${dark ? "text-white" : "text-gray-900"}`}>{lot.crop}</h3>
              <p className={`${dark ? "text-gray-500" : "text-gray-400"} text-xs`}>{lot.qty} {lot.unit} · {lot.location || "N/A"}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {isSold ? (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${dark ? "bg-gray-700 text-gray-400" : "bg-stone-100 text-stone-400"}`}>
                ✅ SOLD
              </span>
            ) : (
              <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors duration-300 ${pulse ? "bg-red-500/20 text-red-400" : "bg-red-500/10 text-red-300"}`}>
                <Pulse on={pulse} /> LIVE
              </span>
            )}
            {lot.verified && <Badge color="green" dark={dark}>✓ Verified</Badge>}
          </div>
        </div>

        {/* tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {(lot.tags || []).map((t) => (
            <Badge key={t} color="orange" dark={dark}>{t}</Badge>
          ))}
          <Badge color="blue" dark={dark}>Grade {lot.grade}</Badge>
        </div>

        {/* price row */}
        <div className={`rounded-xl p-3 mb-3 flex justify-between items-center ${dark ? "bg-gray-950" : "bg-stone-50"}`}>
          <div>
            <p className={`${dark ? "text-gray-600" : "text-gray-400"} text-[10px] uppercase tracking-wider`}>Base</p>
            <p className={`${dark ? "text-gray-400" : "text-gray-700"} text-sm font-semibold`}>{fmt(lot.basePrice)}</p>
          </div>
          <div className="text-right">
            <p className={`${dark ? "text-gray-600" : "text-gray-400"} text-[10px] uppercase tracking-wider`}>Highest Bid</p>
            <p className="text-emerald-400 text-lg font-extrabold">{fmt(lot.currentBid)}</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2 py-1 text-center">
            <p className="text-emerald-400 text-sm font-extrabold">+{gain}%</p>
            <p className="text-emerald-600 text-[9px]">gain</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className={`${dark ? "text-gray-600" : "text-gray-400"} text-xs`}>🔨 {lot.bids} bids placed</p>
          {!isSold && <Timer seconds={lot.endsIn} dark={dark} />}
        </div>

        <div className={`${dark ? "text-gray-600" : "text-gray-400"} text-xs mb-4 flex items-center gap-1`}>
          <span>🧑‍🌾</span>
          <span className={dark ? "text-gray-500" : "text-gray-600"}>{lot.farmerName || lot.farmer || "Anonymous"}</span>
          <span className={`ml-auto ${dark ? "text-gray-700" : "text-gray-300"}`}>{lot.farmerId}</span>
        </div>

        {/* Place Bid — hidden when lot is sold */}
        {isSold ? (
          <div className={`mt-auto w-full py-2.5 rounded-xl border text-sm font-semibold text-center ${dark ? "bg-gray-800 border-gray-700 text-gray-500" : "bg-stone-100 border-stone-200 text-stone-400"}`}>
            🔒 Sold for {fmt(lot.currentBid)} — Closed
          </div>
        ) : (
          <button
            onClick={() => onBid(lot)}
            className="mt-auto w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold hover:from-orange-400 hover:to-red-400 transition-all hover:shadow-lg hover:shadow-orange-500/30"
          >
            🔨 Place Bid
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Buyer View ───────────────────────────────────────────────────────────────
function BuyerView({ pulse, dark }) {
  const [lots, setLots] = useState([]);
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("ending");
  const [bidModal, setBidModal] = useState(null);
  const [myBids, setMyBids] = useState([]);
  const [loading, setLoading] = useState(true);

  const { api } = useAuth();

  useEffect(() => {
    fetchLots();
  }, []);

  const fetchLots = async () => {
    try {
      const { data } = await api.get('/auction');
      setLots(data);
    } catch (error) {
      console.error("Failed to fetch lots", error);
    } finally {
      setLoading(false);
    }
  };

  const crops = ["All", ...new Set(lots.map((l) => l.crop))];

  async function handleBid(id, amount) {
    try {
      const { data } = await api.post(`/auction/${id}/bid`, { amount });

      // Update local state to reflect the new bid
      setLots((prev) =>
        prev.map((l) => l._id === id ? { ...l, currentBid: data.lot.currentBid, bids: data.lot.bids } : l)
      );
      setMyBids((prev) => [{ id, amount, crop: lots.find((l) => l._id === id)?.crop, ts: new Date() }, ...prev]);
    } catch (error) {
      console.error("Bid failed:", error.response?.data?.message || error.message);
      alert(error.response?.data?.message || "Failed to place bid");
    }
  }

  const filtered = lots
    .filter((l) => filter === "All" || l.crop === filter)
    .sort((a, b) => {
      if (sort === "ending") return a.endsIn - b.endsIn;
      if (sort === "price_asc") return a.currentBid - b.currentBid;
      if (sort === "price_desc") return b.currentBid - a.currentBid;
      if (sort === "bids") return b.bids - a.bids;
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* My Bids Strip */}
      {myBids.length > 0 && (
        <div className={`border rounded-2xl p-4 ${dark ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-50 border-emerald-200"}`}>
          <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${dark ? "text-emerald-400" : "text-emerald-700"}`}>Your Active Bids</p>
          <div className="flex flex-wrap gap-2">
            {myBids.slice(0, 4).map((b, i) => (
              <span key={i} className={`text-xs px-3 py-1.5 rounded-lg font-medium ${dark ? "bg-gray-900 text-gray-300" : "bg-white text-gray-600 border border-stone-100"}`}>
                {lots.find((l) => l._id === b.id)?.emoji} {b.crop} · <span className={`${dark ? "text-emerald-400" : "text-emerald-600"}`}>{fmt(b.amount)}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {crops.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${filter === c
                ? (dark ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30" : "bg-orange-500 text-white shadow-lg")
                : (dark ? "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white" : "bg-stone-100 text-gray-500 hover:bg-stone-200")
                }`}
            >
              {c}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className={`border text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500 ${dark ? "bg-gray-800 border-gray-700 text-gray-300" : "bg-white border-stone-200 text-gray-600"}`}
        >
          <option value="ending">Ending Soon</option>
          <option value="bids">Most Bids</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((lot) => (
            <LotCard key={lot._id} lot={lot} pulse={pulse} onBid={setBidModal} dark={dark} />
          ))}
        </div>
      ) : (
        <div className={`text-center py-16 border rounded-2xl ${dark ? "bg-gray-900 border-gray-800" : "bg-white border-stone-100 shadow-sm"}`}>
          <div className="text-4xl mb-3">🏷️</div>
          <p className={`font-bold ${dark ? "text-white" : "text-gray-900"}`}>No pure active lots found.</p>
          <p className={`${dark ? "text-gray-500" : "text-gray-400"} text-sm mt-1`}>Check back later or change your filters.</p>
        </div>
      )}

      {bidModal && (
        <BidModal lot={bidModal} onClose={() => setBidModal(null)} onBid={handleBid} dark={dark} />
      )}
    </div>
  );
}

// ─── Farmer View ──────────────────────────────────────────────────────────────
function FarmerView({ pulse, dark }) {
  const [lots, setLots] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ crop: "", emoji: "🌾", qty: "", unit: "Qtl", basePrice: "", grade: "A" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [approveSuccess, setApproveSuccess] = useState(null); // lotId of last approved

  const { api } = useAuth();

  useEffect(() => {
    fetchLots();
  }, []);

  const fetchLots = async () => {
    try {
      const { data } = await api.get('/auction/farmer');
      setLots(data);
    } catch (error) {
      console.error("Failed to fetch farmer lots", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: "Active Lots", value: lots.filter((l) => l.status === "live").length, color: "text-orange-400" },
    { label: "Total Bids Received", value: lots.reduce((s, l) => s + l.bids, 0), color: "text-blue-400" },
    { label: "Lots Sold", value: lots.filter((l) => l.status === "sold").length, color: "text-emerald-400" },
    {
      label: "Avg. Price Gain",
      value: (() => {
        const active = lots.filter((l) => l.currentBid > l.basePrice);
        if (!active.length) return "—";
        const avg = active.reduce((s, l) => s + pctGain(l.basePrice, l.currentBid), 0) / active.length;
        return `+${Math.round(avg)}%`;
      })(),
      color: "text-emerald-400",
    },
  ];

  async function handleAddLot() {
    if (!form.crop || !form.qty || !form.basePrice) return;

    try {
      const { data } = await api.post('/auction', form);
      setLots((p) => [data, ...p]);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setShowForm(false);
        setForm({ crop: "", emoji: "🌾", qty: "", unit: "Qtl", basePrice: "", grade: "A" });
      }, 1800);
    } catch (error) {
      console.error("Failed to add lot:", error.response?.data?.message || error.message);
      alert(error.response?.data?.message || "Failed to add lot");
    }
  }

  async function handleApproveBid(lotId) {
    setApprovingId(lotId);
    try {
      await api.patch(`/auction/${lotId}/approve`);
      // Mark lot as sold locally
      setLots((prev) =>
        prev.map((l) => (l._id === lotId ? { ...l, status: "sold" } : l))
      );
      setApproveSuccess(lotId);
      setTimeout(() => setApproveSuccess(null), 3000);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to approve bid");
    } finally {
      setApprovingId(null);
    }
  }

  const statusColor = { live: "text-emerald-400", upcoming: "text-blue-400", sold: "text-gray-500" };
  const statusBg = { live: "bg-emerald-500/10 border-emerald-500/20", upcoming: "bg-blue-500/10 border-blue-500/20", sold: "bg-gray-800 border-gray-700" };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(({ label, value, color }) => (
          <div key={label} className={`border rounded-2xl p-4 text-center ${dark ? "bg-gray-900 border-gray-800" : "bg-white border-stone-100 shadow-sm"}`}>
            <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
            <p className={`${dark ? "text-gray-600" : "text-gray-400"} text-xs mt-0.5`}>{label}</p>
          </div>
        ))}
      </div>

      {/* Add Lot */}
      <div className={`border rounded-2xl overflow-hidden ${dark ? "bg-gray-900 border-gray-800" : "bg-white border-stone-100 shadow-sm"}`}>
        <button
          onClick={() => setShowForm((p) => !p)}
          className={`w-full flex items-center justify-between px-6 py-4 transition-colors ${dark ? "hover:bg-gray-800/50" : "hover:bg-stone-50"}`}
        >
          <span className={`font-bold text-sm flex items-center gap-2 ${dark ? "text-white" : "text-gray-900"}`}>
            <span className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-xs font-black text-white">+</span>
            List New Produce
          </span>
          <span className={`transition-transform duration-200 ${dark ? "text-gray-500" : "text-gray-400"} ${showForm ? "rotate-180" : ""}`}>▾</span>
        </button>

        {showForm && (
          <div className={`px-6 pb-6 border-t ${dark ? "border-gray-800" : "border-stone-100"}`}>
            {submitted ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">✅</div>
                <p className={`font-bold ${dark ? "text-white" : "text-gray-900"}`}>Lot Listed Successfully!</p>
                <p className={`${dark ? "text-gray-500" : "text-gray-400"} text-sm mt-1`}>Buyers can now bid on your produce</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                <div>
                  <label className={`${dark ? "text-gray-500" : "text-gray-400"} text-xs uppercase tracking-widest block mb-1.5`}>Crop Name</label>
                  <input
                    type="text" placeholder="e.g. Wheat"
                    value={form.crop}
                    onChange={(e) => setForm((p) => ({ ...p, crop: e.target.value }))}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 ${dark ? "bg-gray-950 border-gray-700 text-white" : "bg-stone-50 border-stone-200 text-gray-900"}`}
                  />
                </div>
                <div>
                  <label className={`${dark ? "text-gray-500" : "text-gray-400"} text-xs uppercase tracking-widest block mb-1.5`}>Emoji Icon</label>
                  <input
                    type="text" placeholder="🌾"
                    value={form.emoji}
                    onChange={(e) => setForm((p) => ({ ...p, emoji: e.target.value }))}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 ${dark ? "bg-gray-950 border-gray-700 text-white" : "bg-stone-50 border-stone-200 text-gray-900"}`}
                  />
                </div>
                <div>
                  <label className={`${dark ? "text-gray-500" : "text-gray-400"} text-xs uppercase tracking-widest block mb-1.5`}>Quantity</label>
                  <div className="flex gap-2">
                    <input
                      type="number" placeholder="e.g. 50"
                      value={form.qty}
                      onChange={(e) => setForm((p) => ({ ...p, qty: e.target.value }))}
                      className={`flex-1 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 ${dark ? "bg-gray-950 border-gray-700 text-white" : "bg-stone-50 border-stone-200 text-gray-900"}`}
                    />
                    <select
                      value={form.unit}
                      onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
                      className={`border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500 ${dark ? "bg-gray-950 border-gray-700 text-gray-300" : "bg-stone-50 border-stone-200 text-gray-600"}`}
                    >
                      {["Qtl", "Kg", "Ton", "Box"].map((u) => <option key={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={`${dark ? "text-gray-500" : "text-gray-400"} text-xs uppercase tracking-widest block mb-1.5`}>Base Price (₹/Qtl)</label>
                  <input
                    type="number" placeholder="e.g. 2100"
                    value={form.basePrice}
                    onChange={(e) => setForm((p) => ({ ...p, basePrice: e.target.value }))}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 ${dark ? "bg-gray-950 border-gray-700 text-white" : "bg-stone-50 border-stone-200 text-gray-900"}`}
                  />
                </div>
                <div>
                  <label className={`${dark ? "text-gray-500" : "text-gray-400"} text-xs uppercase tracking-widest block mb-1.5`}>Grade</label>
                  <select
                    value={form.grade}
                    onChange={(e) => setForm((p) => ({ ...p, grade: e.target.value }))}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 ${dark ? "bg-gray-950 border-gray-700 text-gray-300" : "bg-stone-50 border-stone-200 text-gray-600"}`}
                  >
                    {["A+", "A", "B+", "B", "C"].map((g) => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleAddLot}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold text-sm hover:from-emerald-400 hover:to-green-400 transition-all hover:shadow-lg hover:shadow-emerald-500/30"
                  >
                    🌾 List This Lot
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* My Lots */}
      <div>
        <p className={`${dark ? "text-gray-500" : "text-gray-400"} text-xs uppercase tracking-widest mb-3`}>My Lots</p>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : lots.length > 0 ? (
          <div className="space-y-3">
            {/* Approve success toast */}
            {approveSuccess && (
              <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl px-5 py-3 text-sm font-semibold animate-pulse">
                <span className="text-xl">✅</span>
                Bid approved! Lot marked as <span className="font-extrabold ml-1">Sold</span>.
              </div>
            )}
            {lots.map((lot) => (
              <div
                key={lot._id || lot.id}
                className={`border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${dark ? "bg-gray-900" : "bg-white"} ${statusBg[lot.status]}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lot.emoji}</span>
                  <div>
                    <p className={`font-bold text-sm ${dark ? "text-white" : "text-gray-900"}`}>{lot.crop}</p>
                    <p className={`${dark ? "text-gray-500" : "text-gray-400"} text-xs`}>{lot.qty} {lot.unit} · Grade {lot.grade}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div>
                    <p className="text-gray-600">Base</p>
                    <p className="text-gray-400 font-semibold">{fmt(lot.basePrice)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Highest Bid</p>
                    <p className="text-emerald-400 font-bold">{lot.currentBid > lot.basePrice ? fmt(lot.currentBid) : "—"}</p>
                  </div>
                  <div>
                    <p className={`${dark ? "text-gray-600" : "text-gray-400"}`}>Bids</p>
                    <p className={`font-semibold ${dark ? "text-white" : "text-gray-700"}`}>{lot.bids}</p>
                  </div>
                  {lot.status === "live" && (
                    <div>
                      <p className={`${dark ? "text-gray-600" : "text-gray-400"}`}>Ends In</p>
                      <Timer seconds={lot.endsIn} dark={dark} />
                    </div>
                  )}
                  <span className={`font-bold uppercase text-[10px] px-2 py-1 rounded-full border ${statusBg[lot.status]} ${statusColor[lot.status]}`}>
                    {lot.status === "live" && <Pulse on={pulse} />} {lot.status}
                  </span>
                  {/* Approve Bid Button — only for live lots with at least 1 bid */}
                  {lot.status === "live" && lot.bids > 0 && (
                    <button
                      onClick={() => handleApproveBid(lot._id)}
                      disabled={approvingId === lot._id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white text-[11px] font-bold hover:from-emerald-400 hover:to-green-400 transition-all hover:shadow-lg hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {approvingId === lot._id ? (
                        <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                      ) : "✅"}
                      Approve Bid
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-12 border rounded-2xl p-4 ${dark ? "bg-gray-900 border-gray-800" : "bg-white border-stone-100"}`}>
            <p className={`${dark ? "text-gray-500" : "text-gray-400"} text-sm`}>You haven't listed any lots yet.</p>
          </div>
        )}
      </div>

    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LiveAuctionPage({ dark }) {
  const [role, setRole] = useState(null); // null | "buyer" | "farmer"
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setPulse((p) => !p), 900);
    return () => clearInterval(t);
  }, []);

  // ── Role Selection Screen ──
  if (!role) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${dark ? "bg-gray-950" : "bg-stone-50"}`} style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className={`w-2.5 h-2.5 rounded-full bg-red-500 transition-opacity duration-300 ${pulse ? "opacity-100" : "opacity-20"}`} />
              <span className="text-red-400 text-xs font-bold uppercase tracking-widest">Live Auction</span>
            </div>
            <h1 className={`text-4xl sm:text-5xl font-extrabold leading-tight ${dark ? "text-white" : "text-gray-900"}`}>
              Auction
              <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent ml-3">Hall</span>
            </h1>
            <p className={`${dark ? "text-gray-500" : "text-gray-400"} mt-3 text-sm max-w-sm mx-auto`}>
              Direct farm-to-buyer auctions. No middlemen. Better prices for farmers, fresher produce for buyers.
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                role: "farmer", icon: "🧑‍🌾", title: "I'm a Farmer",
                desc: "List your produce, set a base price and let verified buyers compete for the best deal.",
                cta: "Enter as Farmer",
                gradient: "from-emerald-500 to-green-600",
                glow: "hover:shadow-emerald-500/25",
                border: "hover:border-emerald-500/50",
              },
              {
                role: "buyer", icon: "🏪", title: "I'm a Buyer",
                desc: "Browse fresh lots directly from farms. Bid in real-time and source quality produce fairly.",
                cta: "Enter as Buyer",
                gradient: "from-orange-500 to-red-500",
                glow: "hover:shadow-orange-500/25",
                border: "hover:border-orange-500/50",
              },
            ].map((r) => (
              <button
                key={r.role}
                onClick={() => setRole(r.role)}
                className={`group text-left border rounded-3xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 
                  ${dark ? "bg-gray-900 border-gray-800 " + r.border : "bg-white border-stone-100 " + r.glow}
                  ${r.glow}
                `}
              >
                <div className="text-4xl mb-4">{r.icon}</div>
                <h2 className={`font-extrabold text-lg mb-2 ${dark ? "text-white" : "text-gray-900"}`}>{r.title}</h2>
                <p className={`${dark ? "text-gray-500" : "text-gray-400"} text-sm leading-relaxed mb-5`}>{r.desc}</p>

                <span className={`inline-flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-full text-white bg-gradient-to-r ${r.gradient} group-hover:gap-3 transition-all duration-200 shadow-lg`}>
                  {r.cta} →
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={`min-h-screen transition-colors duration-300 ${dark ? "bg-gray-950 text-white" : "bg-stone-50 text-gray-900"}`} style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Nav */}
      <nav className={`sticky top-16 z-40 backdrop-blur-md border-b ${dark ? "bg-gray-950/90 border-gray-800" : "bg-white/90 border-stone-200"}`}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setRole(null)}
              className={`${dark ? "text-gray-500 hover:text-white" : "text-gray-400 hover:text-gray-700"} transition-colors text-sm flex items-center gap-1`}
            >
              ← Back
            </button>
            <span className={dark ? "text-gray-700" : "text-gray-300"}>|</span>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full bg-red-500 transition-opacity duration-300 ${pulse ? "opacity-100" : "opacity-20"}`} />
              <span className={`font-bold text-sm ${dark ? "text-white" : "text-gray-900"}`}>Auction Hall</span>
            </div>
          </div>

          {/* Role Switcher */}
          <div className={`flex items-center gap-1 border rounded-full p-1 ${dark ? "bg-gray-900 border-gray-800" : "bg-stone-50 border-stone-100"}`}>
            {[
              { id: "farmer", icon: "🧑‍🌾", label: "Farmer" },
              { id: "buyer", icon: "🏪", label: "Buyer" },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${role === r.id
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
                  : (dark ? "text-gray-500 hover:text-white" : "text-gray-400 hover:text-gray-700")
                  }`}
              >
                {r.icon} {r.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl">{role === "farmer" ? "🧑‍🌾" : "🏪"}</span>
          <div>
            <h1 className={`text-2xl font-extrabold ${dark ? "text-white" : "text-gray-900"}`}>
              {role === "farmer" ? "Farmer Dashboard" : "Browse Live Lots"}
            </h1>
            <p className={`${dark ? "text-gray-500" : "text-gray-400"} text-xs mt-0.5`}>
              {role === "farmer"
                ? "Manage your produce listings and track bids in real-time"
                : "Bid on fresh produce directly from verified farmers across India"}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 pb-16">
        {role === "buyer" ? <BuyerView pulse={pulse} dark={dark} /> : <FarmerView pulse={pulse} dark={dark} />}
      </main>
    </div>
  );
}
