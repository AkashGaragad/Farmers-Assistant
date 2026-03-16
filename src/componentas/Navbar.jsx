import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
export default function Navbar() {
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
        <>
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
            </div>
        </>
    )
}