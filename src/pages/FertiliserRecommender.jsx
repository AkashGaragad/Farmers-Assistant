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
  const colors = { low:"#e05c3a", medium:"#e6a817", high:"#4caf72" };
  const labels = { low:"LOW", medium:"MEDIUM", high:"HIGH" };
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
        <span style={{ fontFamily:"'DM Mono', monospace", fontSize:13, color:"#c8d4b8", letterSpacing:1 }}>{nutrient}</span>
        <span style={{ fontFamily:"'DM Mono', monospace", fontSize:12, color: colors[level], fontWeight:700 }}>
          {value} mg/kg — {labels[level]}
        </span>
      </div>
      <div style={{ height:6, borderRadius:3, background:"rgba(255,255,255,0.07)", overflow:"hidden" }}>
        <div style={{
          height:"100%", width:`${pct}%`, borderRadius:3,
          background: colors[level],
          transition:"width 0.8s cubic-bezier(.4,0,.2,1)",
          boxShadow:`0 0 8px ${colors[level]}88`
        }}/>
      </div>
    </div>
  );
}

function PHBadge({ ph }) {
  const cl = classifyPH(ph);
  const map = {
    strongly_acidic:   { label:"Strongly Acidic",   color:"#e05c3a" },
    moderately_acidic: { label:"Moderately Acidic",  color:"#e07c3a" },
    optimal:           { label:"Optimal",            color:"#4caf72" },
    slightly_alkaline: { label:"Slightly Alkaline",  color:"#e6a817" },
    strongly_alkaline: { label:"Strongly Alkaline",  color:"#e05c3a" },
  };
  const { label, color } = map[cl];
  return (
    <span style={{
      display:"inline-block", padding:"2px 10px", borderRadius:20,
      background:`${color}22`, border:`1px solid ${color}66`,
      color, fontSize:12, fontFamily:"'DM Mono', monospace", fontWeight:700
    }}>{label}</span>
  );
}

