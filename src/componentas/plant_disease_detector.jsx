import { useState, useRef, useCallback } from "react";

const API_KEY = "YOUR_API_KEY_HERE"; // 🔑 Replace with your Anthropic API key

const SYSTEM_PROMPT = `You are an expert agronomist and plant pathologist AI. When given an image of a plant, you must:

1. Identify any diseases, pests, or nutrient deficiencies visible
2. Provide a detailed diagnosis
3. Give precise fertilizer/treatment recommendations

Always respond ONLY in valid JSON (no markdown, no backticks) with this exact structure:
{
  "plantName": "Name of the plant (if identifiable)",
  "healthStatus": "Healthy | Mildly Diseased | Severely Diseased | Critical",
  "healthScore": <integer 0-100>,
  "diseases": [
    {
      "name": "Disease/Issue Name",
      "confidence": <integer 0-100>,
      "severity": "Low | Medium | High | Critical",
      "description": "Detailed description of the disease, symptoms, and causes",
      "affectedArea": "Which part of the plant is affected"
    }
  ],
  "treatments": [
    {
      "type": "Fertilizer | Pesticide | Fungicide | Cultural Practice | Organic Treatment",
      "name": "Product/Treatment name",
      "activeIngredient": "Active ingredient if applicable",
      "dosage": "Exact dosage (e.g., 2g per liter of water)",
      "frequency": "How often to apply (e.g., Every 7 days for 3 weeks)",
      "timing": "Best time of day/season to apply",
      "method": "How to apply (foliar spray, soil drench, etc.)",
      "precautions": "Safety notes and precautions",
      "expectedResult": "What improvement to expect and when"
    }
  ],
  "preventionTips": ["tip1", "tip2", "tip3"],
  "urgencyLevel": "Immediate | Within a week | Routine",
  "additionalNotes": "Any other important observations"
}`;

