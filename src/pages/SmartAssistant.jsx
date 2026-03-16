import { useNavigate } from "react-router-dom";

const tools = [
  {
    icon: "🌤️",
    title: "Weather Prediction",
    description:
      "Get AI-powered weather forecasts and climate insights for smarter planning.",
    tags: ["7-day forecast", "Rain alerts", "Crop advice"],
    route: "/weather-prediction",
    gradient: "from-emerald-400 to-emerald-600",
    border: "border-emerald-200 hover:border-emerald-400",
    accent: "text-emerald-500",
    tagStyle: "bg-green-50 text-green-800 border-green-200",
    glow: "hover:shadow-emerald-100",
  },
  {
    icon: "🌱",
    title: "AI Soil Report Analyzer",
    description:
      "Analyze soil health, nutrient levels, and get personalized crop recommendations.",
    tags: ["Nutrient analysis", "pH levels", "Crop fit"],
    route: "/soil-report",
    gradient: "from-teal-400 to-green-600",
    border: "border-teal-200 hover:border-teal-400",
    accent: "text-teal-600",
    tagStyle: "bg-teal-50 text-teal-800 border-teal-200",
    glow: "hover:shadow-teal-100",
  },
  {
    icon: "🦠",
    title: "AI Crop Disease Detection",
    description:
      "Upload crop images to instantly detect plant diseases and get treatment recommendations.",
    tags: ["Disease detection", "Treatment advice", "Plant health"],
    route: "/crop-disease",
    gradient: "from-emerald-400 to-lime-600",
    border: "border-emerald-200 hover:border-emerald-400",
    accent: "text-emerald-600",
    tagStyle: "bg-emerald-50 text-emerald-800 border-emerald-200",
    glow: "hover:shadow-emerald-100",
  }
];

export default function SmartAssistant() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-6 py-16 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 bg-green-100 dark:bg-emerald-900/40 border border-green-300 dark:border-emerald-700/50 text-green-800 dark:text-emerald-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-5">
            <span className="w-2 h-2 rounded-full bg-green-500 dark:bg-emerald-400 inline-block" />
            AI-Powered Tools
          </span>
          <h1 className="text-4xl font-bold text-green-950 dark:text-white tracking-tight mb-3">
            Smart Assistants
          </h1>
          <p className="text-green-700 dark:text-gray-400 text-lg max-w-md mx-auto leading-relaxed">
            Choose an assistant below to get AI-powered insights tailored to your needs.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {tools.map((tool) => (
            <div
              key={tool.route}
              onClick={() => navigate(tool.route)}
              className={`bg-white dark:bg-gray-800 rounded-2xl border-2 ${tool.border} dark:border-gray-700 ${tool.glow} dark:hover:border-emerald-500 dark:hover:shadow-emerald-500/20 p-8 cursor-pointer 
                transition-all duration-200 hover:-translate-y-1 hover:shadow-xl relative overflow-hidden group`}
            >
              {/* Background glow blob */}
              <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-green-100 dark:bg-emerald-900/20 opacity-60 pointer-events-none" />

              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.gradient} 
                  flex items-center justify-center text-2xl mb-5 shadow-md`}
              >
                {tool.icon}
              </div>

              {/* Title & Description */}
              <h2 className="text-xl font-bold text-green-950 dark:text-white mb-2">{tool.title}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5">{tool.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {tool.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`text-xs font-medium px-3 py-1 rounded-full border ${tool.tagStyle} dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700`}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Footer CTA */}
              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold ${tool.accent} dark:text-emerald-400`}>
                  Open Assistant
                </span>
                <div
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${tool.gradient} 
                    flex items-center justify-center text-white text-sm 
                    group-hover:scale-110 transition-transform duration-200`}
                >
                  →
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          Tap a card to open that assistant
        </p>
      </div>
    </div>
  );
}