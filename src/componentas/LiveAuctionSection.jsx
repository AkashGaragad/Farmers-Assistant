import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


export default function LiveAuctionSection({ dark }) {
    const navigate = useNavigate();
    const [pulse, setPulse] = useState(true);

    // Blinking LIVE dot
    useEffect(() => {
        const t = setInterval(() => setPulse((p) => !p), 900);
        return () => clearInterval(t);
    }, []);

    const stats = [
        { icon: "🧑‍🌾", label: "Farmers Active", value: "1,240+" },
        { icon: "🏪", label: "Buyers Online", value: "380+" },
        { icon: "📦", label: "Lots Listed", value: "94" },
        { icon: "💰", label: "Avg. Price Gain", value: "22%" },
    ];

    const liveItems = [
        { crop: "🌾 Wheat", qty: "50 Qtl", base: "₹2,100", current: "₹2,480", bids: 14 },
        { crop: "🌽 Maize", qty: "30 Qtl", base: "₹1,800", current: "₹2,050", bids: 9 },
        { crop: "🍅 Tomato", qty: "20 Qtl", base: "₹900", current: "₹1,340", bids: 21 },
    ];

    return (
        <section className="py-20 px-4">
            <div className="max-w-7xl mx-auto">

                {/* ── Section header ── */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-600/40">
                                <span className={`w-2 h-2 rounded-full bg-white transition-opacity duration-300 ${pulse ? "opacity-100" : "opacity-20"}`} />
                                Live
                            </span>
                            <span className={`text-xs font-medium ${dark ? "text-gray-500" : "text-gray-400"}`}>
                                Auction ends in real-time
                            </span>
                        </div>
                        <h2 className={`text-3xl sm:text-4xl font-extrabold leading-tight ${dark ? "text-white" : "text-gray-900"}`}>
                            Live Auction
                            <span className="ml-3 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                                Market
                            </span>
                        </h2>
                        <p className={`mt-2 text-sm max-w-md ${dark ? "text-gray-500" : "text-gray-500"}`}>
                            Farmers list their produce — verified buyers bid in real-time. No middlemen, better prices for everyone.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/live-auction")}
                        className="self-start sm:self-auto flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold shadow-lg hover:shadow-orange-500/40 hover:scale-105 transition-all duration-200"
                    >
                        Enter Auction Hall →
                    </button>
                </div>

                {/* ── Main clickable card ── */}
                <div
                    onClick={() => navigate("/live-auction")}
                    className={`group cursor-pointer relative rounded-3xl overflow-hidden border transition-all duration-300
            ${dark
                            ? "bg-gray-900 border-gray-800 hover:border-orange-500 hover:shadow-2xl hover:shadow-orange-500/20"
                            : "bg-white border-stone-200 hover:border-orange-400 hover:shadow-2xl hover:shadow-orange-200/60"
                        }`}
                >
                    {/* Top accent line on hover */}
                    <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {/* Background glow */}
                    <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />

                    <div className="relative p-6 sm:p-8">

                        {/* Stats row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                            {stats.map(({ icon, label, value }) => (
                                <div key={label} className={`rounded-2xl p-4 text-center ${dark ? "bg-gray-800/60" : "bg-stone-50 border border-stone-200"}`}>
                                    <div className="text-2xl mb-1">{icon}</div>
                                    <div className="text-xl font-extrabold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">{value}</div>
                                    <div className={`text-xs mt-0.5 ${dark ? "text-gray-500" : "text-gray-400"}`}>{label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Live lots preview */}
                        <div className="mb-6">
                            <p className={`text-xs font-semibold uppercase tracking-widest mb-3 ${dark ? "text-gray-600" : "text-gray-400"}`}>
                                Currently Bidding
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {liveItems.map((item) => (
                                    <div key={item.crop} className={`rounded-xl p-4 border ${dark ? "bg-gray-800/50 border-gray-700" : "bg-stone-50 border-stone-200"}`}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`text-sm font-bold ${dark ? "text-white" : "text-gray-900"}`}>{item.crop}</span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors duration-300 ${pulse ? "bg-red-500/20 text-red-400" : "bg-red-500/10 text-red-300"}`}>
                                                LIVE
                                            </span>
                                        </div>
                                        <span className={`text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>{item.qty}</span>
                                        <div className="flex items-center justify-between mt-2">
                                            <div>
                                                <p className={`text-[10px] ${dark ? "text-gray-600" : "text-gray-400"}`}>Base</p>
                                                <p className={`text-xs font-semibold ${dark ? "text-gray-400" : "text-gray-500"}`}>{item.base}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-[10px] ${dark ? "text-gray-600" : "text-gray-400"}`}>Current</p>
                                                <p className="text-sm font-extrabold text-emerald-500">{item.current}</p>
                                            </div>
                                        </div>
                                        <p className={`text-[10px] mt-2 ${dark ? "text-gray-600" : "text-gray-400"}`}>🔨 {item.bids} bids placed</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bottom CTA strip */}
                        <div className={`rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 border ${dark ? "border-orange-500/20" : "border-orange-200"}`}>
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-2">
                                    {["🧑‍🌾", "👩‍🌾", "🧑‍💼", "👩‍💼"].map((e, i) => (
                                        <span key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 ${dark ? "bg-gray-800 border-gray-900" : "bg-white border-stone-100"}`}>{e}</span>
                                    ))}
                                </div>
                                <p className={`text-sm font-medium ${dark ? "text-gray-300" : "text-gray-700"}`}>
                                    <span className="font-bold text-orange-500">1,620+ people</span> are bidding right now
                                </p>
                            </div>
                            <span className="flex items-center gap-1.5 text-sm font-semibold text-orange-500 group-hover:gap-3 transition-all duration-200">
                                Join the Auction →
                            </span>
                        </div>

                    </div>
                </div>

                {/* ── Role cards (Farmer / Buyer) ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    {[
                        {
                            role: "I'm a Farmer",
                            icon: "🧑‍🌾",
                            desc: "List your produce, set a base price and let buyers compete — you always get the best deal.",
                            cta: "List My Produce",
                            gradient: "from-emerald-500 to-green-500",
                            glow: "hover:shadow-emerald-500/20",
                        },
                        {
                            role: "I'm a Buyer",
                            icon: "🏪",
                            desc: "Browse fresh lots directly from farms, place bids and source quality produce at fair prices.",
                            cta: "Browse Lots",
                            gradient: "from-orange-500 to-red-500",
                            glow: "hover:shadow-orange-500/20",
                        },
                    ].map((r) => (
                        <div
                            key={r.role}
                            onClick={() => navigate("/live-auction")}
                            className={`group cursor-pointer rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 ${r.glow}
                ${dark ? "bg-gray-900 border-gray-800 hover:border-gray-700" : "bg-white border-stone-200 hover:border-stone-300"}`}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-3xl">{r.icon}</span>
                                <span className={`text-lg font-bold ${dark ? "text-white" : "text-gray-900"}`}>{r.role}</span>
                            </div>
                            <p className={`text-sm mb-4 leading-relaxed ${dark ? "text-gray-400" : "text-gray-500"}`}>{r.desc}</p>
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full text-white bg-gradient-to-r ${r.gradient} group-hover:gap-3 transition-all duration-200`}>
                                {r.cta} →
                            </span>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
