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
      Low: "bg-green-900/60 text-green-300 border-green-700",
      Medium: "bg-yellow-900/60 text-yellow-300 border-yellow-700",
      High: "bg-orange-900/60 text-orange-300 border-orange-700",
      Critical: "bg-red-900/60 text-red-300 border-red-700",
    };
    return map[sev] || "bg-gray-800 text-gray-300 border-gray-600";
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
      style={{ fontFamily: "'Crimson Pro', Georgia, serif", background: "#0a0f0a" }}
      className="min-h-screen text-gray-100"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,400&family=Space+Mono:wght@400;700&display=swap');
        .mono { font-family: 'Space Mono', monospace; }
        .leaf-bg {
          background: radial-gradient(ellipse at 20% 50%, rgba(34,197,94,0.07) 0%, transparent 60%),
                      radial-gradient(ellipse at 80% 20%, rgba(16,185,129,0.05) 0%, transparent 50%),
                      #0a0f0a;
        }
        .upload-zone { transition: all 0.3s ease; border: 2px dashed rgba(34,197,94,0.3); }
        .upload-zone:hover, .upload-zone.drag { border-color: rgba(34,197,94,0.8); background: rgba(34,197,94,0.05); }
        .card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); }
        .glow-btn {
          background: linear-gradient(135deg, #16a34a, #15803d);
          box-shadow: 0 0 20px rgba(22,163,74,0.4);
          transition: all 0.3s;
        }
        .glow-btn:hover { box-shadow: 0 0 35px rgba(22,163,74,0.7); transform: translateY(-1px); }
        .glow-btn:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; transform: none; }
        .score-ring { transition: stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1); }
        .treatment-card { background: rgba(22,163,74,0.05); border: 1px solid rgba(22,163,74,0.2); transition: border-color 0.2s; }
        .treatment-card:hover { border-color: rgba(22,163,74,0.5); }
        .spin { animation: spin 1.2s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .fade-in { animation: fadeIn 0.6s ease forwards; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .tag { font-family: 'Space Mono', monospace; font-size: 0.65rem; }
      `}</style>

      <div className="leaf-bg">
        {/* Header */}
        <header className="border-b border-white/5 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-green-900 flex items-center justify-center text-xl">🌿</div>
            <div>
              <h1 className="mono text-sm font-bold tracking-widest text-green-400 uppercase">PhytoScan AI</h1>
              <p className="text-xs text-gray-500" style={{ fontFamily: "inherit" }}>Plant Disease Intelligence</p>
            </div>
          </div>
          <span className="mono text-xs text-gray-600 border border-gray-800 px-3 py-1 rounded-full">
            Powered by Claude
          </span>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-10">
          {/* Hero */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-light mb-3 tracking-tight" style={{ lineHeight: 1.15 }}>
              Diagnose your plant,<br />
              <span className="text-green-400 italic">heal your harvest.</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto" style={{ fontFamily: "inherit" }}>
              Upload a leaf or plant photo. Get instant AI diagnosis with fertilizer plans, dosage, and timing.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload Panel */}
            <div className="space-y-4">
              <div
                className={`upload-zone rounded-2xl p-8 text-center cursor-pointer ${dragOver ? "drag" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {image ? (
                  <img src={image} alt="Plant" className="max-h-72 mx-auto rounded-xl object-contain" />
                ) : (
                  <div className="py-10">
                    <div className="text-5xl mb-4">📸</div>
                    <p className="text-green-400 mono text-sm mb-1">DROP IMAGE HERE</p>
                    <p className="text-gray-500 text-sm">or click to browse</p>
                    <p className="text-gray-600 text-xs mt-3">JPG, PNG, WEBP supported</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>

              {image && (
                <button
                  onClick={analyzeImage}
                  disabled={loading}
                  className="glow-btn w-full py-4 rounded-xl mono text-sm font-bold tracking-widest uppercase text-white"
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
                <div className="rounded-xl p-4 bg-red-900/20 border border-red-800 text-red-300 text-sm mono">
                  ⚠ {error}
                </div>
              )}

              {/* API Key Note */}
              {/* <div className="card rounded-xl p-4 text-xs text-gray-500 mono">
                🔑 Set your API key in the <span className="text-green-400">API_KEY</span> constant at the top of the file before use.
              </div> */}
            </div>

            {/* Results Panel */}
            <div className="space-y-4">
              {!result && !loading && (
                <div className="card rounded-2xl p-10 text-center h-full flex flex-col items-center justify-center opacity-50">
                  <div className="text-6xl mb-4">🌱</div>
                  <p className="text-gray-400 italic">Your diagnosis will appear here</p>
                </div>
              )}

              {loading && (
                <div className="card rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-4">
                  <div className="text-5xl">🔬</div>
                  <div>
                    <p className="text-green-400 mono text-sm animate-pulse">Scanning for pathogens...</p>
                    <p className="text-gray-500 text-xs mt-1">AI analysis in progress</p>
                  </div>
                </div>
              )}

              {result && (
                <div className="space-y-4 fade-in">
                  {/* Summary card */}
                  <div className="card rounded-2xl p-5 flex items-center gap-5">
                    {/* Score ring */}
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1f2937" strokeWidth="3" />
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
                        <span className="mono text-sm font-bold" style={{ color: healthColor(result.healthScore) }}>
                          {result.healthScore}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-lg font-semibold">{result.plantName || "Unknown Plant"}</h3>
                        {result.urgencyLevel && (
                          <span className={`tag px-2 py-0.5 rounded-full ${urgencyBadge(result.urgencyLevel)}`}>
                            {result.urgencyLevel}
                          </span>
                        )}
                      </div>
                      <p className="text-green-400 mono text-xs">{result.healthStatus}</p>
                      {result.additionalNotes && (
                        <p className="text-gray-400 text-sm mt-1 italic">{result.additionalNotes}</p>
                      )}
                    </div>
                  </div>

                  {/* Diseases */}
                  {result.diseases?.length > 0 && (
                    <div className="card rounded-2xl p-5 space-y-3">
                      <h4 className="mono text-xs text-green-500 tracking-widest uppercase mb-3">Detected Issues</h4>
                      {result.diseases.map((d, i) => (
                        <div key={i} className="border border-white/5 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                            <span className="font-semibold text-white">{d.name}</span>
                            <div className="flex gap-2">
                              <span className={`tag px-2 py-0.5 rounded-full border ${severityBadge(d.severity)}`}>{d.severity}</span>
                              <span className="tag px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700">{d.confidence}% conf.</span>
                            </div>
                          </div>
                          {d.affectedArea && <p className="mono text-xs text-gray-500 mb-1">📍 {d.affectedArea}</p>}
                          <p className="text-gray-300 text-sm leading-relaxed">{d.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Treatments */}
                  {result.treatments?.length > 0 && (
                    <div className="card rounded-2xl p-5 space-y-3">
                      <h4 className="mono text-xs text-green-500 tracking-widest uppercase mb-3">Treatment & Fertilizer Plan</h4>
                      {result.treatments.map((t, i) => (
                        <div key={i} className="treatment-card rounded-xl p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div>
                              <span className="font-semibold text-green-300 text-base">{t.name}</span>
                              {t.activeIngredient && <span className="text-gray-500 mono text-xs ml-2">({t.activeIngredient})</span>}
                            </div>
                            <span className="tag px-2 py-0.5 rounded-full bg-green-900/50 text-green-400 border border-green-800">{t.type}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {t.dosage && (
                              <div className="bg-black/30 rounded-lg p-2">
                                <p className="mono text-gray-500 mb-0.5">DOSAGE</p>
                                <p className="text-white">{t.dosage}</p>
                              </div>
                            )}
                            {t.frequency && (
                              <div className="bg-black/30 rounded-lg p-2">
                                <p className="mono text-gray-500 mb-0.5">FREQUENCY</p>
                                <p className="text-white">{t.frequency}</p>
                              </div>
                            )}
                            {t.timing && (
                              <div className="bg-black/30 rounded-lg p-2">
                                <p className="mono text-gray-500 mb-0.5">TIMING</p>
                                <p className="text-white">{t.timing}</p>
                              </div>
                            )}
                            {t.method && (
                              <div className="bg-black/30 rounded-lg p-2">
                                <p className="mono text-gray-500 mb-0.5">METHOD</p>
                                <p className="text-white">{t.method}</p>
                              </div>
                            )}
                          </div>

                          {t.expectedResult && (
                            <div className="flex gap-2 items-start">
                              <span className="text-green-500 text-sm mt-0.5">✓</span>
                              <p className="text-gray-300 text-sm italic">{t.expectedResult}</p>
                            </div>
                          )}
                          {t.precautions && (
                            <div className="flex gap-2 items-start">
                              <span className="text-amber-500 text-sm mt-0.5">⚠</span>
                              <p className="text-amber-200/70 text-xs">{t.precautions}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Prevention */}
                  {result.preventionTips?.length > 0 && (
                    <div className="card rounded-2xl p-5">
                      <h4 className="mono text-xs text-green-500 tracking-widest uppercase mb-3">Prevention Tips</h4>
                      <ul className="space-y-2">
                        {result.preventionTips.map((tip, i) => (
                          <li key={i} className="flex gap-3 text-sm text-gray-300">
                            <span className="text-green-600 flex-shrink-0">→</span>
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

        <footer className="border-t border-white/5 py-6 text-center">
          <p className="mono text-xs text-gray-600">PhytoScan AI · For advisory purposes only · Always consult a local agronomist</p>
        </footer>
      </div>
    </div>
  );
}
