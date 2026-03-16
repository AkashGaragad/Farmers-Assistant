import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, User } from "lucide-react";

export default function Navbar({ dark, setDark }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navLinks = [
    { label: "Disease", path: "/crop-disease" },
    { label: "Fertiliser", path: "/fertiliser-guide" },
    { label: "Schemes", path: "/government-schemes" },
    { label: "Assistant", path: "/smart-assistant" },
    // { label: "Shop", path: "/buy-supplies" }
  ];

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 backdrop-blur-md border-b transition-colors duration-300 ${dark ? "bg-gray-950/80 border-gray-800" : "bg-white/80 border-stone-200"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer bg-transparent border-none">
          <span className="text-2xl">🌾</span>
          <span className={`text-xl font-bold tracking-tight inline-block ${dark ? "text-emerald-400" : "text-emerald-600"}`}>
            Farmers<span className={dark ? "text-white" : "text-gray-900"}>Assistant</span>
          </span>
        </button>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => navigate(link.path)}
              className={`transition-colors hover:text-emerald-500 bg-transparent border-none cursor-pointer ${dark ? "text-gray-400" : "text-gray-600"}`}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Right side: Auth & Theme Toggle */}
        <div className="flex items-center gap-4">
          {/* Auth State */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${dark ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
                   <User className="w-4 h-4" />
                   <span>{user.name}</span>
                </div>
                <button
                  onClick={() => {
                     logout();
                     navigate('/');
                  }}
                  className={`p-1.5 rounded-full transition-colors hover:bg-red-500/10 hover:text-red-500 ${dark ? 'text-gray-400' : 'text-gray-500'}`}
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className={`text-sm font-medium transition-colors hover:text-emerald-500 ${dark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium rounded-full text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Dark / Light Toggle */}
          <button
            onClick={() => setDark(!dark)}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 border-none cursor-pointer ${dark ? "bg-emerald-600" : "bg-stone-300"}`}
            aria-label="Toggle dark mode"
          >
            <span
              className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full flex items-center justify-center text-sm transition-transform duration-300 shadow-md ${dark ? "translate-x-7 bg-gray-950" : "translate-x-0 bg-white"}`}
            >
              {dark ? "🌙" : "☀️"}
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}