export default function PlantDiseaseDetector() {
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setImage(url);
    setResult(null);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result.split(",")[1];
      setImageBase64({ data: base64, mediaType: file.type });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e) => processFile(e.target.files[0]);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFile(e.dataTransfer.files[0]);
  };

  const analyzeImage = async () => {
    if (!imageBase64) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: imageBase64.mediaType,
                    data: imageBase64.data,
                  },
                },
                {
                  type: "text",
                  text: "Analyze this plant image for diseases, pests, and nutrient deficiencies. Provide full treatment and fertilizer recommendations.",
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || "API request failed");
      }

      const data = await response.json();
      const text = data.content.map((b) => b.text || "").join("");
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
    } catch (err) {
      setError(err.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const healthColor = (score) => {
    if (score >= 80) return "#22c55e";
    if (score >= 50) return "#f59e0b";
    if (score >= 25) return "#f97316";
    return "#ef4444";
  };

  const severityBadge = (sev) => {
    const map = {
      Low: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/60 dark:text-green-300 dark:border-green-700",
      Medium: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/60 dark:text-yellow-300 dark:border-yellow-700",
      High: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/60 dark:text-orange-300 dark:border-orange-700",
      Critical: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/60 dark:text-red-300 dark:border-red-700",
    };
    return map[sev] || "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600";
  };

  const urgencyBadge = (u) => {
    const map = {
      Immediate: "bg-red-500 text-white",
      "Within a week": "bg-amber-500 text-black",
      Routine: "bg-emerald-600 text-white",
    };
    return map[u] || "bg-gray-600 text-white";
  };

  return (
    <div
      style={{ fontFamily: "'Crimson Pro', Georgia, serif" }}
      className="min-h-screen bg-stone-50 text-gray-900 dark:bg-[#0e120c] dark:text-gray-100 transition-colors duration-300"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,400&family=Space+Mono:wght@400;700&display=swap');
        .mono { font-family: 'Space Mono', monospace; }
        
        /* Light Mode Specific Styles */
        :root {
          --leaf-bg-1: rgba(34,197,94,0.1);
          --leaf-bg-2: rgba(16,185,129,0.08);
          --card-bg: rgba(255,255,255,0.7);
          --card-border: rgba(0,0,0,0.05);
          --upload-border: rgba(34,197,94,0.4);
          --upload-hover-bg: rgba(34,197,94,0.1);
          --treatment-bg: rgba(22,163,74,0.08);
          --treatment-border: rgba(22,163,74,0.2);
          --treatment-hover: rgba(22,163,74,0.4);
        }

        /* Dark Mode Override Styles */
        html.dark {
          --leaf-bg-1: rgba(34,197,94,0.07);
          --leaf-bg-2: rgba(16,185,129,0.05);
          --card-bg: rgba(255,255,255,0.03);
          --card-border: rgba(255,255,255,0.08);
          --upload-border: rgba(34,197,94,0.3);
          --upload-hover-bg: rgba(34,197,94,0.05);
          --treatment-bg: rgba(22,163,74,0.05);
          --treatment-border: rgba(22,163,74,0.2);
          --treatment-hover: rgba(22,163,74,0.5);
        }

        .leaf-bg {
          background: radial-gradient(ellipse at 20% 50%, var(--leaf-bg-1) 0%, transparent 60%),
                      radial-gradient(ellipse at 80% 20%, var(--leaf-bg-2) 0%, transparent 50%);
        }
        .upload-zone { transition: all 0.3s ease; border: 2px dashed var(--upload-border); }
        .upload-zone:hover, .upload-zone.drag { border-color: rgba(34,197,94,0.8); background: var(--upload-hover-bg); }
        .card { background: var(--card-bg); border: 1px solid var(--card-border); }
        .glow-btn {
          background: linear-gradient(135deg, #16a34a, #15803d);
          box-shadow: 0 0 20px rgba(22,163,74,0.4);
          transition: all 0.3s;
        }
        .glow-btn:hover { box-shadow: 0 0 35px rgba(22,163,74,0.7); transform: translateY(-1px); }
        .glow-btn:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; transform: none; }
        .score-ring { transition: stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1); }
        .treatment-card { background: var(--treatment-bg); border: 1px solid var(--treatment-border); transition: border-color 0.2s; }
        .treatment-card:hover { border-color: var(--treatment-hover); }
        .spin { animation: spin 1.2s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .fade-in { animation: fadeIn 0.6s ease forwards; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .tag { font-family: 'Space Mono', monospace; font-size: 0.65rem; }
      `}</style>

      <div className="leaf-bg min-h-screen">
        {/* Header */}
        <header className="border-b border-black/5 dark:border-white/5 px-6 py-5 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 flex items-center justify-center text-xl shadow-sm dark:shadow-none">🌿</div>
            <div>
              <h1 className="mono text-sm font-bold tracking-widest text-green-700 dark:text-green-400 uppercase">PhytoScan AI</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium" style={{ fontFamily: "inherit" }}>Plant Disease Intelligence</p>
            </div>
          </div>
          <span className="mono text-xs text-slate-500 dark:text-gray-500 border border-slate-200 dark:border-gray-800 bg-white/50 dark:bg-transparent px-3 py-1 rounded-full shadow-sm dark:shadow-none">
            Powered by Claude
          </span>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-10">
          {/* Hero */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-light mb-3 tracking-tight text-slate-800 dark:text-white" style={{ lineHeight: 1.15 }}>
              Diagnose your plant,<br />
              <span className="text-green-600 dark:text-green-400 italic">heal your harvest.</span>
            </h2>
            <p className="text-slate-600 dark:text-gray-400 text-lg max-w-xl mx-auto font-medium" style={{ fontFamily: "inherit" }}>
              Upload a leaf or plant photo. Get instant AI diagnosis with fertilizer plans, dosage, and timing.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload Panel */}
            <div className="space-y-4">
              <div
                className={`upload-zone rounded-2xl p-8 text-center cursor-pointer bg-white/40 dark:bg-transparent backdrop-blur-sm shadow-sm dark:shadow-none ${dragOver ? "drag" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {image ? (
                  <img src={image} alt="Plant" className="max-h-72 mx-auto rounded-xl object-contain shadow-md dark:shadow-none" />
                ) : (
                  <div className="py-10">
                    <div className="text-5xl mb-4">📸</div>
                    <p className="text-green-700 dark:text-green-400 font-bold mono text-sm mb-1 tracking-wide">DROP IMAGE HERE</p>
                    <p className="text-slate-500 dark:text-gray-400 text-sm font-medium">or click to browse</p>
                    <p className="text-slate-400 dark:text-gray-500 text-xs mt-3">JPG, PNG, WEBP supported</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>

              {image && (
                <button
                  onClick={analyzeImage}
                  disabled={loading}
                  className="glow-btn w-full py-4 rounded-xl mono text-sm font-bold tracking-widest uppercase text-white shadow-lg shadow-green-600/20"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                      </svg>
                      Analysing Plant...
                    </span>
                  ) : "🔬 Run Disease Scan"}
                </button>
              )}

              {error && (
                <div className="rounded-xl p-4 bg-red-100 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300 text-sm mono shadow-sm dark:shadow-none">
                  ⚠ {error}
                </div>
              )}
            </div>

            {/* Results Panel */}
            <div className="space-y-4">
              {!result && !loading && (
                <div className="card rounded-2xl p-10 text-center h-full flex flex-col items-center justify-center opacity-70 dark:opacity-50 shadow-sm dark:shadow-none transition-all">
                  <div className="text-6xl mb-4">🌱</div>
                  <p className="text-slate-500 dark:text-gray-400 italic font-medium">Your diagnosis will appear here</p>
                </div>
              )}

              {loading && (
                <div className="card rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-4 shadow-sm dark:shadow-none transition-all h-full">
                  <div className="text-5xl">🔬</div>
                  <div>
                    <p className="text-green-700 dark:text-green-400 mono text-sm animate-pulse font-bold">Scanning for pathogens...</p>
                    <p className="text-slate-500 dark:text-gray-500 text-xs mt-1 font-medium">AI analysis in progress</p>
                  </div>
                </div>
              )}

              {result && (
                <div className="space-y-4 fade-in">
                  {/* Summary card */}
                  <div className="card rounded-2xl p-5 flex items-center gap-5 shadow-sm dark:shadow-none transition-all">
                    {/* Score ring */}
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                        <circle cx="18" cy="18" r="15.9" fill="none" className="stroke-slate-200 dark:stroke-gray-800 transition-colors" strokeWidth="3" />
                        <circle
                          cx="18" cy="18" r="15.9" fill="none"
                          stroke={healthColor(result.healthScore)}
                          strokeWidth="3"
                          strokeDasharray={`${result.healthScore} 100`}
                          strokeLinecap="round"
                          className="score-ring"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="mono text-sm font-bold drop-shadow-sm dark:drop-shadow-none" style={{ color: healthColor(result.healthScore) }}>
                          {result.healthScore}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">{result.plantName || "Unknown Plant"}</h3>
                        {result.urgencyLevel && (
                          <span className={`tag px-2 py-0.5 rounded-full shadow-sm dark:shadow-none ${urgencyBadge(result.urgencyLevel)}`}>
                            {result.urgencyLevel}
                          </span>
                        )}
                      </div>
                      <p className="text-green-700 dark:text-green-400 mono text-xs font-bold">{result.healthStatus}</p>
                      {result.additionalNotes && (
                        <p className="text-slate-600 dark:text-gray-400 text-sm mt-1 italic font-medium">{result.additionalNotes}</p>
                      )}
                    </div>
                  </div>

                  {/* Diseases */}
                  {result.diseases?.length > 0 && (
                    <div className="card rounded-2xl p-5 space-y-3 shadow-sm dark:shadow-none transition-all">
                      <h4 className="mono text-xs text-green-700 dark:text-green-500 font-bold tracking-widest uppercase mb-3">Detected Issues</h4>
                      {result.diseases.map((d, i) => (
                        <div key={i} className="border border-black/5 dark:border-white/5 bg-white/50 dark:bg-transparent rounded-xl p-4 transition-colors">
                          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                            <span className="font-bold text-slate-800 dark:text-white">{d.name}</span>
                            <div className="flex gap-2">
                              <span className={`tag px-2 py-0.5 rounded-full border shadow-sm dark:shadow-none ${severityBadge(d.severity)}`}>{d.severity}</span>
                              <span className="tag px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border-slate-200 dark:bg-gray-800 dark:text-gray-400 border dark:border-gray-700 shadow-sm dark:shadow-none">{d.confidence}% conf.</span>
                            </div>
                          </div>
                          {d.affectedArea && <p className="mono text-xs text-slate-500 dark:text-gray-500 mb-1 font-semibold">📍 {d.affectedArea}</p>}
                          <p className="text-slate-700 dark:text-gray-300 text-sm leading-relaxed font-medium">{d.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Treatments */}
                  {result.treatments?.length > 0 && (
                    <div className="card rounded-2xl p-5 space-y-3 shadow-sm dark:shadow-none transition-all">
                      <h4 className="mono text-xs text-green-700 dark:text-green-500 font-bold tracking-widest uppercase mb-3">Treatment & Fertilizer Plan</h4>
                      {result.treatments.map((t, i) => (
                        <div key={i} className="treatment-card rounded-xl p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div>
                              <span className="font-bold text-green-800 dark:text-green-300 text-base">{t.name}</span>
                              {t.activeIngredient && <span className="text-slate-500 dark:text-gray-500 font-semibold mono text-xs ml-2">({t.activeIngredient})</span>}
                            </div>
                            <span className="tag px-2 py-0.5 rounded-full bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-400 border dark:border-green-800 shadow-sm dark:shadow-none font-bold">{t.type}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {t.dosage && (
                              <div className="bg-white/60 dark:bg-black/30 border border-green-100 dark:border-transparent rounded-lg p-2 transition-colors">
                                <p className="mono text-slate-500 dark:text-gray-500 mb-0.5 font-bold tracking-wide">DOSAGE</p>
                                <p className="text-slate-800 dark:text-white font-medium">{t.dosage}</p>
                              </div>
                            )}
                            {t.frequency && (
                              <div className="bg-white/60 dark:bg-black/30 border border-green-100 dark:border-transparent rounded-lg p-2 transition-colors">
                                <p className="mono text-slate-500 dark:text-gray-500 mb-0.5 font-bold tracking-wide">FREQUENCY</p>
                                <p className="text-slate-800 dark:text-white font-medium">{t.frequency}</p>
                              </div>
                            )}
                            {t.timing && (
                              <div className="bg-white/60 dark:bg-black/30 border border-green-100 dark:border-transparent rounded-lg p-2 transition-colors">
                                <p className="mono text-slate-500 dark:text-gray-500 mb-0.5 font-bold tracking-wide">TIMING</p>
                                <p className="text-slate-800 dark:text-white font-medium">{t.timing}</p>
                              </div>
                            )}
                            {t.method && (
                              <div className="bg-white/60 dark:bg-black/30 border border-green-100 dark:border-transparent rounded-lg p-2 transition-colors">
                                <p className="mono text-slate-500 dark:text-gray-500 mb-0.5 font-bold tracking-wide">METHOD</p>
                                <p className="text-slate-800 dark:text-white font-medium">{t.method}</p>
                              </div>
                            )}
                          </div>

                          {t.expectedResult && (
                            <div className="flex gap-2 items-start mt-3">
                              <span className="text-green-600 dark:text-green-500 text-sm mt-0.5 font-bold">✓</span>
                              <p className="text-slate-700 dark:text-gray-300 text-sm italic font-medium">{t.expectedResult}</p>
                            </div>
                          )}
                          {t.precautions && (
                            <div className="flex gap-2 items-start mt-2">
                              <span className="text-amber-600 dark:text-amber-500 text-sm mt-0.5 font-bold">⚠</span>
                              <p className="text-amber-800 dark:text-amber-200/70 text-xs font-semibold">{t.precautions}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Prevention */}
                  {result.preventionTips?.length > 0 && (
                    <div className="card rounded-2xl p-5 shadow-sm dark:shadow-none transition-all">
                      <h4 className="mono text-xs text-green-700 dark:text-green-500 font-bold tracking-widest uppercase mb-3">Prevention Tips</h4>
                      <ul className="space-y-2">
                        {result.preventionTips.map((tip, i) => (
                          <li key={i} className="flex gap-3 text-sm text-slate-700 dark:text-gray-300 font-medium">
                            <span className="text-green-600 dark:text-green-500 flex-shrink-0 font-bold">→</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>

        <div className="border-t border-black/5 dark:border-white/5 mt-10 py-6 text-center transition-colors">
          <p className="mono text-xs text-slate-500 dark:text-gray-600 font-medium">PhytoScan AI · For advisory purposes only · Always consult a local agronomist</p>
        </div>
      </div>
    </div>
  );
}
