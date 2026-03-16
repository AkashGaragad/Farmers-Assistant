import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const INITIAL_LOTS = [
  {
    id: 1, crop: "Wheat", emoji: "🌾", farmer: "Ramesh Kumar", farmerId: "F-1042",
    location: "Haryana", qty: 50, unit: "Qtl", basePrice: 2100,
    currentBid: 2480, bids: 14, endsIn: 420, grade: "A", verified: true,
    image: "wheat", tags: ["Organic", "Grade A"],
  },
  {
    id: 2, crop: "Maize", emoji: "🌽", farmer: "Suresh Patil", farmerId: "F-0833",
    location: "Maharashtra", qty: 30, unit: "Qtl", basePrice: 1800,
    currentBid: 2050, bids: 9, endsIn: 680, grade: "B+", verified: true,
    image: "maize", tags: ["Fresh Harvest"],
  },
  {
    id: 3, crop: "Tomato", emoji: "🍅", farmer: "Meena Devi", farmerId: "F-2211",
    location: "Karnataka", qty: 20, unit: "Qtl", basePrice: 900,
    currentBid: 1340, bids: 21, endsIn: 195, grade: "A+", verified: true,
    image: "tomato", tags: ["Organic", "Grade A+", "Hot Deal"],
  },
  {
    id: 4, crop: "Onion", emoji: "🧅", farmer: "Dilip Yadav", farmerId: "F-3301",
    location: "Rajasthan", qty: 60, unit: "Qtl", basePrice: 1200,
    currentBid: 1410, bids: 6, endsIn: 840, grade: "A", verified: false,
    image: "onion", tags: ["Bulk Lot"],
  },
  {
    id: 5, crop: "Rice", emoji: "🍚", farmer: "Kavita Singh", farmerId: "F-0190",
    location: "Punjab", qty: 100, unit: "Qtl", basePrice: 2800,
    currentBid: 3150, bids: 18, endsIn: 310, grade: "A+", verified: true,
    image: "rice", tags: ["Basmati", "Premium"],
  },
  {
    id: 6, crop: "Potato", emoji: "🥔", farmer: "Mohan Gupta", farmerId: "F-0554",
    location: "UP", qty: 45, unit: "Qtl", basePrice: 700,
    currentBid: 860, bids: 11, endsIn: 560, grade: "B", verified: true,
    image: "potato", tags: ["Grade B"],
  },
];

const FARMER_LOTS = [
  { id: 101, crop: "Wheat", emoji: "🌾", qty: 50, unit: "Qtl", basePrice: 2100, currentBid: 2480, bids: 14, endsIn: 420, status: "live", grade: "A" },
  { id: 102, crop: "Soybean", emoji: "🫘", qty: 25, unit: "Qtl", basePrice: 4200, currentBid: 4200, bids: 0, endsIn: 0, status: "upcoming", grade: "A+" },
  { id: 103, crop: "Cotton", emoji: "🪴", qty: 15, unit: "Qtl", basePrice: 6500, currentBid: 7100, bids: 8, endsIn: 0, status: "sold", grade: "A" },
];

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

function Timer({ seconds }) {
  const t = useCountdown(seconds);
  const urgent = t < 60;
  return (
    <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${urgent ? "bg-red-500/20 text-red-400 animate-pulse" : "bg-gray-800 text-gray-300"}`}>
      ⏱ {fmtTime(t)}
    </span>
  );
}

function Badge({ children, color = "gray" }) {
  const map = {
    gray: "bg-gray-800 text-gray-400",
    green: "bg-emerald-500/15 text-emerald-400",
    orange: "bg-orange-500/15 text-orange-400",
    red: "bg-red-500/15 text-red-400",
    blue: "bg-blue-500/15 text-blue-400",
  };
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${map[color]}`}>{children}</span>;
}

