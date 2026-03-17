import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════════ */
const CATS = ["Fertiliser", "Seeds", "Pesticides", "Tools", "Machines"];
const CAT_EMOJI = { Seeds: "🌱", Fertiliser: "🧪", Pesticides: "🧴", Tools: "🛠️", Machines: "⚙️", Other: "📦" };
const ORDER_STATUSES = ["pending", "accepted", "shipped", "delivered", "cancelled"];

const STATUS_META = {
  pending: { color: "#f0b429", bg: "rgba(240,180,41,0.10)", border: "rgba(240,180,41,0.25)", icon: "⏳" },
  accepted: { color: "#60aef0", bg: "rgba(96,174,240,0.10)", border: "rgba(96,174,240,0.25)", icon: "✅" },
  shipped: { color: "#a888f5", bg: "rgba(168,136,245,0.10)", border: "rgba(168,136,245,0.25)", icon: "🚚" },
  delivered: { color: "#6bcb8b", bg: "rgba(107,203,139,0.10)", border: "rgba(107,203,139,0.25)", icon: "📦" },
  cancelled: { color: "#f07060", bg: "rgba(240,112,96,0.10)", border: "rgba(240,112,96,0.25)", icon: "✕" },
};

/* ═══════════════════════════════════════════════════════════════
   STYLES (Tailored for theme compatibility)
═══════════════════════════════════════════════════════════════ */
const CSS = (dark) => `
@import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap');

.seller-dash-container * { box-sizing: border-box; }
.seller-dash-container {
  --bg: ${dark ? "#07090d" : "#fafaf9"};
  --s1: ${dark ? "#0c1018" : "#ffffff"};
  --s2: ${dark ? "#111722" : "#f5f5f4"};
  --s3: ${dark ? "#161f2e" : "#eeeeed"};
  --s4: ${dark ? "#1c2740" : "#e5e7eb"};
  --line: ${dark ? "#1e2d44" : "#e5e7eb"};
  --line2: ${dark ? "#253550" : "#d1d5db"};
  --text: ${dark ? "#ccd9ec" : "#1c1917"};
  --text2: ${dark ? "#5a7a9e" : "#44403c"};
  --text3: ${dark ? "#2d4060" : "#78716c"};
  --green: #10b981; --green-g: rgba(16,185,129,0.11);
  --amber: #f59e0b; --amber-g: rgba(245,158,11,0.10);
  --blue: #3b82f6;  --blue-g: rgba(59,130,246,0.10);
  --purple: #8b5cf6;--purple-g: rgba(139,92,246,0.10);
  --red: #ef4444;   --red-g: rgba(239,68,68,0.10);
  --r: 16px;
  --t: .18s cubic-bezier(.4,0,.2,1);
  --font: 'Plus Jakarta Sans', sans-serif;
  --display: 'Clash Display', sans-serif;
  --mono: 'JetBrains Mono', monospace;
  
  font-family: var(--font);
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  display: flex;
}

/* ── SIDEBAR ── */
.sb {
  width: 240px; flex-shrink: 0;
  background: var(--s1);
  border-right: 1px solid var(--line);
  display: flex; flex-direction: column;
  position: sticky; top: 0; height: 100vh;
}
.sb-brand { padding: 32px 24px 24px; border-bottom: 1px solid var(--line); margin-bottom: 12px; }
.sb-eyebrow { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--green); margin-bottom: 4px; font-weight: 700; }
.sb-name { font-family: var(--display); font-size: 24px; font-weight: 700; color: var(--text); }
.sb-name span { color: var(--green); }
.sb-nav { padding: 0 12px; flex: 1; }
.sb-section { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text3); padding: 12px 12px 8px; margin-top: 8px; }
.sb-btn {
  display: flex; align-items: center; gap: 12px;
  width: 100%; padding: 12px 16px; border-radius: 12px;
  border: none; background: none; color: var(--text2);
  font-family: var(--font); font-size: 14px; cursor: pointer;
  transition: all var(--t); text-align: left; margin-bottom: 4px;
}
.sb-btn:hover { background: var(--s2); color: var(--text); }
.sb-btn.on { background: var(--green-g); color: var(--green); font-weight: 600; border: 1px solid rgba(16,185,129,0.1); }
.sb-cnt {
  margin-left: auto; background: var(--amber); color: #fff;
  font-size: 10px; font-weight: 700; padding: 2px 7px;
  border-radius: 8px; font-family: var(--mono);
}

/* ── MAIN ── */
.main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.topbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 32px; border-bottom: 1px solid var(--line);
  background: var(--s1); position: sticky; top: 0; z-index: 20;
}
.topbar-title { font-family: var(--display); font-size: 20px; font-weight: 600; }

/* ── BUTTONS ── */
.btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 20px; border-radius: 12px; font-size: 14px;
  font-weight: 600; cursor: pointer; transition: all var(--t); border: none;
}
.btn-green { background: var(--green); color: white; }
.btn-green:hover { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(16,185,129,0.2); }
.btn-ghost { background: transparent; border: 1px solid var(--line); color: var(--text2); }
.btn-ghost:hover { border-color: var(--green); color: var(--green); background: var(--green-g); }
.btn-red { background: var(--red-g); border: 1px solid rgba(239,68,68,0.2); color: var(--red); }
.btn-red:hover { background: var(--red); color: white; }
.btn-sm { padding: 6px 14px; font-size: 12px; border-radius: 10px; }

/* ── CONTENT ── */
.content { padding: 32px; overflow-y: auto; flex: 1; }
.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 32px; }
.stat {
  background: var(--s1); border: 1px solid var(--line);
  border-radius: var(--r); padding: 24px; position: relative;
  transition: all var(--t);
}
.stat:hover { border-color: var(--green); transform: translateY(-2px); }
.stat-lbl { font-size: 12px; color: var(--text3); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
.stat-val { font-family: var(--display); font-size: 32px; font-weight: 700; color: var(--text); }

/* ── TABLE ── */
.tbl-wrap { background: var(--s1); border: 1px solid var(--line); border-radius: var(--r); overflow: hidden; margin-bottom: 32px; }
table { width: 100%; border-collapse: collapse; }
thead th { text-align: left; padding: 14px 20px; font-size: 11px; text-transform: uppercase; color: var(--text3); background: var(--s2); border-bottom: 1px solid var(--line); }
tbody tr { border-bottom: 1px solid var(--line); transition: background var(--t); }
tbody tr:hover { background: var(--s2); }
td { padding: 16px 20px; font-size: 14px; }

/* ── MODAL ── */
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px); z-index: 100;
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.modal {
  background: var(--s1); border: 1px solid var(--line);
  border-radius: 24px; width: 500px; max-width: 100%;
  padding: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.2);
}
.modal-title { font-family: var(--display); font-size: 24px; font-weight: 700; margin-bottom: 24px; }
.fg { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.fl { font-size: 12px; font-weight: 600; color: var(--text2); }
.fi, .fsel, .fta {
  background: var(--s2); border: 1px solid var(--line);
  border-radius: 12px; padding: 12px 16px; color: var(--text);
  font-family: var(--font); width: 100%; outline: none;
}
.fi:focus, .fsel:focus, .fta:focus { border-color: var(--green); box-shadow: 0 0 0 4px var(--green-g); }

/* ── TOAST ── */
.toasts { position: fixed; bottom: 32px; right: 32px; z-index: 200; display: flex; flex-direction: column; gap: 12px; }
.toast {
  padding: 12px 24px; border-radius: 12px; background: var(--s1);
  border: 1px solid var(--line); box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  font-size: 14px; font-weight: 600; animation: slideIn .3s ease-out;
}
@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

@media (max-width: 768px) {
  .sb { display: none; }
  .stats { grid-template-columns: 1fr 1fr; }
}
`;

