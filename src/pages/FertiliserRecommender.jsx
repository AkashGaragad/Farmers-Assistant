import { useState } from "react";

// ─── Data ───────────────────────────────────────────────────────────────────

const CROP_REQUIREMENTS = {
  wheat:     { N:"high",   P:"medium", K:"medium", pH_min:6.0, pH_max:7.5, icon:"🌾", description:"Cereal grain – heavy nitrogen feeder" },
  rice:      { N:"high",   P:"medium", K:"high",   pH_min:5.5, pH_max:7.0, icon:"🍚", description:"Aquatic cereal – needs balanced N & K" },
  maize:     { N:"high",   P:"high",   K:"medium", pH_min:5.8, pH_max:7.0, icon:"🌽", description:"Corn – high N & P demand" },
  potato:    { N:"medium", P:"high",   K:"high",   pH_min:5.0, pH_max:6.5, icon:"🥔", description:"Tuber crop – high P & K for root development" },
  tomato:    { N:"medium", P:"high",   K:"high",   pH_min:5.5, pH_max:7.0, icon:"🍅", description:"Fruiting vegetable – needs P & K for fruit set" },
  sugarcane: { N:"high",   P:"medium", K:"high",   pH_min:6.0, pH_max:7.5, icon:"🎋", description:"Cash crop – high N & K for biomass" },
  soybean:   { N:"low",    P:"medium", K:"medium", pH_min:6.0, pH_max:7.0, icon:"🫘", description:"Legume – fixes its own nitrogen, needs P & K" },
  cotton:    { N:"high",   P:"medium", K:"high",   pH_min:6.0, pH_max:7.5, icon:"🌿", description:"Fibre crop – high N & K for boll development" },
  onion:     { N:"medium", P:"high",   K:"medium", pH_min:6.0, pH_max:7.0, icon:"🧅", description:"Bulb vegetable – needs P for bulb formation" },
  banana:    { N:"high",   P:"medium", K:"high",   pH_min:5.5, pH_max:7.0, icon:"🍌", description:"Fruit crop – very high K demand" },
};

const THRESHOLDS = {
  N: { low: 280, high: 560 },
  P: { low: 10,  high: 25  },
  K: { low: 100, high: 200 },
};

const FERTILISERS = {
  "Urea (46-0-0)":                        { nutrients:["N"],       max:200,  note:"Fast-release N; apply in split doses to prevent leaching." },
  "DAP (18-46-0)":                        { nutrients:["N","P"],   max:150,  note:"Great starter; supplies both N and P." },
  "SSP (0-16-0)":                         { nutrients:["P"],       max:250,  note:"Slow-release P; also adds calcium and sulfur." },
  "TSP (0-46-0)":                         { nutrients:["P"],       max:100,  note:"Concentrated P; use sparingly to avoid lock-up." },
  "MOP / Muriate of Potash (0-0-60)":     { nutrients:["K"],       max:150,  note:"Common K source; excess chloride can harm sensitive crops." },
  "SOP / Sulphate of Potash (0-0-50)":    { nutrients:["K"],       max:150,  note:"Chloride-free K; preferred for potatoes, tomatoes, fruits." },
  "NPK 10-26-26":                         { nutrients:["N","P","K"],max:200, note:"Balanced compound; ideal when all three are deficient." },
  "NPK 12-32-16":                         { nutrients:["N","P","K"],max:200, note:"High-P blend; good for crop establishment." },
  "Ammonium Sulphate (21-0-0-24S)":       { nutrients:["N"],       max:200,  note:"Acidifying N source; useful on high-pH soils. Contains S." },
  "Potassium Nitrate (13-0-44)":          { nutrients:["N","K"],   max:150,  note:"Chloride-free N+K; ideal for fertigation." },
  "Lime (CaCO₃)":                         { nutrients:[],          max:3000, note:"Raises soil pH. Apply 1–3 t/ha based on buffer pH." },
  "Elemental Sulfur":                     { nutrients:[],          max:500,  note:"Lowers pH on alkaline soils. Apply 200–500 kg/ha." },
};

// ─── Logic ──────────────────────────────────────────────────────────────────

const RANK = { low:0, medium:1, high:2 };

function classifyNutrient(n, v) {
  if (v < THRESHOLDS[n].low)  return "low";
  if (v <= THRESHOLDS[n].high) return "medium";
  return "high";
}

