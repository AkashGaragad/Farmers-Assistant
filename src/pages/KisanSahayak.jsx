import { useState, useMemo } from "react";

const SCHEMES = [
  {
    id: 1,
    name: "PM-Kisan Samman Nidhi",
    shortName: "PM-Kisan",
    category: "Financial Assistance",
    cropTypes: ["All Crops"],
    states: ["All States"],
    description: "Direct income support of ₹6,000 per year to all landholding farmer families, provided in three equal installments of ₹2,000 directly into bank accounts.",
    eligibility: "All landholding farmer families with cultivable land. Excludes income tax payers, government employees, and professionals.",
    benefit: "₹6,000/year (₹2,000 × 3 installments)",
    featured: true,
    icon: "💰",
    color: "emerald",
    link: "https://pmkisan.gov.in",
    tags: ["Income Support", "Direct Benefit Transfer"],
  },
  {
    id: 2,
    name: "Pradhan Mantri Fasal Bima Yojana",
    shortName: "PMFBY",
    category: "Crop Insurance",
    cropTypes: ["Food Crops", "Oilseeds", "Horticulture"],
    states: ["All States"],
    description: "Comprehensive crop insurance scheme providing financial support to farmers suffering crop loss/damage due to unforeseen events like natural calamities, pests and diseases.",
    eligibility: "All farmers growing notified crops in notified areas. Compulsory for loanee farmers, voluntary for non-loanee farmers.",
    benefit: "Up to full sum insured; farmers pay only 1.5%-5% premium",
    featured: true,
    icon: "🛡️",
    color: "blue",
    link: "https://pmfby.gov.in",
    tags: ["Insurance", "Risk Coverage"],
  },
  {
    id: 3,
    name: "Soil Health Card Scheme",
    shortName: "SHC",
    category: "Crop Farming",
    cropTypes: ["All Crops"],
    states: ["All States"],
    description: "Provides farmers a soil health card with crop-wise recommendations of nutrients and fertilizers required for individual farms to help improve productivity.",
    eligibility: "All farmers. Cards are issued once every 2 years for each farm holding.",
    benefit: "Free soil testing + personalized fertilizer recommendations",
    featured: true,
    icon: "🌱",
    color: "green",
    link: "https://soilhealth.dac.gov.in",
    tags: ["Soil Testing", "Productivity"],
  },
  {
    id: 4,
    name: "Kisan Credit Card",
    shortName: "KCC",
    category: "Financial Assistance",
    cropTypes: ["All Crops"],
    states: ["All States"],
    description: "Provides farmers with timely credit support from the banking system for their agricultural and ancillary needs at affordable interest rates through a revolving credit facility.",
    eligibility: "Farmers, tenant farmers, sharecroppers, self-help groups, and joint liability groups of farmers including tenant farmers.",
    benefit: "Credit up to ₹3 lakh at 4% interest per annum (with subsidy)",
    featured: true,
    icon: "💳",
    color: "purple",
    link: "https://www.nabard.org/content.aspx?id=572",
    tags: ["Credit", "Low Interest"],
  },
  {
    id: 5,
    name: "National Mission on Micro Irrigation",
    shortName: "NMMI / PMKSY",
    category: "Irrigation",
    cropTypes: ["All Crops", "Horticulture", "Vegetables"],
    states: ["All States"],
    description: "Promotes water-use efficiency through micro-irrigation methods like drip and sprinkler irrigation under PMKSY (Per Drop More Crop component).",
    eligibility: "All farmers. Small and marginal farmers get higher subsidy of 55%, others 45%.",
    benefit: "45%-55% subsidy on drip/sprinkler irrigation systems",
    featured: false,
    icon: "💧",
    color: "cyan",
    link: "https://pmksy.gov.in",
    tags: ["Water Saving", "Subsidy"],
  },
  {
    id: 6,
    name: "Sub-Mission on Agricultural Mechanization",
    shortName: "SMAM",
    category: "Equipment Subsidy",
    cropTypes: ["All Crops"],
    states: ["All States"],
    description: "Promotes farm mechanization by providing financial assistance for purchase of agricultural machinery and equipment to farmers and custom hiring centres.",
    eligibility: "Individual farmers, cooperative societies, SHGs, custom hiring centres. Priority to small/marginal farmers and SC/ST farmers.",
    benefit: "40%-50% subsidy on agricultural machinery and equipment",
    featured: false,
    icon: "🚜",
    color: "amber",
    link: "https://agrimachinery.nic.in",
    tags: ["Machinery", "Mechanization"],
  },
  {
    id: 7,
    name: "Paramparagat Krishi Vikas Yojana",
    shortName: "PKVY",
    category: "Crop Farming",
    cropTypes: ["Organic Crops", "All Crops"],
    states: ["All States"],
    description: "Promotes organic farming through cluster-based approach, providing financial assistance for certification, marketing, and capacity building for organic farming.",
    eligibility: "Farmers willing to adopt organic farming. Groups of minimum 50 farmers forming clusters of 50 acres.",
    benefit: "₹50,000/hectare over 3 years for organic inputs",
    featured: false,
    icon: "🌿",
    color: "green",
    link: "https://pgsindia-ncof.gov.in",
    tags: ["Organic", "Certification"],
  },
  {
    id: 8,
    name: "National Food Security Mission",
    shortName: "NFSM",
    category: "Crop Farming",
    cropTypes: ["Rice", "Wheat", "Pulses", "Coarse Cereals"],
    states: ["Selected States"],
    description: "Aims to increase production of rice, wheat, pulses and coarse cereals through area expansion and productivity enhancement in sustainable manner.",
    eligibility: "Farmers in selected districts across targeted states. Focus on small and marginal farmers.",
    benefit: "Subsidy on seeds, fertilizers, farm machinery, and irrigation equipment",
    featured: false,
    icon: "🌾",
    color: "yellow",
    link: "https://nfsm.gov.in",
    tags: ["Food Security", "Productivity"],
  },
  {
    id: 9,
    name: "PM Krishi Sinchai Yojana",
    shortName: "PMKSY",
    category: "Irrigation",
    cropTypes: ["All Crops"],
    states: ["All States"],
    description: "Aims to expand irrigation coverage, improve water-use efficiency and introduce sustainable water conservation practices with the motto 'Har Khet Ko Pani, More Crop Per Drop'.",
    eligibility: "All farmers in selected districts. Priority to water-stressed regions and drought-prone areas.",
    benefit: "Subsidized water conservation structures, watershed development support",
    featured: false,
    icon: "🏞️",
    color: "blue",
    link: "https://pmksy.gov.in",
    tags: ["Water Conservation", "Irrigation"],
  },
  {
    id: 10,
    name: "Urea Neem Coating Scheme",
    shortName: "Neem Coated Urea",
    category: "Fertilizer Subsidy",
    cropTypes: ["All Crops"],
    states: ["All States"],
    description: "Mandatory neem coating of urea to reduce misuse, improve nitrogen use efficiency, reduce soil and water pollution, and benefit farmers through slow release of nitrogen.",
    eligibility: "All farmers. Neem-coated urea is available at the same price as regular urea at retail outlets.",
    benefit: "Better nitrogen availability + subsidized price of urea",
    featured: false,
    icon: "🌿",
    color: "teal",
    link: "https://fert.nic.in",
    tags: ["Fertilizer", "Subsidy"],
  },
  {
    id: 11,
    name: "Agri Clinics and Agri Business Centres",
    shortName: "ACABC",
    category: "Financial Assistance",
    cropTypes: ["All Crops"],
    states: ["All States"],
    description: "Provides extension services to farmers on various aspects of agriculture and to create gainful employment for agricultural graduates by setting up agri ventures.",
    eligibility: "Agricultural graduates, diploma holders in agriculture and allied subjects.",
    benefit: "Training, credit linkage up to ₹20 lakh, 36%-44% back-end subsidy",
    featured: false,
    icon: "🏥",
    color: "red",
    link: "https://acabc.com",
    tags: ["Agripreneur", "Employment"],
  },
  {
    id: 12,
    name: "Rastriya Krishi Vikas Yojana",
    shortName: "RKVY",
    category: "Crop Farming",
    cropTypes: ["All Crops", "Horticulture", "Animal Husbandry"],
    states: ["All States"],
    description: "Ensures holistic development of agriculture and allied sectors by allowing states to choose their own agriculture and allied sector development activities.",
    eligibility: "Farmers and agricultural entrepreneurs. Activities vary by state-specific plans.",
    benefit: "Infrastructure development, input support, technology adoption grants",
    featured: false,
    icon: "📋",
    color: "indigo",
    link: "https://rkvy.nic.in",
    tags: ["Development", "Infrastructure"],
  },
];

