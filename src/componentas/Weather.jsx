import { useState, useEffect, useRef, useCallback } from "react";
const OPENWEATHER_KEY = "0592fd355c79c99d932609fa6500ee5ee";
const MAPTILER_KEY = "RZU54pXjwR99nuJbK7mz";

const weatherIcons = {
    Clear: "☀️", Clouds: "☁️", Rain: "🌧️", Drizzle: "🌦️",
    Thunderstorm: "⛈️", Snow: "❄️", Mist: "🌫️", Fog: "🌫️",
    Haze: "🌫️", Smoke: "💨", Dust: "🌪️", Tornado: "🌪️",
};

const getBg = (main) => {
    const map = {
        Clear: "from-amber-400 via-orange-300 to-yellow-200",
        Clouds: "from-slate-600 via-slate-400 to-slate-300",
        Rain: "from-blue-900 via-blue-700 to-blue-400",
        Drizzle: "from-blue-700 via-sky-500 to-sky-300",
        Thunderstorm: "from-gray-900 via-purple-900 to-gray-700",
        Snow: "from-blue-100 via-white to-slate-100",
        Mist: "from-gray-400 via-gray-300 to-gray-200",
        Fog: "from-gray-500 via-gray-300 to-gray-200",
        Haze: "from-amber-300 via-yellow-200 to-gray-200",
    };
    return map[main] || "from-emerald-900 via-emerald-700 to-emerald-400";
};

const WindDir = ({ deg }) => {
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return <span>{dirs[Math.round(deg / 45) % 8]}</span>;
};

const StatCard = ({ label, value, unit, icon }) => (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex flex-col gap-1 border border-white/20">
        <span className="text-2xl">{icon}</span>
        <span className="text-white/60 text-xs uppercase tracking-widest font-medium">{label}</span>
        <span className="text-white font-bold text-xl">{value}<span className="text-sm font-normal ml-1 text-white/70">{unit}</span></span>
    </div>
);

const ForecastCard = ({ day }) => {
    const date = new Date(day.dt * 1000);
    const name = date.toLocaleDateString("en", { weekday: "short" });
    const icon = weatherIcons[day.weather[0].main] || "🌡️";
    return (
        <div className="flex flex-col items-center gap-1.5 bg-white/10 rounded-2xl p-3 border border-white/20 min-w-[72px]">
            <span className="text-white/70 text-xs font-semibold uppercase">{name}</span>
            <span className="text-2xl">{icon}</span>
            <span className="text-white font-bold text-sm">{Math.round(day.temp.max)}°</span>
            <span className="text-white/50 text-xs">{Math.round(day.temp.min)}°</span>
        </div>
    );
};