function classifyPH(ph) {
  if (ph < 5.5) return "strongly_acidic";
  if (ph < 6.0) return "moderately_acidic";
  if (ph <= 7.0) return "optimal";
  if (ph <= 7.5) return "slightly_alkaline";
  return "strongly_alkaline";
}

function getDeficiencies(soil, crop) {
  const req = CROP_REQUIREMENTS[crop];
  return ["N","P","K"].filter(n => RANK[classifyNutrient(n, soil[n])] < RANK[req[n]]);
}

function getOveruse(soil, crop) {
  const req = CROP_REQUIREMENTS[crop];
  return ["N","P","K"].reduce((acc, n) => {
    const sl = classifyNutrient(n, soil[n]);
    if (sl === "high" && req[n] === "low")    acc.push({ nutrient:n, severity:"danger" });
    if (sl === "high" && req[n] === "medium") acc.push({ nutrient:n, severity:"warn"   });
    return acc;
  }, []);
}

function recommendFertilisers(deficiencies, crop, phClass) {
  const recs = {};
  const def = new Set(deficiencies);

  if (def.has("N") && def.has("P") && def.has("K")) {
    recs["NPK 10-26-26"] = "All three nutrients (N, P, K) are deficient.";
    recs["NPK 12-32-16"] = "Alternative compound blend for crop establishment.";
  } else if (def.has("N") && def.has("P")) {
    recs["DAP (18-46-0)"] = "Both N and P are deficient; DAP supplies both.";
  } else if (def.has("N") && def.has("K")) {
    recs["Potassium Nitrate (13-0-44)"] = "Both N and K are deficient.";
  } else if (def.has("P") && def.has("K")) {
    recs["SSP (0-16-0)"] = "P is deficient.";
    const sensitive = ["potato","tomato","banana","onion"];
    recs[sensitive.includes(crop) ? "SOP / Sulphate of Potash (0-0-50)" : "MOP / Muriate of Potash (0-0-60)"] =
      sensitive.includes(crop) ? `K deficient; SOP preferred — ${crop} is chloride-sensitive.` : "K is deficient.";
  } else {
    if (def.has("N")) {
      const alkaline = phClass === "slightly_alkaline" || phClass === "strongly_alkaline";
      recs[alkaline ? "Ammonium Sulphate (21-0-0-24S)" : "Urea (46-0-0)"] =
        alkaline ? "N deficient; Ammonium Sulphate also helps lower high pH." : "N is deficient. Apply in 2–3 split doses.";
    }
    if (def.has("P")) recs["TSP (0-46-0)"] = "P is deficient. Apply at recommended rates only.";
    if (def.has("K")) {
      const sensitive = ["potato","tomato","banana","onion"];
      recs[sensitive.includes(crop) ? "SOP / Sulphate of Potash (0-0-50)" : "MOP / Muriate of Potash (0-0-60)"] =
        sensitive.includes(crop) ? `K deficient; SOP chosen — ${crop} is chloride-sensitive.` : "K is deficient.";
    }
  }

  if (phClass === "strongly_acidic" || phClass === "moderately_acidic")
    recs["Lime (CaCO₃)"] = "Soil is too acidic — lime to raise pH before fertilising.";
  if (phClass === "slightly_alkaline" || phClass === "strongly_alkaline")
    recs["Elemental Sulfur"] = "Soil is too alkaline — sulfur helps lower pH and unlock nutrients.";

  return recs;
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function NutrientBar({ nutrient, value }) {
  const level = classifyNutrient(nutrient, value);
  const maxVal = THRESHOLDS[nutrient].high * 1.6;
  const pct = Math.min((value / maxVal) * 100, 100);
  
  const colors = { 
    low: "bg-red-500", textLow: "text-red-500",
    medium: "bg-amber-500", textMedium: "text-amber-500",
    high: "bg-emerald-500", textHigh: "text-emerald-500" 
  };
  
  const labels = { low:"LOW", medium:"MEDIUM", high:"HIGH" };
  
  return (
    <div className="mb-3">
      <div className="flex justify-between items-end mb-1.5">
        <span className="font-mono text-[13px] text-stone-700 dark:text-[#c8d4b8] tracking-widest uppercase">{nutrient}</span>
        <span className={`font-mono text-xs font-bold ${colors["text" + level.charAt(0).toUpperCase() + level.slice(1)]}`}>
          {value} mg/kg — {labels[level]}
        </span>
      </div>
      <div className="h-2 rounded-full bg-stone-200 dark:bg-white/10 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-[800ms] ease-out ${colors[level]} shadow-[0_0_8px_currentColor]`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function PHBadge({ ph }) {
  const cl = classifyPH(ph);
  const map = {
    strongly_acidic:   { label:"Strongly Acidic",   colorClass:"bg-red-500/10 border-red-500/30 text-red-600 dark:bg-red-500/20 dark:border-red-500/40 dark:text-red-400" },
    moderately_acidic: { label:"Moderately Acidic",  colorClass:"bg-orange-500/10 border-orange-500/30 text-orange-600 dark:bg-orange-500/20 dark:border-orange-500/40 dark:text-orange-400" },
    optimal:           { label:"Optimal",            colorClass:"bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-400" },
    slightly_alkaline: { label:"Slightly Alkaline",  colorClass:"bg-amber-500/10 border-amber-500/30 text-amber-600 dark:bg-amber-500/20 dark:border-amber-500/40 dark:text-amber-400" },
    strongly_alkaline: { label:"Strongly Alkaline",  colorClass:"bg-red-500/10 border-red-500/30 text-red-600 dark:bg-red-500/20 dark:border-red-500/40 dark:text-red-400" },
  };
  const { label, colorClass } = map[cl];
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full border text-xs font-mono font-bold tracking-wide ${colorClass}`}>
      {label}
    </span>
  );
}

function FertCard({ name, reason, index }) {
  const fert = FERTILISERS[name];
  const tagColors = { 
    N: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-400",
    P: "bg-sky-500/10 border-sky-500/20 text-sky-600 dark:bg-sky-500/20 dark:border-sky-500/30 dark:text-sky-400",
    K: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:bg-amber-500/20 dark:border-amber-500/30 dark:text-amber-400" 
  };
  
  return (
    <div 
      className="bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 rounded-xl p-4 md:p-5 mb-3 animate-[slideIn_0.4s_ease_both]"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="flex items-start gap-3 md:gap-4 mb-2">
        <span className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[11px] font-bold text-emerald-600 dark:text-[#4caf72] font-mono shrink-0 mt-0.5">
          {index + 1}
        </span>
        <div>
          <div className="font-serif text-[15px] font-semibold text-stone-800 dark:text-[#f0ede4] mb-1.5">{name}</div>
          <div className="flex gap-1.5 flex-wrap items-center">
            {fert.nutrients.map(n => (
              <span key={n} className={`px-2 py-0.5 rounded-lg text-[10px] md:text-[11px] font-bold font-mono ${tagColors[n]}`}>
                {n}
              </span>
            ))}
            <span className="px-2 py-0.5 rounded-lg text-[10px] md:text-[11px] bg-stone-100 dark:bg-white/5 text-stone-500 dark:text-[#8a9a80] font-mono whitespace-nowrap">
              max {fert.max} kg/ha
            </span>
          </div>
        </div>
      </div>
      <p className="mt-2 text-xs md:text-[13px] text-stone-600 dark:text-[#7a9a6a] leading-relaxed pl-9 md:pl-10">{reason}</p>
      <p className="mt-1 text-[11px] md:text-xs text-stone-400 dark:text-white/30 leading-relaxed pl-9 md:pl-10">⚠ {fert.note}</p>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function FertiliserRecommender() {
  const [step, setStep] = useState(0); // 0=inputs, 1=results
  const [soil, setSoil] = useState({ N:"", P:"", K:"", pH:"" });
  const [crop, setCrop] = useState("");
  const [errors, setErrors] = useState({});

  const crops = Object.entries(CROP_REQUIREMENTS);

  function validate() {
    const e = {};
    if (!soil.N || isNaN(soil.N) || +soil.N < 0 || +soil.N > 2000) e.N = "Enter 0–2000";
    if (!soil.P || isNaN(soil.P) || +soil.P < 0 || +soil.P > 200)  e.P = "Enter 0–200";
    if (!soil.K || isNaN(soil.K) || +soil.K < 0 || +soil.K > 1000) e.K = "Enter 0–1000";
    if (!soil.pH || isNaN(soil.pH) || +soil.pH < 3.5 || +soil.pH > 9.5) e.pH = "Enter 3.5–9.5";
    if (!crop) e.crop = "Select a crop";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleAnalyse() {
    if (validate()) setStep(1);
  }

  // Results
  const numSoil = { N:+soil.N, P:+soil.P, K:+soil.K, pH:+soil.pH };
  const req = crop ? CROP_REQUIREMENTS[crop] : null;
  const phClass = crop ? classifyPH(numSoil.pH) : null;
  const deficiencies = crop ? getDeficiencies(numSoil, crop) : [];
  const overuse = crop ? getOveruse(numSoil, crop) : [];
  const recs = crop ? recommendFertilisers(deficiencies, crop, phClass) : {};
  const phOk = req && numSoil.pH >= req.pH_min && numSoil.pH <= req.pH_max;

  const statusColor = { adequate:"#4caf72", deficient:"#e05c3a", excess:"#e6a817" };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#0e120c] text-stone-900 dark:text-[#f0ede4] transition-colors duration-300 font-mono py-10 px-5 flex flex-col items-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-100" style={{ backgroundImage: `radial-gradient(ellipse 80% 60% at 50% -10%, rgba(76,175,114,0.08) 0%, transparent 70%)` }} />
      
      <div className="relative z-10 w-full flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-10 animate-[fadeIn_0.6s_ease]">
          <div className="text-4xl mb-2">🌱</div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-1.5 tracking-tight text-stone-900 dark:text-[#f0ede4]">
            Fertiliser Recommender
          </h1>
          <p className="text-xs tracking-[0.2em] uppercase text-emerald-700 dark:text-[#5a7a50]">
            Soil Analysis · Nutrient Management · Crop Advisory
          </p>
        </div>

        {step === 0 && (
          <div className="w-full max-w-2xl bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 rounded-3xl p-8 shadow-sm animate-[slideIn_0.5s_ease]">
            {/* Soil Inputs */}
            <h2 className="font-serif text-lg text-emerald-800 dark:text-[#c8d4b8] mb-5 tracking-wide">
              Soil Nutrient Levels
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {[
                { key:"N", label:"Nitrogen (N)", unit:"mg/kg", range:"0 – 2000", hint:"e.g. 150" },
                { key:"P", label:"Phosphorus (P)", unit:"mg/kg", range:"0 – 200",  hint:"e.g. 8"   },
                { key:"K", label:"Potassium (K)", unit:"mg/kg", range:"0 – 1000", hint:"e.g. 80"  },
                { key:"pH", label:"Soil pH",       unit:"",      range:"3.5 – 9.5", hint:"e.g. 6.5" },
              ].map(({ key, label, unit, range, hint }) => (
                <div key={key}>
                  <label className="block text-xs uppercase tracking-wider text-emerald-700 dark:text-[#5a7a50] mb-1.5 font-semibold">
                    {label} {unit && <span className="opacity-60">({unit})</span>}
                  </label>
                  <input
                    className={`w-full px-4 py-2.5 bg-stone-50 dark:bg-white/5 border rounded-xl text-sm outline-none transition-colors duration-200
                      ${errors[key] ? "border-red-400 dark:border-red-500/50" : "border-stone-200 dark:border-white/10 focus:border-emerald-500 dark:focus:border-emerald-500/60"}`}
                    type="number"
                    placeholder={hint}
                    value={soil[key] !== undefined ? soil[key] : ""}
                    onChange={e => { setSoil(s => ({ ...s, [key]: e.target.value })); setErrors(er => ({ ...er, [key]: null })); }}
                  />
                  {errors[key]
                    ? <span className="text-[10px] text-red-500 dark:text-[#e05c3a] mt-1 block font-medium">{errors[key]}</span>
                    : <span className="text-[10px] text-stone-500 dark:text-white/20 mt-1 block">Range: {range}</span>
                  }
                </div>
              ))}
            </div>

            {/* Crop Selection */}
            <h2 className="font-serif text-lg text-emerald-800 dark:text-[#c8d4b8] mb-3 mt-8 tracking-wide">
              Select Your Crop
            </h2>
            {errors.crop && <p className="text-xs text-red-500 dark:text-[#e05c3a] mb-2 font-medium">{errors.crop}</p>}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-8">
              {crops.map(([key, val]) => (
                <div
                  key={key}
                  className={`p-3 rounded-xl border cursor-pointer transition-all duration-200
                    ${crop === key 
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 shadow-sm" 
                      : "border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-emerald-300 dark:hover:border-emerald-500/40 hover:bg-stone-50 dark:hover:bg-emerald-500/5"}`}
                  onClick={() => { setCrop(key); setErrors(e => ({ ...e, crop: null })); }}
                >
                  <div className="text-2xl mb-1">{val.icon}</div>
                  <div className="text-sm font-serif capitalize text-stone-800 dark:text-[#c8d4b8]">{key}</div>
                  <div className="text-[10px] text-emerald-700 dark:text-[#4a6a40] mt-1">
                    N:{val.N[0].toUpperCase()} P:{val.P[0].toUpperCase()} K:{val.K[0].toUpperCase()}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button 
                className="px-8 py-3.5 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-semibold tracking-wide hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/30 transition-all active:translate-y-0"
                onClick={handleAnalyse}
              >
                ANALYSE SOIL →
              </button>
            </div>
          </div>
        )}

        {step === 1 && req && (
          <div className="w-full max-w-3xl animate-[fadeIn_0.5s_ease]">

            {/* Crop Banner */}
            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-5 mb-4 flex items-center gap-4 shadow-sm">
              <span className="text-4xl">{req.icon}</span>
              <div>
                <div className="font-serif text-xl capitalize font-bold text-emerald-900 dark:text-[#f0ede4]">{crop}</div>
                <div className="text-xs text-emerald-700 dark:text-[#5a7a50] mt-1">{req.description}</div>
                <div className="text-[11px] text-emerald-600/70 dark:text-white/30 mt-0.5 font-medium">Optimal pH: {req.pH_min} – {req.pH_max}</div>
              </div>
            </div>

            {/* Nutrient Bars */}
            <div className="bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 rounded-2xl p-5 md:p-6 mb-4 shadow-sm">
              <h3 className="font-serif text-stone-600 dark:text-[#8a9a80] text-sm tracking-widest uppercase mb-4">Soil Nutrients</h3>
              {["N","P","K"].map(n => <div key={n} className="mb-3"><NutrientBar nutrient={n} value={numSoil[n]} /></div>)}
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-stone-100 dark:border-white/10">
                <span className="text-xs text-stone-600 dark:text-[#5a7a50] font-medium">Soil pH: <strong className="text-stone-900 dark:text-[#c8d4b8]">{numSoil.pH}</strong></span>
                <PHBadge ph={numSoil.pH} />
              </div>
            </div>

            {/* Nutrient Status vs Crop */}
            <div className="bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 rounded-2xl p-5 md:p-6 mb-4 shadow-sm">
              <h3 className="font-serif text-stone-600 dark:text-[#8a9a80] text-sm tracking-widest uppercase mb-4">Nutrient Status</h3>

              {/* pH Row */}
              <div className="flex justify-between items-center py-2.5 border-b border-stone-100 dark:border-white/5">
                <span className="text-xs text-stone-800 dark:text-[#c8d4b8] font-medium">pH Suitability</span>
                <span className={`text-xs font-bold ${phOk ? "text-emerald-600 dark:text-[#4caf72]" : "text-red-500 dark:text-[#e05c3a]"}`}>
                  {phOk ? "✓ Within optimal range" : `✗ Outside range (${req.pH_min}–${req.pH_max})`}
                </span>
              </div>

              {["N","P","K"].map((n, i) => {
                const sl = classifyNutrient(n, numSoil[n]);
                const isDef = deficiencies.includes(n);
                const isExc = RANK[sl] > RANK[req[n]];
                const status = isDef ? "deficient" : isExc ? "excess" : "adequate";
                const icons  = { deficient:"↓ Deficient", excess:"↑ Excess", adequate:"✓ Adequate" };
                const lightColors = { adequate:"text-emerald-600", deficient:"text-red-500", excess:"text-amber-500" };
                
                return (
                  <div key={n} className={`flex justify-between items-center py-2.5 ${i < 2 ? "border-b border-stone-100 dark:border-white/5" : ""}`}>
                    <div>
                      <span className="text-xs text-stone-800 dark:text-[#c8d4b8] font-medium">{n} — Soil: </span>
                      <span className={`text-xs font-bold uppercase ${lightColors[classifyNutrient(n, numSoil[n]) === "low" ? "deficient" : classifyNutrient(n, numSoil[n]) === "high" ? "excess" : "adequate"]} dark:text-[${statusColor[classifyNutrient(n, numSoil[n]) === "low" ? "deficient" : classifyNutrient(n, numSoil[n]) === "high" ? "excess" : "adequate"]}]`}>
                        {sl}
                      </span>
                      <span className="text-xs text-stone-500 dark:text-[#4a6a40]"> / Crop needs: {req[n].toUpperCase()}</span>
                    </div>
                    <span className={`text-xs font-bold ${lightColors[status]} dark:text-[${statusColor[status]}]`}>{icons[status]}</span>
                  </div>
                );
              })}
            </div>

            {/* Overuse Warnings */}
            {overuse.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-5 mb-4 shadow-sm">
                <h3 className="text-xs text-amber-700 dark:text-[#e6a817] tracking-widest uppercase mb-2 font-bold">⚠ Overuse Risk</h3>
                {overuse.map(({ nutrient, severity }) => (
                  <p key={nutrient} className="text-xs text-amber-900/80 dark:text-[#c8a844] leading-relaxed mb-1 last:mb-0">
                    {severity === "danger"
                      ? `Nutrient ${nutrient} is VERY HIGH but ${crop} needs very little — adding more risks toxicity and runoff.`
                      : `Nutrient ${nutrient} is already HIGH. No additional ${nutrient} fertiliser is required.`}
                  </p>
                ))}
              </div>
            )}

            {/* Recommendations */}
            <div className="bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 rounded-2xl p-5 md:p-6 mb-4 shadow-sm">
              <h3 className="font-serif text-stone-600 dark:text-[#8a9a80] text-sm tracking-widest uppercase mb-4">
                {Object.keys(recs).length === 0 ? "Recommendation" : "Recommended Fertilisers"}
              </h3>

              {Object.keys(recs).length === 0 && deficiencies.length === 0 ? (
                <div className="text-center py-6">
                  <div className="text-3xl mb-2">✅</div>
                  <p className="text-emerald-600 dark:text-[#4caf72] text-sm font-serif font-bold">No fertiliser required</p>
                  <p className="text-stone-600 dark:text-[#4a6a40] text-xs mt-2 max-w-md mx-auto leading-relaxed">Soil nutrient levels and pH are well-suited for {crop}. Consider a maintenance dose mid-season if yield declines.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(recs).map(([name, reason], i) => (
                    <FertCard key={name} name={name} reason={reason} index={i} />
                  ))}
                </div>
              )}
            </div>

            {/* Best Practices */}
            <div className="bg-stone-100/50 dark:bg-white/5 border border-stone-200 dark:border-white/10 rounded-2xl p-5 mb-6">
              <h3 className="text-[11px] text-stone-600 dark:text-[#4a6a40] tracking-widest uppercase mb-3 font-bold">General Best Practices</h3>
              <div className="space-y-1.5">
                {[
                  "Split nitrogen applications into 2–3 doses to reduce leaching.",
                  "Incorporate P & K fertilisers into the soil before sowing.",
                  "Re-test soil every season for accurate dosing.",
                  "Avoid applying fertilisers before heavy rain to prevent runoff.",
                  "Maintain organic matter (compost/FYM) for long-term soil health.",
                  "Never exceed maximum application rates — it wastes money and harms soil.",
                ].map((tip, i) => (
                  <p key={i} className="text-[11px] text-stone-600 dark:text-[#4a6a40] pl-3 relative leading-relaxed">
                    <span className="absolute left-0 text-stone-400 dark:text-[#2d5a30] font-bold">·</span>{tip}
                  </p>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-[10px] text-stone-500 dark:text-white/30 max-w-[280px] leading-relaxed">
                ⚠ Always consult a local agronomist for field-specific advice.
              </p>
              <button 
                className="px-5 py-2.5 border border-stone-300 dark:border-white/10 rounded-xl bg-white dark:bg-transparent text-stone-600 dark:text-[#8a9a80] text-xs font-semibold hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-[#4caf72] transition-colors" 
                onClick={() => setStep(0)}
              >
                ← New Analysis
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
