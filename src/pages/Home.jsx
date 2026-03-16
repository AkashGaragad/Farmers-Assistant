import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LiveAuctionSection from "../componentas/LiveAuctionSection";

const features = [
  {
    id: "disease-detection",
    path: "/disease-detection",
    icon: "🔬",
    title: "Crops Disease Detection",
    badge: "AI Powered",
    badgeColor: "bg-emerald-500",
    description:
      "Upload a photo of your crop and our AI instantly identifies diseases, pests, and deficiencies — with actionable treatment recommendations to save your harvest before it's too late.",
    highlights: ["Instant photo diagnosis", "95%+ accuracy", "Treatment guide included"],
    accent: "from-emerald-500 to-green-400",
    border: "hover:border-emerald-500",
    glow: "hover:shadow-emerald-500/20",
  },
  {
    id: "fertiliser-guide",
    path: "/fertiliser-guide",
    icon: "🧪",
    title: "Do Not Misuse Your Fertiliser",
    badge: "Save Money",
    badgeColor: "bg-amber-500",
    description:
      "Over-fertilising wastes money and harms your soil. Get crop-specific and soil-tested fertiliser schedules so every rupee you spend on inputs gives maximum yield.",
    highlights: ["Soil health analysis", "Dosage calculator", "Cost optimiser"],
    accent: "from-amber-500 to-yellow-400",
    border: "hover:border-amber-500",
    glow: "hover:shadow-amber-500/20",
  },
  {
    id: "government-schemes",
    path: "/government-schemes",
    icon: "🏛️",
    title: "Government Schemes",
    badge: "Free Benefits",
    badgeColor: "bg-blue-500",
    description:
      "Discover subsidies, loans, and welfare programs you qualify for. We cut through the paperwork and show you exactly how to apply — in your local language.",
    highlights: ["State & central schemes", "Eligibility checker", "Application support"],
    accent: "from-blue-500 to-sky-400",
    border: "hover:border-blue-500",
    glow: "hover:shadow-blue-500/20",
  },
  // {
  //   id: "connect-buyers",
  //   path: "/connect-buyers",
  //   icon: "🤝",
  //   title: "Connect with Buyers",
  //   badge: "Best Price",
  //   badgeColor: "bg-violet-500",
  //   description:
  //     "Skip the middlemen. List your produce and connect directly with verified retailers, exporters, and wholesale buyers who offer fair market prices.",
  //   highlights: ["Verified buyer network", "Live price comparison", "Direct deals"],
  //   accent: "from-violet-500 to-purple-400",
  //   border: "hover:border-violet-500",
  //   glow: "hover:shadow-violet-500/20",
  // },
  {
    id: "smart-assistant",
    path: "/smart-assistant",
    icon: "🤖",
    title: "Smart Assistant",
    badge: "24/7 Help",
    badgeColor: "bg-cyan-500",
    description:
      "Ask anything — weather, sowing calendar, pest alerts, market rates — and get instant answers in Hindi, Marathi, Tamil, Telugu, and more regional languages.",
    highlights: ["Voice & text support", "10+ regional languages", "Offline mode"],
    accent: "from-cyan-500 to-teal-400",
    border: "hover:border-cyan-500",
    glow: "hover:shadow-cyan-500/20",
  },
  {
    id: "buy-supplies",
    path: "/buy-supplies",
    icon: "🛒",
    title: "Buy Fertiliser & Pesticides",
    badge: "Doorstep Delivery",
    badgeColor: "bg-rose-500",
    description:
      "Order certified, government-approved fertilisers and pesticides at competitive prices — delivered straight to your village. No fake products, no travel required.",
    highlights: ["ISI certified products", "Village delivery", "Cash on delivery"],
    accent: "from-rose-500 to-pink-400",
    border: "hover:border-rose-500",
    glow: "hover:shadow-rose-500/20",
  },
];

const stats = [
  { value: "2.4L+", label: "Farmers Helped" },
  { value: "18", label: "States Covered" },
  { value: "10+", label: "Regional Languages" },
  { value: "95%", label: "Disease Accuracy" },
];