function FertCard({ name, reason, index }) {
  const fert = FERTILISERS[name];
  const tagColors = { N:"#4caf72", P:"#5bb8e0", K:"#e6a817" };
  return (
    <div style={{
      background:"rgba(255,255,255,0.035)", border:"1px solid rgba(255,255,255,0.08)",
      borderRadius:12, padding:"16px 18px", marginBottom:12,
      animation:`slideIn 0.4s ease ${index * 0.08}s both`
    }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:8 }}>
        <span style={{
          minWidth:24, height:24, borderRadius:"50%", background:"rgba(76,175,114,0.15)",
          border:"1px solid rgba(76,175,114,0.3)", display:"flex", alignItems:"center",
          justifyContent:"center", fontSize:11, fontWeight:700, color:"#4caf72",
          fontFamily:"'DM Mono', monospace", flexShrink:0, marginTop:1
        }}>{index + 1}</span>
        <div>
          <div style={{ fontFamily:"'Playfair Display', serif", fontSize:15, color:"#f0ede4", marginBottom:3 }}>{name}</div>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
            {fert.nutrients.map(n => (
              <span key={n} style={{
                padding:"1px 8px", borderRadius:10, fontSize:11, fontWeight:700,
                background:`${tagColors[n]}22`, border:`1px solid ${tagColors[n]}55`, color: tagColors[n],
                fontFamily:"'DM Mono', monospace"
              }}>{n}</span>
            ))}
            <span style={{
              padding:"1px 8px", borderRadius:10, fontSize:11,
              background:"rgba(255,255,255,0.05)", color:"#8a9a80",
              fontFamily:"'DM Mono', monospace"
            }}>max {fert.max} kg/ha</span>
          </div>
        </div>
      </div>
      <p style={{ margin:"6px 0 0", fontSize:12, color:"#7a9a6a", lineHeight:1.5, paddingLeft:34 }}>{reason}</p>
      <p style={{ margin:"4px 0 0", fontSize:11, color:"rgba(255,255,255,0.3)", lineHeight:1.5, paddingLeft:34 }}>⚠ {fert.note}</p>
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Mono:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin:0; padding:0; }
        body { background: #0e120c; }
        .fr-input {
          width:100%; padding:10px 14px;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.1);
          border-radius:8px; color:#f0ede4;
          font-family:'DM Mono', monospace; font-size:13px;
          outline:none; transition:border-color 0.2s;
        }
        .fr-input:focus { border-color:rgba(76,175,114,0.6); }
        .fr-input.error { border-color:#e05c3a88; }
        .fr-btn {
          padding:13px 32px; border:none; border-radius:10px;
          background: linear-gradient(135deg, #4caf72, #2d7a4f);
          color:#fff; font-family:'DM Mono', monospace; font-size:13px;
          font-weight:500; cursor:pointer; letter-spacing:1px;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 4px 20px rgba(76,175,114,0.3);
        }
        .fr-btn:hover { transform:translateY(-1px); box-shadow:0 6px 28px rgba(76,175,114,0.45); }
        .fr-btn:active { transform:translateY(0); }
        .fr-btn-ghost {
          padding:10px 20px; border:1px solid rgba(255,255,255,0.12); border-radius:8px;
          background:transparent; color:#8a9a80; font-family:'DM Mono', monospace;
          font-size:12px; cursor:pointer; transition:all 0.2s; letter-spacing:0.5px;
        }
        .fr-btn-ghost:hover { border-color:rgba(76,175,114,0.4); color:#4caf72; }
        .crop-card {
          padding:10px 14px; border-radius:10px; cursor:pointer;
          border:1px solid rgba(255,255,255,0.07);
          background:rgba(255,255,255,0.025);
          transition:all 0.2s;
        }
        .crop-card:hover { border-color:rgba(76,175,114,0.35); background:rgba(76,175,114,0.06); }
        .crop-card.selected { border-color:#4caf72; background:rgba(76,175,114,0.12); }
        @keyframes slideIn {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity:0; } to { opacity:1; }
        }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(76,175,114,0.3); border-radius:2px; }
      `}</style>

      <div style={{
        minHeight:"100vh", background:"#0e120c",
        backgroundImage:`radial-gradient(ellipse 80% 60% at 50% -10%, rgba(76,175,114,0.08) 0%, transparent 70%)`,
        fontFamily:"'DM Mono', monospace", padding:"40px 20px",
        display:"flex", flexDirection:"column", alignItems:"center"
      }}>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:40, animation:"fadeIn 0.6s ease" }}>
          <div style={{ fontSize:36, marginBottom:8 }}>🌱</div>
          <h1 style={{
            fontFamily:"'Playfair Display', serif", fontSize:"clamp(22px,4vw,32px)",
            color:"#f0ede4", fontWeight:700, marginBottom:6, letterSpacing:"-0.5px"
          }}>
            Fertiliser Recommender
          </h1>
          <p style={{ fontSize:12, color:"#5a7a50", letterSpacing:2, textTransform:"uppercase" }}>
            Soil Analysis · Nutrient Management · Crop Advisory
          </p>
        </div>

        {step === 0 && (
          <div style={{
            width:"100%", maxWidth:640,
            background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)",
            borderRadius:20, padding:"32px 28px",
            animation:"slideIn 0.5s ease"
          }}>
            {/* Soil Inputs */}
            <h2 style={{ fontFamily:"'Playfair Display', serif", color:"#c8d4b8", fontSize:16, marginBottom:20, fontWeight:400, letterSpacing:"0.5px" }}>
              Soil Nutrient Levels
            </h2>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
              {[
                { key:"N", label:"Nitrogen (N)", unit:"mg/kg", range:"0 – 2000", hint:"e.g. 150" },
                { key:"P", label:"Phosphorus (P)", unit:"mg/kg", range:"0 – 200",  hint:"e.g. 8"   },
                { key:"K", label:"Potassium (K)", unit:"mg/kg", range:"0 – 1000", hint:"e.g. 80"  },
                { key:"pH", label:"Soil pH",       unit:"",      range:"3.5 – 9.5", hint:"e.g. 6.5" },
              ].map(({ key, label, unit, range, hint }) => (
                <div key={key}>
                  <label style={{ display:"block", fontSize:11, color:"#5a7a50", letterSpacing:1, marginBottom:5, textTransform:"uppercase" }}>
                    {label} {unit && <span style={{ opacity:.5 }}>({unit})</span>}
                  </label>
                  <input
                    className={`fr-input${errors[key] ? " error" : ""}`}
                    type="number"
                    placeholder={hint}
                    value={soil[key] !== undefined ? soil[key] : ""}
                    onChange={e => { setSoil(s => ({ ...s, [key]: e.target.value })); setErrors(er => ({ ...er, [key]: null })); }}
                  />
                  {errors[key]
                    ? <span style={{ fontSize:10, color:"#e05c3a", marginTop:3, display:"block" }}>{errors[key]}</span>
                    : <span style={{ fontSize:10, color:"rgba(255,255,255,0.18)", marginTop:3, display:"block" }}>Range: {range}</span>
                  }
                </div>
              ))}
            </div>

            {/* Crop Selection */}
            <h2 style={{ fontFamily:"'Playfair Display', serif", color:"#c8d4b8", fontSize:16, marginBottom:14, fontWeight:400, marginTop:24, letterSpacing:"0.5px" }}>
              Select Your Crop
            </h2>
            {errors.crop && <p style={{ fontSize:11, color:"#e05c3a", marginBottom:8 }}>{errors.crop}</p>}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(130px, 1fr))", gap:8, marginBottom:28 }}>
              {crops.map(([key, val]) => (
                <div
                  key={key}
                  className={`crop-card${crop === key ? " selected" : ""}`}
                  onClick={() => { setCrop(key); setErrors(e => ({ ...e, crop: null })); }}
                >
                  <div style={{ fontSize:20, marginBottom:3 }}>{val.icon}</div>
                  <div style={{ fontSize:12, color:"#c8d4b8", textTransform:"capitalize", fontFamily:"'Playfair Display', serif" }}>{key}</div>
                  <div style={{ fontSize:10, color:"#4a6a40", marginTop:2, lineHeight:1.3 }}>
                    N:{val.N[0].toUpperCase()} P:{val.P[0].toUpperCase()} K:{val.K[0].toUpperCase()}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display:"flex", justifyContent:"flex-end" }}>
              <button className="fr-btn" onClick={handleAnalyse}>ANALYSE SOIL →</button>
            </div>
          </div>
        )}

        {step === 1 && req && (
          <div style={{ width:"100%", maxWidth:680, animation:"fadeIn 0.5s ease" }}>

            {/* Crop Banner */}
            <div style={{
              background:"rgba(76,175,114,0.07)", border:"1px solid rgba(76,175,114,0.18)",
              borderRadius:16, padding:"18px 22px", marginBottom:16,
              display:"flex", alignItems:"center", gap:14
            }}>
              <span style={{ fontSize:36 }}>{req.icon}</span>
              <div>
                <div style={{ fontFamily:"'Playfair Display', serif", fontSize:20, color:"#f0ede4", textTransform:"capitalize" }}>{crop}</div>
                <div style={{ fontSize:12, color:"#5a7a50", marginTop:3 }}>{req.description}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.25)", marginTop:2 }}>Optimal pH: {req.pH_min} – {req.pH_max}</div>
              </div>
            </div>

            {/* Nutrient Bars */}
            <div style={{
              background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)",
              borderRadius:16, padding:"20px 22px", marginBottom:14
            }}>
              <h3 style={{ fontFamily:"'Playfair Display', serif", color:"#8a9a80", fontSize:13, letterSpacing:2, textTransform:"uppercase", marginBottom:16, fontWeight:400 }}>Soil Nutrients</h3>
              {["N","P","K"].map(n => <NutrientBar key={n} nutrient={n} value={numSoil[n]} />)}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:14, paddingTop:14, borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ fontSize:12, color:"#5a7a50" }}>Soil pH: <strong style={{ color:"#c8d4b8" }}>{numSoil.pH}</strong></span>
                <PHBadge ph={numSoil.pH} />
              </div>
            </div>

            {/* Nutrient Status vs Crop */}
            <div style={{
              background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)",
              borderRadius:16, padding:"20px 22px", marginBottom:14
            }}>
              <h3 style={{ fontFamily:"'Playfair Display', serif", color:"#8a9a80", fontSize:13, letterSpacing:2, textTransform:"uppercase", marginBottom:14, fontWeight:400 }}>Nutrient Status</h3>

              {/* pH Row */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize:12, color:"#c8d4b8" }}>pH Suitability</span>
                <span style={{ fontSize:12, color: phOk ? "#4caf72" : "#e05c3a", fontWeight:600 }}>
                  {phOk ? "✓ Within optimal range" : `✗ Outside range (${req.pH_min}–${req.pH_max})`}
                </span>
              </div>

              {["N","P","K"].map((n, i) => {
                const sl = classifyNutrient(n, numSoil[n]);
                const isDef = deficiencies.includes(n);
                const isExc = RANK[sl] > RANK[req[n]];
                const status = isDef ? "deficient" : isExc ? "excess" : "adequate";
                const icons  = { deficient:"↓ Deficient", excess:"↑ Excess", adequate:"✓ Adequate" };
                return (
                  <div key={n} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <div>
                      <span style={{ fontSize:12, color:"#c8d4b8" }}>{n} — Soil: </span>
                      <span style={{ fontSize:12, color: statusColor[classifyNutrient(n, numSoil[n]) === "low" ? "deficient" : classifyNutrient(n, numSoil[n]) === "high" ? "excess" : "adequate"] }}>{sl.toUpperCase()}</span>
                      <span style={{ fontSize:12, color:"#4a6a40" }}> / Crop needs: {req[n].toUpperCase()}</span>
                    </div>
                    <span style={{ fontSize:12, color: statusColor[status], fontWeight:600 }}>{icons[status]}</span>
                  </div>
                );
              })}
            </div>

            {/* Overuse Warnings */}
            {overuse.length > 0 && (
              <div style={{
                background:"rgba(230,168,23,0.06)", border:"1px solid rgba(230,168,23,0.2)",
                borderRadius:14, padding:"16px 20px", marginBottom:14
              }}>
                <h3 style={{ fontSize:12, color:"#e6a817", letterSpacing:2, textTransform:"uppercase", marginBottom:10, fontWeight:600 }}>⚠ Overuse Risk</h3>
                {overuse.map(({ nutrient, severity }) => (
                  <p key={nutrient} style={{ fontSize:12, color:"#c8a844", lineHeight:1.6 }}>
                    {severity === "danger"
                      ? `Nutrient ${nutrient} is VERY HIGH but ${crop} needs very little — adding more risks toxicity and runoff.`
                      : `Nutrient ${nutrient} is already HIGH. No additional ${nutrient} fertiliser is required.`}
                  </p>
                ))}
              </div>
            )}

            {/* Recommendations */}
            <div style={{
              background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)",
              borderRadius:16, padding:"20px 22px", marginBottom:14
            }}>
              <h3 style={{ fontFamily:"'Playfair Display', serif", color:"#8a9a80", fontSize:13, letterSpacing:2, textTransform:"uppercase", marginBottom:14, fontWeight:400 }}>
                {Object.keys(recs).length === 0 ? "Recommendation" : "Recommended Fertilisers"}
              </h3>

              {Object.keys(recs).length === 0 && deficiencies.length === 0 ? (
                <div style={{ textAlign:"center", padding:"20px 0" }}>
                  <div style={{ fontSize:32, marginBottom:8 }}>✅</div>
                  <p style={{ color:"#4caf72", fontSize:14, fontFamily:"'Playfair Display', serif" }}>No fertiliser required</p>
                  <p style={{ color:"#4a6a40", fontSize:12, marginTop:6 }}>Soil nutrient levels and pH are well-suited for {crop}. Consider a maintenance dose mid-season if yield declines.</p>
                </div>
              ) : (
                Object.entries(recs).map(([name, reason], i) => (
                  <FertCard key={name} name={name} reason={reason} index={i} />
                ))
              )}
            </div>

            {/* Best Practices */}
            <div style={{
              background:"rgba(255,255,255,0.015)", border:"1px solid rgba(255,255,255,0.05)",
              borderRadius:14, padding:"16px 20px", marginBottom:24
            }}>
              <h3 style={{ fontSize:11, color:"#4a6a40", letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>General Best Practices</h3>
              {[
                "Split nitrogen applications into 2–3 doses to reduce leaching.",
                "Incorporate P & K fertilisers into the soil before sowing.",
                "Re-test soil every season for accurate dosing.",
                "Avoid applying fertilisers before heavy rain to prevent runoff.",
                "Maintain organic matter (compost/FYM) for long-term soil health.",
                "Never exceed maximum application rates — it wastes money and harms soil.",
              ].map((tip, i) => (
                <p key={i} style={{ fontSize:11, color:"#4a6a40", marginBottom:5, paddingLeft:12, position:"relative", lineHeight:1.5 }}>
                  <span style={{ position:"absolute", left:0, color:"#2d5a30" }}>·</span>{tip}
                </p>
              ))}
            </div>

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <p style={{ fontSize:10, color:"rgba(255,255,255,0.2)", maxWidth:300 }}>
                ⚠ Always consult a local agronomist for field-specific advice.
              </p>
              <button className="fr-btn-ghost" onClick={() => setStep(0)}>← New Analysis</button>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
