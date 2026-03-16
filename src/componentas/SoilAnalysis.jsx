// SoilAnalysis.jsx
import { useState, useRef } from "react";

const GRADIENTS = [
  "from-green-400 to-green-600",
  "from-cyan-400 to-blue-500",
  "from-amber-400 to-orange-500",
  "from-violet-400 to-purple-600",
  "from-rose-400 to-red-500",
  "from-emerald-400 to-teal-600",
  "from-blue-400 to-indigo-600",
];

const STATUS_STYLES = {
  low: { badge: "bg-amber-100 text-amber-800", bar: "bg-amber-400" },
  ok: { badge: "bg-green-100 text-green-800", bar: "bg-green-500" },
  high: { badge: "bg-red-100 text-red-700", bar: "bg-red-400" },
};

export default function SoilAnalysis() {
  const [fileData, setFileData] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef();

  const processFile = (f) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFileData(ev.target.result.split(",")[1]);
      setFileType(f.type);
      setFileName(f.name);
      if (f.type.startsWith("image/")) setPreview(ev.target.result);
    };
    reader.readAsDataURL(f);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDrag(false);
    if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  };

  const analyze = async () => {
    setLoading(true); setError(null); setResult(null);
    const isImage = fileType.startsWith("image/");
    const contentParts = [
      {
        type: isImage ? "image" : "document",
        source: { type: "base64", media_type: fileType, data: fileData }
      },
      {
        type: "text", text: `Analyze this soil test report. Return ONLY valid JSON (no markdown):
{
  "ph": { "value": number, "status": "low"|"optimal"|"high", "note": "string" },
  "nutrients": [
    { "name": string, "symbol": string, "value": number, "unit": string, "max": number, "status": "low"|"ok"|"high" }
  ],
  "insight": "2-3 sentence summary of soil health and amendment recommendations",
  "crops": [
    { "name": string, "emoji": string, "season": string, "fitScore": number,
      "tags": [string], "yield": string, "reason": string }
  ]
}
Include N, P, K, Organic Matter, Ca, Mg as nutrients. Provide 5-7 crop recommendations. Return valid JSON only.` }
    ];
    try {
      const res = await fetch("https://ai.api.nvidia.com/v1/retrieval/nvidia/llama-nemotron-rerank-1b-v2/reranking", {
        method: "POST",
        headers: {
          "Authorization": "Bearer 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",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          model: "nvidia/llama-nemotron-rerank-1b-v2",
          messages: [{ role: "user", content: contentParts }],
        }),
      });

      const data = await res.json();
      const raw = data.content.map((i) => i.text || "").join("");
      setResult(JSON.parse(raw.replace(/```json|```/g, "").trim()));
    } catch (e) {
      setError("Could not analyze the report. Please try a clearer image. (" + e.message + ")");
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Upload Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-green-200 dark:border-gray-700 shadow-sm p-8 mb-8 transition-colors duration-300">
        <h2 className="text-2xl font-bold text-green-950 dark:text-white mb-2">🌿 Soil Test Analyzer</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
          Upload a photo or PDF of your soil test report. AI will analyze nutrients and recommend the best crops for your field.
        </p>

        {/* Drop Zone */}
        <div
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200
            ${drag ? "border-green-500 bg-green-50 dark:bg-emerald-900/20" : "border-green-200 dark:border-gray-700 bg-green-50/50 dark:bg-gray-800/50 hover:border-green-400 dark:hover:border-emerald-500 hover:bg-green-50 dark:hover:bg-gray-800"}`}
        >
          <input ref={inputRef} type="file" accept="image/*,.pdf" className="hidden"
            onChange={(e) => e.target.files[0] && processFile(e.target.files[0])} />
          <div className="text-4xl mb-3">🌱</div>
          <p className="text-green-700 dark:text-emerald-400 font-semibold mb-1">Drop your soil test report here</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">Supports JPG, PNG, PDF — click to browse</p>
          {preview && <img src={preview} alt="preview" className="max-h-28 mx-auto mt-4 rounded-xl border border-green-200 dark:border-gray-600" />}
          {fileName && !preview && <p className="mt-3 text-sm text-green-600 dark:text-emerald-400 font-medium">✓ {fileName}</p>}
        </div>

        <button
          onClick={analyze}
          disabled={!fileData || loading}
          className="mt-5 w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold text-sm py-4 rounded-2xl
            transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-200
            disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
        >
          {loading ? "⏳ Analyzing…" : "🔬 Analyze Soil Report"}
        </button>

        {error && <div className="mt-4 bg-red-50 text-red-700 text-sm rounded-xl p-4">{error}</div>}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12 text-gray-500">
          <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm">Analyzing soil nutrients with AI…</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-8 fade-in">
          {/* pH + Nutrients */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-green-100 dark:border-gray-700 p-8 transition-colors duration-300">
            <h3 className="text-xl font-bold text-green-950 dark:text-white mb-5">Soil Nutrient Profile</h3>

            {/* pH */}
            <div className="flex items-center gap-4 bg-green-50 dark:bg-gray-800 rounded-xl p-4 mb-5">
              <div className={`w-3 h-3 rounded-full ${result.ph.status === "optimal" ? "bg-green-500" : result.ph.status === "low" ? "bg-blue-400" : "bg-amber-400"}`} />
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Soil pH</p>
                <p className="text-2xl font-bold text-green-900 dark:text-emerald-400">{result.ph.value} <span className="text-sm font-normal text-gray-400 dark:text-gray-500">— {result.ph.status}</span></p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{result.ph.note}</p>
              </div>
            </div>

            {/* Nutrients grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
              {result.nutrients.map((n) => {
                const pct = Math.min(100, Math.round((n.value / n.max) * 100));
                const s = STATUS_STYLES[n.status] || STATUS_STYLES.ok;
                return (
                  <div key={n.symbol} className="bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wide mb-1">{n.name}</p>
                    <p className="text-xl font-bold text-green-900 dark:text-emerald-400">{n.value}<span className="text-xs text-gray-400 dark:text-gray-500 ml-1">{n.unit}</span></p>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full mt-1 inline-block ${s.badge} dark:bg-gray-900 dark:text-gray-300 dark:border dark:border-gray-700`}>
                      {n.status.toUpperCase()}
                    </span>
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${s.bar}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Insight */}
            <div className="bg-green-50 dark:bg-emerald-900/10 border-l-4 border-green-500 dark:border-emerald-500 rounded-r-xl p-4 text-sm text-green-800 dark:text-emerald-200/80 leading-relaxed">
              {result.insight}
            </div>
          </div>

          {/* Crop Recommendations */}
          <div>
            <h3 className="text-xl font-bold text-green-950 dark:text-white mb-5">Recommended Crops for Your Field</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {result.crops.map((crop, i) => (
                <div key={crop.name} className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-green-100 dark:border-gray-700 p-6 hover:border-green-400 dark:hover:border-emerald-500 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-emerald-500/10 transition-all duration-200 cursor-default relative overflow-hidden group">
                  <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-green-100 dark:bg-emerald-900/20 opacity-50 pointer-events-none" />
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} flex items-center justify-center text-2xl mb-4 shadow-md`}>
                    {crop.emoji}
                  </div>
                  <h4 className="text-lg font-bold text-green-950 dark:text-white mb-1">{crop.name}</h4>
                  <p className="text-xs text-gray-400 mb-3">📅 {crop.season}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(crop.tags || []).map((t) => (
                      <span key={t} className="text-xs font-medium px-2.5 py-0.5 rounded-full border border-green-200 dark:border-gray-700 text-green-700 dark:text-emerald-400 bg-green-50 dark:bg-gray-800">{t}</span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mb-3">Est. yield: <strong className="text-green-800 dark:text-emerald-400">{crop.yield}</strong></p>
                  {/* Fit score bar */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-gray-400 w-12">Soil fit</span>
                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" style={{ width: `${crop.fitScore || 80}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-green-700 dark:text-emerald-400">{crop.fitScore || 80}%</span>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">{crop.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}