function useToast() {
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((msg) => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  }, []);
  return { toasts, toast };
}

export default function SellerDashboard({ dark }) {
  const { api, user } = useAuth();
  const { toasts, toast } = useToast();

  const [view, setView] = useState("dashboard");
  const [dash, setDash] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", category: "Fertiliser", price: "", stock: "", description: "", unit: "Kg" });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [resDash, resProd, resOrd] = await Promise.all([
        api.get("/orders/dashboard"),
        api.get("/products/seller"),
        api.get("/orders/incoming")
      ]);
      setDash(resDash.data);
      setProducts(resProd.data);
      setOrders(resOrd.data);
    } catch (err) {
      console.error(err);
      toast("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [api, toast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openForm = (p = null) => {
    if (p) {
      setEditId(p._id);
      setForm({ ...p, stock: p.stock || 0 });
    } else {
      setEditId(null);
      setForm({ name: "", category: "Fertiliser", price: "", stock: "", description: "", unit: "Kg" });
    }
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editId) await api.put(`/products/${editId}`, form);
      else await api.post("/products", form);
      toast(editId ? "Product updated" : "Product created");
      setModal(false);
      fetchAll();
    } catch (err) {
      toast("Action failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast("Product deleted");
      fetchAll();
    } catch (err) {
      toast("Delete failed");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      toast(`Order ${status}`);
      fetchAll();
    } catch (err) {
      toast("Status update failed");
    }
  };

  if (loading && !dash) {
    return (
      <div className="seller-dash-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100%' }}>
        <style>{CSS(dark)}</style>
        <div style={{ textAlign: 'center', width: '100%' }}>
           <div className="stat-val" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Loading Dashboard...</div>
           <div style={{ color: 'var(--text3)' }}>Fetching your inventory and orders</div>
        </div>
      </div>
    );
  }

  if (user?.role !== "dealer") {
    return (
      <div className="seller-dash-container" style={{ flex: 1, padding: '40px', textAlign: 'center' }}>
        <style>{CSS(dark)}</style>
        <div style={{ maxWidth: '500px', margin: '100px auto', background: 'var(--s1)', padding: '40px', borderRadius: '24px', border: '1px solid var(--line)' }}>
          <div style={{ fontSize: '40px', marginBottom: '20px' }}>🚫</div>
          <h2 className="modal-title">Access Restricted</h2>
          <p style={{ color: 'var(--text2)', marginBottom: '20px' }}>
            The Seller Dashboard is only available to registered **Dealers**. Your current role is <strong>{user?.role}</strong>.
          </p>
          <button className="btn btn-green" onClick={() => window.location.href = "/"}>Return Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-dash-container">
      <style>{CSS(dark)}</style>

      {/* Sidebar */}
      <aside className="sb">
        <div className="sb-brand">
          <div className="sb-eyebrow">Seller Hub</div>
          <div className="sb-name">Farmer<span>Assistant</span></div>
        </div>
        <nav className="sb-nav">
          <div className="sb-section">Overview</div>
          <button className={`sb-btn ${view === "dashboard" ? "on" : ""}`} onClick={() => setView("dashboard")}>Dashboard</button>
          <button className={`sb-btn ${view === "products" ? "on" : ""}`} onClick={() => setView("products")}>Inventory</button>
          <button className={`sb-btn ${view === "orders" ? "on" : ""}`} onClick={() => setView("orders")}>
            Orders {orders.filter(o => o.status === 'pending').length > 0 && <span className="sb-cnt">{orders.filter(o => o.status === 'pending').length}</span>}
          </button>
        </nav>
      </aside>

      {/* Main */}
      <main className="main">
        <header className="topbar">
          <h1 className="topbar-title">{view.toUpperCase()}</h1>
          <button className="btn btn-green" onClick={() => openForm()}>Add Product</button>
        </header>

        <div className="content">
          {view === "dashboard" && (
            <>
              <div className="stats">
                <div className="stat"><div className="stat-lbl">Orders</div><div className="stat-val">{dash?.total || 0}</div></div>
                <div className="stat"><div className="stat-lbl">Pending</div><div className="stat-val" style={{color: "var(--amber)"}}>{dash?.pending || 0}</div></div>
                <div className="stat"><div className="stat-lbl">Delivered</div><div className="stat-val" style={{color: "var(--green)"}}>{dash?.delivered || 0}</div></div>
                <div className="stat"><div className="stat-lbl">Products</div><div className="stat-val">{dash?.totalProducts || 0}</div></div>
              </div>
              <h2 className="modal-title">Recent Orders</h2>
              <div className="tbl-wrap">
                <table>
                  <thead>
                    <tr><th>Order</th><th>Farmer</th><th>Paid</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {dash?.recentOrders?.map(o => {
                      const m = STATUS_META[o.status] || STATUS_META.pending;
                      return (
                        <tr key={o._id}>
                          <td>#{o._id.slice(-6)}</td>
                          <td>{o.farmerName}</td>
                          <td className="font-bold text-emerald-500">₹{o.totalPrice}</td>
                          <td>
                            <span style={{ color: m.color, background: m.bg, padding: "4px 10px", borderRadius: "20px", fontSize: "12px", border: `1px solid ${m.border}` }}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {view === "products" && (
            <div className="tbl-wrap">
              <table>
                <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p._id}>
                      <td className="font-bold">{p.name}</td>
                      <td>{p.category}</td>
                      <td>₹{p.price}/{p.unit}</td>
                      <td>{p.stock}</td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => openForm(p)}>Edit</button>
                        <button className="btn btn-red btn-sm ml-2" onClick={() => handleDelete(p._id)}>Del</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {view === "orders" && (
            <div className="tbl-wrap">
              <table>
                <thead><tr><th>ID</th><th>Farmer</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o._id}>
                      <td>#{o._id.slice(-6)}</td>
                      <td>{o.buyerId?.name}</td>
                      <td>₹{o.totalAmount}</td>
                      <td>{o.status}</td>
                      <td>
                        {o.status === 'pending' && <button className="btn btn-green btn-sm" onClick={() => updateStatus(o._id, 'shipped')}>Ship It</button>}
                        {o.status === 'shipped' && <button className="btn btn-green btn-sm" onClick={() => updateStatus(o._id, 'delivered')}>Delivered</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {modal && (
        <div className="overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">{editId ? "Edit" : "New"} Product</h2>
            <form onSubmit={handleSave}>
              <div className="fg"><label className="fl">Name</label><input className="fi" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div className="fg">
                <label className="fl">Category</label>
                <select className="fsel" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="fg"><label className="fl">Price</label><input className="fi" type="number" required value={form.price} onChange={e => setForm({...form, price: e.target.value})} /></div>
                <div className="fg"><label className="fl">Stock</label><input className="fi" type="number" required value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} /></div>
              </div>
              <div className="fg"><label className="fl">Unit</label><input className="fi" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} /></div>
              <div className="fg"><label className="fl">Description</label><textarea className="fta" rows="3" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <div className="flex gap-4 mt-6">
                <button type="button" className="btn btn-ghost flex-1" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-green flex-1">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="toasts">
        {toasts.map(t => <div key={t.id} className="toast">{t.msg}</div>)}
      </div>
    </div>
  );
}