export default function Weather() {
    const [query, setQuery] = useState("");
    const [weather, setWeather] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [locating, setLocating] = useState(false);
    const [mapUrl, setMapUrl] = useState("");
    const mapRef = useRef(null);

    const fetchWeather = useCallback(async (lat, lon, cityName) => {
        setLoading(true);
        setError("");
        try {
            const [cur, fore] = await Promise.all([
                fetch(`https://api.openweathermap.org/data/2.5/weather?${lat ? `lat=${lat}&lon=${lon}` : `q=${cityName}`}&appid=${OPENWEATHER_KEY}&units=metric`),
                fetch(`https://api.openweathermap.org/data/2.5/forecast/daily?${lat ? `lat=${lat}&lon=${lon}` : `q=${cityName}`}&cnt=7&appid=${OPENWEATHER_KEY}&units=metric`)
            ]);
            if (!cur.ok) throw new Error("City not found. Try another name.");
            const curData = await cur.json();
            const foreData = fore.ok ? await fore.json() : null;
            setWeather(curData);
            if (foreData?.list) setForecast(foreData.list);

            // MapTiler static map
            const clat = curData.coord.lat;
            const clon = curData.coord.lon;
            setMapUrl(
                `https://api.maptiler.com/maps/streets-v2/static/${clon},${clat},10/600x300@2x.png?key=${MAPTILER_KEY}&markers=${clon},${clat},red`
            );
        } catch (e) {
            setError(e.message || "Failed to fetch weather.");
            setWeather(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) fetchWeather(null, null, query.trim());
    };

    const handleDetect = () => {
        setLocating(true);
        setError("");
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocating(false);
                fetchWeather(pos.coords.latitude, pos.coords.longitude);
            },
            () => {
                setLocating(false);
                setError("Location access denied. Please search manually.");
            }
        );
    };

    useEffect(() => { handleDetect(); }, []);

    const bg = weather ? getBg(weather.weather[0].main) : "from-emerald-900 via-emerald-700 to-teal-500";
    const icon = weather ? (weatherIcons[weather.weather[0].main] || "🌡️") : "🌍";
    const sunrise = weather ? new Date(weather.sys.sunrise * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
    const sunset = weather ? new Date(weather.sys.sunset * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

    return (

        <div className={`min-h-screen bg-gradient-to-br ${bg} transition-all duration-1000 font-sans`}>
            {/* Header */}
            <div className="px-6 pt-8 pb-4 max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-1">
                    <span className="text-3xl">🤖</span>
                    <div>
                        <h1 className="text-white font-black text-2xl tracking-tight leading-none">Smart Assistant</h1>
                        <p className="text-white/60 text-xs tracking-widest uppercase font-medium">Weather Intelligence</p>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="px-6 max-w-2xl mx-auto mb-6">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search city..."
                        className="flex-1 bg-white/15 backdrop-blur text-white placeholder-white/50 rounded-full px-5 py-3 border border-white/25 outline-none focus:border-white/60 focus:bg-white/20 text-sm transition-all"
                    />
                    <button type="submit" className="bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-full px-5 py-3 text-sm font-semibold transition-all">
                        Search
                    </button>
                    <button
                        type="button"
                        onClick={handleDetect}
                        disabled={locating}
                        className="bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-full px-4 py-3 text-sm transition-all"
                        title="Detect my location"
                    >
                        {locating ? "⏳" : "📍"}
                    </button>
                </form>
                {error && <p className="text-red-300 text-sm mt-2 px-2">{error}</p>}
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    <p className="text-white/70 text-sm">Detecting weather...</p>
                </div>
            )}

            {/* Weather Card */}
            {!loading && weather && (
                <div className="px-6 max-w-2xl mx-auto space-y-4 pb-12">

                    {/* Main Card */}
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-2xl">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-white font-black text-3xl leading-none">{weather.name}</h2>
                                <p className="text-white/60 text-sm mt-0.5">{weather.sys.country} · {new Date().toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" })}</p>
                                <p className="text-white/80 text-base mt-3 capitalize">{weather.weather[0].description}</p>
                            </div>
                            <div className="text-7xl leading-none">{icon}</div>
                        </div>
                        <div className="mt-4 flex items-end gap-3">
                            <span className="text-white font-black text-7xl leading-none">{Math.round(weather.main.temp)}°</span>
                            <div className="pb-2 text-white/60 text-sm">
                                <div>Feels {Math.round(weather.main.feels_like)}°C</div>
                                <div>H:{Math.round(weather.main.temp_max)}° L:{Math.round(weather.main.temp_min)}°</div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        <StatCard label="Humidity" value={weather.main.humidity} unit="%" icon="💧" />
                        <StatCard label="Wind" value={Math.round(weather.wind.speed * 3.6)} unit="km/h" icon="💨" />
                        <StatCard label="Pressure" value={weather.main.pressure} unit="hPa" icon="🔵" />
                        <StatCard label="Visibility" value={weather.visibility ? (weather.visibility / 1000).toFixed(1) : "N/A"} unit="km" icon="👁️" />
                        <StatCard label="Sunrise" value={sunrise} unit="" icon="🌅" />
                        <StatCard label="Sunset" value={sunset} unit="" icon="🌇" />
                    </div>

                    {/* Wind Direction */}
                    {weather.wind?.deg !== undefined && (
                        <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20 flex items-center gap-4">
                            <div
                                className="w-10 h-10 flex items-center justify-center text-2xl transition-transform"
                                style={{ transform: `rotate(${weather.wind.deg}deg)` }}
                            >↑</div>
                            <div>
                                <span className="text-white font-semibold">Wind Direction: </span>
                                <span className="text-white/80"><WindDir deg={weather.wind.deg} /> ({weather.wind.deg}°)</span>
                            </div>
                        </div>
                    )}

                    {/* 7-Day Forecast */}
                    {forecast && forecast.length > 0 && (
                        <div>
                            <h3 className="text-white/70 text-xs uppercase tracking-widest font-semibold mb-3 px-1">7-Day Forecast</h3>
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {forecast.map((day, i) => <ForecastCard key={i} day={day} />)}
                            </div>
                        </div>
                    )}

                    {/* Map */}
                    {mapUrl && (
                        <div>
                            <h3 className="text-white/70 text-xs uppercase tracking-widest font-semibold mb-3 px-1">📍 Location Map</h3>
                            <div className="rounded-2xl overflow-hidden border border-white/20 shadow-xl">
                                <img
                                    src={mapUrl}
                                    alt={`Map of ${weather.name}`}
                                    className="w-full object-cover"
                                    onError={() => setMapUrl("")}
                                />
                                <div className="bg-black/30 backdrop-blur px-4 py-2 flex items-center gap-2">
                                    <span className="text-white/60 text-xs">Lat: {weather.coord.lat.toFixed(4)} · Lon: {weather.coord.lon.toFixed(4)}</span>
                                    <span className="ml-auto text-white/40 text-xs">MapTiler</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Air Quality hint */}
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/20 text-white/70 text-sm flex gap-3 items-start">
                        <span className="text-xl">🌿</span>
                        <div>
                            <p className="font-semibold text-white mb-0.5">Weather Prediction</p>
                            <p>
                                {weather.main.humidity > 80
                                    ? "High humidity detected — rain likely within the next few hours."
                                    : weather.main.humidity > 60
                                        ? "Moderate humidity. Partly cloudy conditions may develop."
                                        : "Low humidity and stable conditions expected for today."}
                                {weather.wind.speed > 10 ? " Strong winds advisory in effect." : ""}
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-white/30 text-xs pb-2">Powered by OpenWeatherMap · MapTiler</p>
                </div>
            )}

            {/* Empty state */}
            {!loading && !weather && !error && (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-white/60">
                    <span className="text-5xl">🌍</span>
                    <p className="text-sm">Searching for your location...</p>
                </div>
            )}
        </div>
    );
}
