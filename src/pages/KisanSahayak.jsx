import { useState, useMemo, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = ["All Categories", "Crop Farming", "Irrigation", "Fertilizer Subsidy", "Equipment Subsidy", "Crop Insurance", "Financial Assistance"];
const STATES = ["All States", "Andhra Pradesh", "Bihar", "Gujarat", "Haryana", "Karnataka", "Madhya Pradesh", "Maharashtra", "Punjab", "Rajasthan", "Tamil Nadu", "Uttar Pradesh", "West Bengal"];
const CROP_TYPES = ["All Crops", "Rice", "Wheat", "Pulses", "Oilseeds", "Vegetables", "Horticulture", "Coarse Cereals", "Organic Crops", "Food Crops"];

const COLOR_MAP = {
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/20", badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400", icon: "bg-emerald-100 dark:bg-emerald-500/20", dot: "bg-emerald-500" },
  blue: { bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-200 dark:border-blue-500/20", badge: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400", icon: "bg-blue-100 dark:bg-blue-500/20", dot: "bg-blue-500" },
  green: { bg: "bg-green-50 dark:bg-green-500/10", border: "border-green-200 dark:border-green-500/20", badge: "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400", icon: "bg-green-100 dark:bg-green-500/20", dot: "bg-green-500" },
  purple: { bg: "bg-purple-50 dark:bg-purple-500/10", border: "border-purple-200 dark:border-purple-500/20", badge: "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400", icon: "bg-purple-100 dark:bg-purple-500/20", dot: "bg-purple-500" },
  cyan: { bg: "bg-cyan-50 dark:bg-cyan-500/10", border: "border-cyan-200 dark:border-cyan-500/20", badge: "bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-400", icon: "bg-cyan-100 dark:bg-cyan-500/20", dot: "bg-cyan-500" },
  amber: { bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-200 dark:border-amber-500/20", badge: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400", icon: "bg-amber-100 dark:bg-amber-500/20", dot: "bg-amber-500" },
  yellow: { bg: "bg-yellow-50 dark:bg-yellow-500/10", border: "border-yellow-200 dark:border-yellow-500/20", badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400", icon: "bg-yellow-100 dark:bg-yellow-500/20", dot: "bg-yellow-500" },
  teal: { bg: "bg-teal-50 dark:bg-teal-500/10", border: "border-teal-200 dark:border-teal-500/20", badge: "bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-400", icon: "bg-teal-100 dark:bg-teal-500/20", dot: "bg-teal-500" },
  red: { bg: "bg-red-50 dark:bg-red-500/10", border: "border-red-200 dark:border-red-500/20", badge: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400", icon: "bg-red-100 dark:bg-red-500/20", dot: "bg-red-500" },
  indigo: { bg: "bg-indigo-50 dark:bg-indigo-500/10", border: "border-indigo-200 dark:border-indigo-500/20", badge: "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-400", icon: "bg-indigo-100 dark:bg-indigo-500/20", dot: "bg-indigo-500" },
};

function SchemeCard({ scheme, featured = false }) {
  const [expanded, setExpanded] = useState(false);
  const colors = COLOR_MAP[scheme.color] || COLOR_MAP.green;

  return (
    <div className={`rounded-2xl border ${colors.border} ${colors.bg} overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex flex-col`}>
      <div className="p-5 flex-1">
        <div className="flex items-start gap-3 mb-3">
          <div className={`${colors.icon} rounded-xl w-12 h-12 flex items-center justify-center text-2xl flex-shrink-0`}>
            {scheme.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}>
                {scheme.category}
              </span>
              {featured && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400">
                  ⭐ Featured
                </span>
              )}
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight">{scheme.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">{scheme.shortName}</p>
          </div>
        </div>

        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">{scheme.description}</p>

        <div className="rounded-xl bg-white/70 dark:bg-black/20 border border-white dark:border-white/5 p-3 mb-3">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Benefit</p>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{scheme.benefit}</p>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-1 transition-colors"
        >
          {expanded ? "▲ Hide" : "▼ Show"} eligibility criteria
        </button>

        {expanded && (
          <div className="mt-3 rounded-xl bg-white/70 dark:bg-black/20 border border-white dark:border-white/5 p-3">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Eligibility</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{scheme.eligibility}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-1 mt-3">
          {scheme.tags.map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/80 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="px-5 pb-5">
        <a
          href={scheme.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center py-2.5 px-4 rounded-xl bg-green-700 hover:bg-green-800 active:bg-green-900 text-white font-semibold text-sm transition-colors duration-200"
        >
          Apply Now →
        </a>
      </div>
    </div>
  );
}

function FeaturedStrip({ schemes }) {
  const featured = schemes.filter(s => s.featured);
  return (
    <section className="bg-gradient-to-br from-green-800 via-green-700 to-emerald-800 rounded-3xl p-6 mb-8 text-white">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">⭐</span>
        <h2 className="text-xl font-bold">Flagship Schemes</h2>
      </div>
      <p className="text-green-200 text-sm mb-5">Most impactful schemes for Indian farmers</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {featured.map(scheme => (
          <a
            key={scheme.id}
            href={scheme.link}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl p-3 text-center transition-all duration-200 hover:-translate-y-0.5 border border-white/20"
          >
            <div className="text-3xl mb-2">{scheme.icon}</div>
            <p className="font-bold text-sm leading-tight">{scheme.shortName}</p>
            <p className="text-green-200 text-xs mt-1 leading-tight">{scheme.benefit}</p>
          </a>
        ))}
      </div>
    </section>
  );
}

function StatsBar({ totalSchemes }) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-8">
      {[
        { icon: "📋", label: "Total Schemes", value: totalSchemes.toString() },
        { icon: "🏛️", label: "Ministries", value: "6" },
        { icon: "🌾", label: "Crop Types", value: "10+" },
      ].map(stat => (
        <div key={stat.label} className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 p-4 text-center shadow-sm">
          <div className="text-2xl mb-1">{stat.icon}</div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

export default function KisanSahayak() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedState, setSelectedState] = useState("All States");
  const [selectedCrop, setSelectedCrop] = useState("All Crops");
  const [showFilters, setShowFilters] = useState(false);
  
  const { api } = useAuth(); // Reusing the configured axios instance

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const { data } = await api.get('/schemes');
        setSchemes(data);
      } catch (error) {
        console.error("Failed to fetch schemes", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();
  }, []);

  const filtered = useMemo(() => {
    return schemes.filter(scheme => {
      const q = search.toLowerCase();
      const matchSearch = !q || scheme.name.toLowerCase().includes(q) || scheme.description.toLowerCase().includes(q) || scheme.shortName.toLowerCase().includes(q) || scheme.tags.some(t => t.toLowerCase().includes(q));
      const matchCat = selectedCategory === "All Categories" || scheme.category === selectedCategory;
      const matchState = selectedState === "All States" || scheme.states.includes("All States") || scheme.states.includes(selectedState);
      const matchCrop = selectedCrop === "All Crops" || scheme.cropTypes.includes("All Crops") || scheme.cropTypes.includes(selectedCrop);
      return matchSearch && matchCat && matchState && matchCrop;
    });
  }, [search, selectedCategory, selectedState, selectedCrop]);

  const activeFilters = [selectedCategory !== "All Categories", selectedState !== "All States", selectedCrop !== "All Crops"].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#0e120c] font-sans transition-colors duration-300">
      {/* Header */}
      <header className="bg-green-800 dark:bg-emerald-950 text-white sticky top-0 md:top-16 z-40 shadow-lg border-b border-transparent dark:border-white/10 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl">🌾</span>
            <div>
              <h1 className="font-bold text-lg leading-tight text-white">Kisan Sahayak</h1>
              <p className="text-green-300 text-xs hidden sm:block font-medium tracking-wide">Government Schemes Portal</p>
            </div>
          </div>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search schemes, benefits..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/20 dark:bg-black/40 border border-white/20 dark:border-white/10 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-black/30 transition-all font-medium"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Hero */}
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 leading-tight">
            🇮🇳 Find Your <span className="text-green-700 dark:text-emerald-400">Government Benefits</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-base max-w-xl mx-auto">
            Discover subsidies, insurance, credit, and support programs available for Indian farmers across all states.
          </p>
        </div>

        <StatsBar totalSchemes={schemes.length} />
        <FeaturedStrip schemes={schemes} />

        {/* Filters */}
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm p-4 mb-6 transition-colors duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔽</span>
              <h3 className="font-semibold text-gray-800 dark:text-white">Filter Schemes</h3>
              {activeFilters > 0 && (
                <span className="bg-green-100 text-green-800 dark:bg-emerald-500/20 dark:text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full">
                  {activeFilters} active
                </span>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden text-sm text-green-700 dark:text-emerald-400 font-semibold"
            >
              {showFilters ? "Hide" : "Show"} Filters
            </button>
          </div>

          <div className={`${showFilters ? "flex" : "hidden"} sm:flex flex-col sm:flex-row gap-3`}>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-emerald-500 transition-colors"
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select
              value={selectedState}
              onChange={e => setSelectedState(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-emerald-500 transition-colors"
            >
              {STATES.map(s => <option key={s}>{s}</option>)}
            </select>
            <select
              value={selectedCrop}
              onChange={e => setSelectedCrop(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-emerald-500 transition-colors"
            >
              {CROP_TYPES.map(c => <option key={c}>{c}</option>)}
            </select>
            {activeFilters > 0 && (
              <button
                onClick={() => { setSelectedCategory("All Categories"); setSelectedState("All States"); setSelectedCrop("All Crops"); }}
                className="px-4 py-2 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors whitespace-nowrap"
              >
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                selectedCategory === cat
                  ? "bg-green-700 text-white border-green-700 shadow-md dark:bg-emerald-600 dark:border-emerald-600"
                  : "bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-green-400 dark:hover:border-emerald-500/50 hover:text-green-700 dark:hover:text-emerald-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Showing <span className="font-bold text-gray-900 dark:text-white">{filtered.length}</span> scheme{filtered.length !== 1 ? "s" : ""}
            {search && <span> for "<span className="text-green-700 dark:text-emerald-400 font-semibold">{search}</span>"</span>}
          </p>
        </div>

        {/* Scheme Cards Grid */}
        {loading ? (
             <div className="flex justify-center py-16">
                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
             </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(scheme => (
              <SchemeCard key={scheme.id} scheme={scheme} featured={scheme.featured} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">No schemes found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Try adjusting your filters or search terms</p>
            <button
              onClick={() => { setSearch(""); setSelectedCategory("All Categories"); setSelectedState("All States"); setSelectedCrop("All Crops"); }}
              className="px-6 py-2 bg-green-700 dark:bg-emerald-600 text-white rounded-xl font-semibold hover:bg-green-800 dark:hover:bg-emerald-700 transition-colors"
            >
              Reset all filters
            </button>
          </div>
        )}

        {/* Help Banner */}
        <div className="mt-12 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="text-4xl flex-shrink-0">📞</div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-bold text-amber-900 dark:text-amber-400 text-lg">Need Help Applying?</h3>
            <p className="text-amber-800 dark:text-amber-200/70 text-sm mt-1">
              Call the Kisan Call Centre at <span className="font-bold">1800-180-1551</span> (toll-free) or visit your nearest Common Service Centre (CSC) for assistance with applications.
            </p>
          </div>
          <a
            href="tel:18001801551"
            className="flex-shrink-0 px-5 py-2.5 bg-amber-600 dark:bg-amber-500/20 hover:bg-amber-700 dark:hover:bg-amber-500/30 text-white dark:text-amber-400 rounded-xl font-semibold text-sm transition-colors border border-transparent dark:border-amber-500/30"
          >
            📞 Call Now
          </a>
        </div>
      </main>

      {/* Disclaimer */}
      <div className="bg-green-900 dark:bg-black/40 text-green-200 dark:text-gray-400 mt-12 py-8 px-4 border-t border-transparent dark:border-white/5">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs text-green-400 dark:text-gray-500 font-medium">
            All scheme details are for informational purposes. Please verify current benefits and eligibility on official government websites before applying.
          </p>
          <div className="mt-4 flex justify-center gap-4 text-xs">
            <a href="https://agricoop.nic.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Ministry of Agriculture</a>
            <span>•</span>
            <a href="https://pmkisan.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">PM-Kisan</a>
            <span>•</span>
            <a href="https://pmfby.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">PMFBY</a>
          </div>
        </div>
      </div>
    </div>
  );
}