export default function Home() {
  const [dark, setDark] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${dark ? "bg-gray-950 text-gray-100" : "bg-stone-50 text-gray-900"}`}>
      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 inset-x-0 z-50 backdrop-blur-md border-b transition-colors duration-300 ${dark ? "bg-gray-950/80 border-gray-800" : "bg-white/80 border-stone-200"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌾</span>
            <span className={`text-xl font-bold tracking-tight ${dark ? "text-emerald-400" : "text-emerald-600"}`}>
              Farmers<span className={dark ? "text-white" : "text-gray-900"}>Assistant</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            {["Disease", "Fertiliser", "Schemes", "Buyers", "Assistant", "Shop"].map((label, i) => (
              <button
                key={label}
                onClick={() => navigate(features[i].path)}
                className={`transition-colors hover:text-emerald-500 ${dark ? "text-gray-400" : "text-gray-600"}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Dark / Light Toggle */}
          <button
            onClick={() => setDark(!dark)}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${dark ? "bg-emerald-600" : "bg-stone-300"}`}
            aria-label="Toggle dark mode"
          >
            <span
              className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full flex items-center justify-center text-sm transition-transform duration-300 shadow-md ${dark ? "translate-x-7 bg-gray-950" : "translate-x-0 bg-white"}`}
            >
              {dark ? "🌙" : "☀️"}
            </span>
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-28 pb-20 px-4 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-green-400/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <span className={`inline-block mb-4 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest ${dark ? "bg-emerald-900/60 text-emerald-300 border border-emerald-700" : "bg-emerald-100 text-emerald-700 border border-emerald-300"}`}>
            🌱 Built for every Indian farmer
          </span>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
            <span className={dark ? "text-white" : "text-gray-900"}>Smarter Farming</span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
              Starts Here
            </span>
          </h1>

          <p className={`text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed ${dark ? "text-gray-400" : "text-gray-600"}`}>
            Detect crop diseases, avoid fertiliser waste, claim government benefits, sell directly to buyers — all in one free platform designed for Indian farmers.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => navigate("/smart-assistant")}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold text-base shadow-lg hover:shadow-emerald-500/40 hover:scale-105 transition-all duration-200"
            >
              Try Smart Assistants
            </button>
            <button
              onClick={() => navigate("/disease-detection")}
              className={`px-8 py-3.5 rounded-full font-semibold text-base border transition-all duration-200 hover:scale-105 ${dark ? "border-gray-700 text-gray-300 hover:border-emerald-500 hover:text-emerald-400" : "border-stone-300 text-gray-700 hover:border-emerald-500 hover:text-emerald-600"}`}
            >
              Detect Disease
            </button>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className={`py-10 border-y ${dark ? "border-gray-800 bg-gray-900/50" : "border-stone-200 bg-white"}`}>
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {stats.map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                {value}
              </p>
              <p className={`text-sm mt-1 ${dark ? "text-gray-500" : "text-gray-500"}`}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      <LiveAuctionSection dark={dark} />

      {/* ── FEATURE CARDS ── */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className={`text-3xl sm:text-4xl font-bold mb-3 ${dark ? "text-white" : "text-gray-900"}`}>
              Everything a Farmer Needs
            </h2>
            <p className={`text-base max-w-xl mx-auto ${dark ? "text-gray-500" : "text-gray-500"}`}>
              Six powerful tools — click any card to explore
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <button
                key={f.id}
                onClick={() => navigate(f.path)}
                className={`group relative text-left rounded-2xl border p-6 transition-all duration-300 cursor-pointer overflow-hidden
                  ${dark
                    ? `bg-gray-900 border-gray-800 ${f.border} ${f.glow} hover:shadow-2xl`
                    : `bg-white border-stone-200 ${f.border} hover:shadow-xl hover:shadow-stone-200/60`
                  }`}
              >
                {/* Top gradient line */}
                <div className={`absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r ${f.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">{f.icon}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white ${f.badgeColor}`}>
                    {f.badge}
                  </span>
                </div>

                <h3 className={`text-lg font-bold mb-2 leading-snug ${dark ? "text-white" : "text-gray-900"}`}>
                  {f.title}
                </h3>
                <p className={`text-sm leading-relaxed mb-4 ${dark ? "text-gray-400" : "text-gray-500"}`}>
                  {f.description}
                </p>

                <ul className="space-y-1.5">
                  {f.highlights.map((h) => (
                    <li key={h} className={`flex items-center gap-2 text-xs font-medium ${dark ? "text-gray-400" : "text-gray-500"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${f.accent} flex-shrink-0`} />
                      {h}
                    </li>
                  ))}
                </ul>

                <div className={`mt-5 flex items-center gap-1 text-xs font-semibold bg-gradient-to-r ${f.accent} bg-clip-text text-transparent`}>
                  Explore
                  <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={`border-t py-8 text-center text-sm ${dark ? "border-gray-800 text-gray-600" : "border-stone-200 text-gray-400"}`}>
        <p>© 2025 FarmersAssistant · Made with ❤️ for Indian Farmers</p>
      </footer>
    </div>
  );
}