const CATEGORIES = ["All Categories", "Crop Farming", "Irrigation", "Fertilizer Subsidy", "Equipment Subsidy", "Crop Insurance", "Financial Assistance"];
const STATES = ["All States", "Andhra Pradesh", "Bihar", "Gujarat", "Haryana", "Karnataka", "Madhya Pradesh", "Maharashtra", "Punjab", "Rajasthan", "Tamil Nadu", "Uttar Pradesh", "West Bengal"];
const CROP_TYPES = ["All Crops", "Rice", "Wheat", "Pulses", "Oilseeds", "Vegetables", "Horticulture", "Coarse Cereals", "Organic Crops", "Food Crops"];

const COLOR_MAP = {
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-800", icon: "bg-emerald-100", dot: "bg-emerald-500" },
  blue: { bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-100 text-blue-800", icon: "bg-blue-100", dot: "bg-blue-500" },
  green: { bg: "bg-green-50", border: "border-green-200", badge: "bg-green-100 text-green-800", icon: "bg-green-100", dot: "bg-green-500" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", badge: "bg-purple-100 text-purple-800", icon: "bg-purple-100", dot: "bg-purple-500" },
  cyan: { bg: "bg-cyan-50", border: "border-cyan-200", badge: "bg-cyan-100 text-cyan-800", icon: "bg-cyan-100", dot: "bg-cyan-500" },
  amber: { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-800", icon: "bg-amber-100", dot: "bg-amber-500" },
  yellow: { bg: "bg-yellow-50", border: "border-yellow-200", badge: "bg-yellow-100 text-yellow-800", icon: "bg-yellow-100", dot: "bg-yellow-500" },
  teal: { bg: "bg-teal-50", border: "border-teal-200", badge: "bg-teal-100 text-teal-800", icon: "bg-teal-100", dot: "bg-teal-500" },
  red: { bg: "bg-red-50", border: "border-red-200", badge: "bg-red-100 text-red-800", icon: "bg-red-100", dot: "bg-red-500" },
  indigo: { bg: "bg-indigo-50", border: "border-indigo-200", badge: "bg-indigo-100 text-indigo-800", icon: "bg-indigo-100", dot: "bg-indigo-500" },
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
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                  ⭐ Featured
                </span>
              )}
            </div>
            <h3 className="font-bold text-gray-900 text-base leading-tight">{scheme.name}</h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{scheme.shortName}</p>
          </div>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed mb-3">{scheme.description}</p>

        <div className="rounded-xl bg-white/70 border border-white p-3 mb-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Benefit</p>
          <p className="text-sm font-semibold text-gray-800">{scheme.benefit}</p>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
        >
          {expanded ? "▲ Hide" : "▼ Show"} eligibility criteria
        </button>

        {expanded && (
          <div className="mt-3 rounded-xl bg-white/70 border border-white p-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Eligibility</p>
            <p className="text-sm text-gray-700 leading-relaxed">{scheme.eligibility}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-1 mt-3">
          {scheme.tags.map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/80 text-gray-600 border border-gray-200">
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

function FeaturedStrip() {
  const featured = SCHEMES.filter(s => s.featured);
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

function StatsBar() {
  return (
    <div className="grid grid-cols-3 gap-3 mb-8">
      {[
        { icon: "📋", label: "Total Schemes", value: "12+" },
        { icon: "🏛️", label: "Ministries", value: "6" },
        { icon: "🌾", label: "Crop Types", value: "10+" },
      ].map(stat => (
        <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
          <div className="text-2xl mb-1">{stat.icon}</div>
          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedState, setSelectedState] = useState("All States");
  const [selectedCrop, setSelectedCrop] = useState("All Crops");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return SCHEMES.filter(scheme => {
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
    <div className="min-h-screen bg-stone-50 font-sans">
      {/* Header */}
      <header className="bg-green-800 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl">🌾</span>
            <div>
              <h1 className="font-bold text-lg leading-tight">Kisan Sahayak</h1>
              <p className="text-green-300 text-xs hidden sm:block">Government Schemes Portal</p>
            </div>
          </div>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search schemes, benefits..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/20 transition-all"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Hero */}
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
            🇮🇳 Find Your <span className="text-green-700">Government Benefits</span>
          </h2>
          <p className="text-gray-600 text-base max-w-xl mx-auto">
            Discover subsidies, insurance, credit, and support programs available for Indian farmers across all states.
          </p>
        </div>

        <StatsBar />
        <FeaturedStrip />

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔽</span>
              <h3 className="font-semibold text-gray-800">Filter Schemes</h3>
              {activeFilters > 0 && (
                <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded-full">
                  {activeFilters} active
                </span>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden text-sm text-green-700 font-semibold"
            >
              {showFilters ? "Hide" : "Show"} Filters
            </button>
          </div>

          <div className={`${showFilters ? "flex" : "hidden"} sm:flex flex-col sm:flex-row gap-3`}>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select
              value={selectedState}
              onChange={e => setSelectedState(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {STATES.map(s => <option key={s}>{s}</option>)}
            </select>
            <select
              value={selectedCrop}
              onChange={e => setSelectedCrop(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {CROP_TYPES.map(c => <option key={c}>{c}</option>)}
            </select>
            {activeFilters > 0 && (
              <button
                onClick={() => { setSelectedCategory("All Categories"); setSelectedState("All States"); setSelectedCrop("All Crops"); }}
                className="px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-semibold hover:bg-red-100 transition-colors whitespace-nowrap"
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
                  ? "bg-green-700 text-white border-green-700 shadow-md"
                  : "bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600 text-sm">
            Showing <span className="font-bold text-gray-900">{filtered.length}</span> scheme{filtered.length !== 1 ? "s" : ""}
            {search && <span> for "<span className="text-green-700 font-semibold">{search}</span>"</span>}
          </p>
        </div>

        {/* Scheme Cards Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(scheme => (
              <SchemeCard key={scheme.id} scheme={scheme} featured={scheme.featured} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No schemes found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your filters or search terms</p>
            <button
              onClick={() => { setSearch(""); setSelectedCategory("All Categories"); setSelectedState("All States"); setSelectedCrop("All Crops"); }}
              className="px-6 py-2 bg-green-700 text-white rounded-xl font-semibold hover:bg-green-800 transition-colors"
            >
              Reset all filters
            </button>
          </div>
        )}

        {/* Help Banner */}
        <div className="mt-12 bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="text-4xl flex-shrink-0">📞</div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-bold text-amber-900 text-lg">Need Help Applying?</h3>
            <p className="text-amber-800 text-sm mt-1">
              Call the Kisan Call Centre at <span className="font-bold">1800-180-1551</span> (toll-free) or visit your nearest Common Service Centre (CSC) for assistance with applications.
            </p>
          </div>
          <a
            href="tel:18001801551"
            className="flex-shrink-0 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold text-sm transition-colors"
          >
            📞 Call Now
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-green-900 text-green-200 mt-12 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-2xl">🌾</span>
            <span className="font-bold text-white text-lg">Kisan Sahayak</span>
          </div>
          <p className="text-sm mb-2">
            A farmers' portal for discovering government schemes & subsidies
          </p>
          <p className="text-xs text-green-400">
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
      </footer>
    </div>
  );
}