// ─── Bid Modal ────────────────────────────────────────────────────────────────
function BidModal({ lot, onClose, onBid }) {
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
        className="relative w-full max-w-md bg-gray-950 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* top accent */}
        <div className="h-0.5 bg-gradient-to-r from-orange-500 to-red-500 w-full" />
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">🎉</div>
              <p className="text-white text-xl font-bold">Bid Placed!</p>
              <p className="text-gray-400 text-sm mt-1">You bid {fmt(amount)} on {lot.crop}</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-widest">Placing Bid On</p>
                  <h3 className="text-white text-xl font-extrabold mt-0.5">{lot.emoji} {lot.crop}</h3>
                  <p className="text-gray-500 text-xs mt-0.5">by {lot.farmer} · {lot.qty} {lot.unit}</p>
                </div>
                <button onClick={onClose} className="text-gray-600 hover:text-white text-xl transition-colors">✕</button>
              </div>

              <div className="bg-gray-900 rounded-2xl p-4 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Base Price</span>
                  <span className="text-gray-300 font-semibold">{fmt(lot.basePrice)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-500">Highest Bid</span>
                  <span className="text-emerald-400 font-bold">{fmt(lot.currentBid)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-500">Total Bids</span>
                  <span className="text-gray-300 font-semibold">{lot.bids} bids</span>
                </div>
              </div>

              <label className="block text-gray-400 text-xs uppercase tracking-widest mb-2">Your Bid Amount</label>
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => setAmount((a) => Math.max(lot.currentBid + step, a - step))}
                  className="w-10 h-10 rounded-xl bg-gray-800 text-white font-bold hover:bg-gray-700 transition-colors"
                >−</button>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="flex-1 text-center bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white font-bold text-lg focus:outline-none focus:border-orange-500"
                />
                <button
                  onClick={() => setAmount((a) => a + step)}
                  className="w-10 h-10 rounded-xl bg-gray-800 text-white font-bold hover:bg-gray-700 transition-colors"
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

// ─── Lot Card (Buyer) ─────────────────────────────────────────────────────────
function LotCard({ lot, pulse, onBid }) {
  const gain = pctGain(lot.basePrice, lot.currentBid);
  return (
    <div className="group relative bg-gray-900 border border-gray-800 hover:border-orange-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-0.5 flex flex-col">
      {/* color band */}
      <div className="h-0.5 bg-gradient-to-r from-orange-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="p-5 flex-1 flex flex-col">
        {/* header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{lot.emoji}</span>
            <div>
              <h3 className="text-white font-bold text-base leading-tight">{lot.crop}</h3>
              <p className="text-gray-500 text-xs">{lot.qty} {lot.unit} · {lot.location}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors duration-300 ${pulse ? "bg-red-500/20 text-red-400" : "bg-red-500/10 text-red-300"}`}>
              <Pulse on={pulse} /> LIVE
            </span>
            {lot.verified && <Badge color="green">✓ Verified</Badge>}
          </div>
        </div>

        {/* tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {lot.tags.map((t) => (
            <Badge key={t} color="orange">{t}</Badge>
          ))}
          <Badge color="blue">Grade {lot.grade}</Badge>
        </div>

        {/* price row */}
        <div className="bg-gray-950 rounded-xl p-3 mb-3 flex justify-between items-center">
          <div>
            <p className="text-gray-600 text-[10px] uppercase tracking-wider">Base</p>
            <p className="text-gray-400 text-sm font-semibold">{fmt(lot.basePrice)}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600 text-[10px] uppercase tracking-wider">Highest Bid</p>
            <p className="text-emerald-400 text-lg font-extrabold">{fmt(lot.currentBid)}</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2 py-1 text-center">
            <p className="text-emerald-400 text-sm font-extrabold">+{gain}%</p>
            <p className="text-emerald-600 text-[9px]">gain</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600 text-xs">🔨 {lot.bids} bids placed</p>
          <Timer seconds={lot.endsIn} />
        </div>

        <div className="text-gray-600 text-xs mb-4 flex items-center gap-1">
          <span>🧑‍🌾</span>
          <span>{lot.farmer}</span>
          <span className="ml-auto text-gray-700">{lot.farmerId}</span>
        </div>

        <button
          onClick={() => onBid(lot)}
          className="mt-auto w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold hover:from-orange-400 hover:to-red-400 transition-all hover:shadow-lg hover:shadow-orange-500/30"
        >
          🔨 Place Bid
        </button>
      </div>
    </div>
  );
}

// ─── Buyer View ───────────────────────────────────────────────────────────────
function BuyerView({ pulse }) {
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
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
          <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">Your Active Bids</p>
          <div className="flex flex-wrap gap-2">
            {myBids.slice(0, 4).map((b, i) => (
              <span key={i} className="bg-gray-900 text-gray-300 text-xs px-3 py-1.5 rounded-lg font-medium">
                {lots.find((l) => l._id === b.id)?.emoji} {b.crop} · <span className="text-emerald-400">{fmt(b.amount)}</span>
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
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500"
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
            <LotCard key={lot._id} lot={lot} pulse={pulse} onBid={setBidModal} />
          ))}
        </div>
      ) : (
         <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-2xl">
            <div className="text-4xl mb-3">🏷️</div>
            <p className="text-white font-bold">No pure active lots found.</p>
            <p className="text-gray-500 text-sm mt-1">Check back later or change your filters.</p>
         </div>
      )}

      {bidModal && (
        <BidModal lot={bidModal} onClose={() => setBidModal(null)} onBid={handleBid} />
      )}
    </div>
  );
}

// ─── Farmer View ──────────────────────────────────────────────────────────────
function FarmerView({ pulse }) {
  const [lots, setLots] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ crop: "", emoji: "🌾", qty: "", unit: "Qtl", basePrice: "", grade: "A" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const statusColor = { live: "text-emerald-400", upcoming: "text-blue-400", sold: "text-gray-500" };
  const statusBg = { live: "bg-emerald-500/10 border-emerald-500/20", upcoming: "bg-blue-500/10 border-blue-500/20", sold: "bg-gray-800 border-gray-700" };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
            <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
            <p className="text-gray-600 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Add Lot */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowForm((p) => !p)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-800/50 transition-colors"
        >
          <span className="text-white font-bold text-sm flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-xs font-black">+</span>
            List New Produce
          </span>
          <span className={`text-gray-500 transition-transform duration-200 ${showForm ? "rotate-180" : ""}`}>▾</span>
        </button>

        {showForm && (
          <div className="px-6 pb-6 border-t border-gray-800">
            {submitted ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">✅</div>
                <p className="text-white font-bold">Lot Listed Successfully!</p>
                <p className="text-gray-500 text-sm mt-1">Buyers can now bid on your produce</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                <div>
                  <label className="text-gray-500 text-xs uppercase tracking-widest block mb-1.5">Crop Name</label>
                  <input
                    type="text" placeholder="e.g. Wheat"
                    value={form.crop}
                    onChange={(e) => setForm((p) => ({ ...p, crop: e.target.value }))}
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-gray-500 text-xs uppercase tracking-widest block mb-1.5">Emoji Icon</label>
                  <input
                    type="text" placeholder="🌾"
                    value={form.emoji}
                    onChange={(e) => setForm((p) => ({ ...p, emoji: e.target.value }))}
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-gray-500 text-xs uppercase tracking-widest block mb-1.5">Quantity</label>
                  <div className="flex gap-2">
                    <input
                      type="number" placeholder="e.g. 50"
                      value={form.qty}
                      onChange={(e) => setForm((p) => ({ ...p, qty: e.target.value }))}
                      className="flex-1 bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500"
                    />
                    <select
                      value={form.unit}
                      onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
                      className="bg-gray-950 border border-gray-700 rounded-xl px-3 py-2.5 text-gray-300 text-sm focus:outline-none focus:border-orange-500"
                    >
                      {["Qtl", "Kg", "Ton", "Box"].map((u) => <option key={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-gray-500 text-xs uppercase tracking-widest block mb-1.5">Base Price (₹/Qtl)</label>
                  <input
                    type="number" placeholder="e.g. 2100"
                    value={form.basePrice}
                    onChange={(e) => setForm((p) => ({ ...p, basePrice: e.target.value }))}
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-gray-500 text-xs uppercase tracking-widest block mb-1.5">Grade</label>
                  <select
                    value={form.grade}
                    onChange={(e) => setForm((p) => ({ ...p, grade: e.target.value }))}
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-gray-300 text-sm focus:outline-none focus:border-orange-500"
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
        <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">My Lots</p>
        {loading ? (
             <div className="flex justify-center py-8">
                 <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
             </div>
        ) : lots.length > 0 ? (
            <div className="space-y-3">
              {lots.map((lot) => (
                <div
                  key={lot._id || lot.id}
                  className={`bg-gray-900 border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${statusBg[lot.status]}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{lot.emoji}</span>
                    <div>
                      <p className="text-white font-bold text-sm">{lot.crop}</p>
                      <p className="text-gray-500 text-xs">{lot.qty} {lot.unit} · Grade {lot.grade}</p>
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
                      <p className="text-gray-600">Bids</p>
                      <p className="text-white font-semibold">{lot.bids}</p>
                    </div>
                    {lot.status === "live" && (
                      <div>
                        <p className="text-gray-600">Ends In</p>
                        <Timer seconds={lot.endsIn} />
                      </div>
                    )}
                    <span className={`font-bold uppercase text-[10px] px-2 py-1 rounded-full border ${statusBg[lot.status]} ${statusColor[lot.status]}`}>
                      {lot.status === "live" && <Pulse on={pulse} />} {lot.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
        ) : (
            <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <p className="text-gray-500 text-sm">You haven't listed any lots yet.</p>
            </div>
        )}
      </div>

      {/* Earnings Summary */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-2xl p-5">
        <p className="text-emerald-400 text-xs uppercase tracking-widest font-bold mb-3">Earnings Summary</p>
        <div className="flex flex-wrap gap-6">
          <div>
            <p className="text-2xl font-extrabold text-white">₹1,06,500</p>
            <p className="text-gray-500 text-xs mt-0.5">Total Earned This Month</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-emerald-400">+18%</p>
            <p className="text-gray-500 text-xs mt-0.5">Avg. Gain Over MSP</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-white">3</p>
            <p className="text-gray-500 text-xs mt-0.5">Lots Completed</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LiveAuctionPage() {
  const [role, setRole] = useState(null); // null | "buyer" | "farmer"
  const [pulse, setPulse] = useState(true);
  const [onlineCount] = useState(1620);

  useEffect(() => {
    const t = setInterval(() => setPulse((p) => !p), 900);
    return () => clearInterval(t);
  }, []);

  // ── Role Selection Screen ──
  if (!role) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className={`w-2.5 h-2.5 rounded-full bg-red-500 transition-opacity duration-300 ${pulse ? "opacity-100" : "opacity-20"}`} />
              <span className="text-red-400 text-xs font-bold uppercase tracking-widest">Live Auction</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
              Auction
              <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent ml-3">Hall</span>
            </h1>
            <p className="text-gray-500 mt-3 text-sm max-w-sm mx-auto">
              Direct farm-to-buyer auctions. No middlemen. Better prices for farmers, fresher produce for buyers.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="flex -space-x-1.5">
                {["🧑‍🌾", "👩‍🌾", "🧑‍💼", "👩‍💼"].map((e, i) => (
                  <span key={i} className="w-7 h-7 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-sm">{e}</span>
                ))}
              </div>
              <span className="text-gray-500 text-xs">
                <span className="text-orange-400 font-bold">{onlineCount.toLocaleString()}+</span> people online now
              </span>
            </div>
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
                stats: [["Active Lots", "94"], ["Avg. Gain", "+22%"]],
              },
              {
                role: "buyer", icon: "🏪", title: "I'm a Buyer",
                desc: "Browse fresh lots directly from farms. Bid in real-time and source quality produce fairly.",
                cta: "Enter as Buyer",
                gradient: "from-orange-500 to-red-500",
                glow: "hover:shadow-orange-500/25",
                border: "hover:border-orange-500/50",
                stats: [["Lots Available", "6"], ["Buyers Online", "380+"]],
              },
            ].map((r) => (
              <button
                key={r.role}
                onClick={() => setRole(r.role)}
                className={`group text-left bg-gray-900 border border-gray-800 ${r.border} rounded-3xl p-6 hover:shadow-2xl ${r.glow} transition-all duration-300 hover:-translate-y-1`}
              >
                <div className="text-4xl mb-4">{r.icon}</div>
                <h2 className="text-white font-extrabold text-lg mb-2">{r.title}</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">{r.desc}</p>

                <div className="flex gap-3 mb-5">
                  {r.stats.map(([l, v]) => (
                    <div key={l} className="bg-gray-800 rounded-xl px-3 py-2 flex-1 text-center">
                      <p className="text-white font-bold text-sm">{v}</p>
                      <p className="text-gray-600 text-[10px]">{l}</p>
                    </div>
                  ))}
                </div>

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

  // ── Auction Hall ──
  return (
    <div className="min-h-screen bg-gray-950 text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setRole(null)}
              className="text-gray-500 hover:text-white transition-colors text-sm flex items-center gap-1"
            >
              ← Back
            </button>
            <span className="text-gray-700">|</span>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full bg-red-500 transition-opacity duration-300 ${pulse ? "opacity-100" : "opacity-20"}`} />
              <span className="text-white font-bold text-sm">Auction Hall</span>
            </div>
          </div>

          {/* Role Switcher */}
          <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-full p-1">
            {[
              { id: "farmer", icon: "🧑‍🌾", label: "Farmer" },
              { id: "buyer", icon: "🏪", label: "Buyer" },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${role === r.id
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
                  : "text-gray-500 hover:text-white"
                }`}
              >
                {r.icon} {r.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="hidden sm:inline">{onlineCount.toLocaleString()}+ online</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl">{role === "farmer" ? "🧑‍🌾" : "🏪"}</span>
          <div>
            <h1 className="text-2xl font-extrabold text-white">
              {role === "farmer" ? "Farmer Dashboard" : "Browse Live Lots"}
            </h1>
            <p className="text-gray-500 text-xs mt-0.5">
              {role === "farmer"
                ? "Manage your produce listings and track bids in real-time"
                : "Bid on fresh produce directly from verified farmers across India"}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 pb-16">
        {role === "buyer" ? <BuyerView pulse={pulse} /> : <FarmerView pulse={pulse} />}
      </main>
    </div>
  );
}
