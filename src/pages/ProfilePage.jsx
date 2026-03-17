import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { User, Phone, MapPin, FileText, Save, CheckCircle } from "lucide-react";

export default function ProfilePage({ dark }) {
  const { user, api } = useAuth();

  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    address: "",
    bio: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get("/profile");

      setProfile({
        name: data.name || "",
        phone: data.phone || "",
        address: data.address || "",
        bio: data.bio || "",
      });
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      await api.put("/profile", profile);

      setMessage("Profile updated successfully!");

      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Update failed", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="p-10 sm:p-20 text-center">
        Loading Profile...
      </div>
    );

  return (
    <div
      className={`min-h-[calc(100vh-4rem)] py-10 sm:py-12 px-4 sm:px-6 lg:px-8 ${dark ? "bg-gray-950 text-white" : "bg-stone-50 text-gray-900"
        }`}
    >
      <div className="max-w-2xl mx-auto">

        <div
          className={`rounded-3xl shadow-xl overflow-hidden border ${dark
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-100"
            }`}
        >

          {/* COVER */}

          <div className="h-28 sm:h-32 bg-gradient-to-r from-emerald-500 to-teal-500" />

          <div className="px-5 sm:px-8 pb-8">

            {/* PROFILE HEADER */}

            <div className="relative -mt-12 mb-6 flex flex-col sm:flex-row sm:items-end sm:gap-6 text-center sm:text-left">

              <div
                className={`mx-auto sm:mx-0 inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl text-3xl sm:text-4xl shadow-lg border-4 ${dark
                    ? "bg-gray-800 border-gray-900"
                    : "bg-white border-white"
                  }`}
              >
                {user.role === "farmer" ? "👨‍🌾" : "🏪"}
              </div>

              <div className="mt-4 sm:mt-0 pb-1">
                <h1 className="text-xl sm:text-2xl font-bold">
                  {profile.name || user.name}
                </h1>

                <p
                  className={`text-xs sm:text-sm uppercase tracking-widest font-semibold ${dark ? "text-emerald-400" : "text-emerald-600"
                    }`}
                >
                  {user.role}
                </p>
              </div>
            </div>

            {/* FORM */}

            <form onSubmit={handleUpdate} className="space-y-6">

              {/* NAME + PHONE */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">

                <div>
                  <label
                    className={`block text-xs uppercase tracking-widest font-bold mb-2 ${dark ? "text-gray-500" : "text-gray-400"
                      }`}
                  >
                    Full Name
                  </label>

                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          name: e.target.value,
                        })
                      }
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${dark
                          ? "bg-gray-800 border-gray-700 text-white"
                          : "bg-stone-50 border-stone-200 text-gray-900"
                        }`}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-xs uppercase tracking-widest font-bold mb-2 ${dark ? "text-gray-500" : "text-gray-400"
                      }`}
                  >
                    Phone Number
                  </label>

                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                    <input
                      type="text"
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          phone: e.target.value,
                        })
                      }
                      placeholder="+91 XXXXX XXXXX"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${dark
                          ? "bg-gray-800 border-gray-700 text-white"
                          : "bg-stone-50 border-stone-200 text-gray-900"
                        }`}
                    />
                  </div>
                </div>
              </div>

              {/* ADDRESS */}

              <div>
                <label
                  className={`block text-xs uppercase tracking-widest font-bold mb-2 ${dark ? "text-gray-500" : "text-gray-400"
                    }`}
                >
                  Address
                </label>

                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />

                  <textarea
                    rows="2"
                    value={profile.address}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        address: e.target.value,
                      })
                    }
                    placeholder="Enter your village/city address"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${dark
                        ? "bg-gray-800 border-gray-700 text-white"
                        : "bg-stone-50 border-stone-200 text-gray-900"
                      }`}
                  />
                </div>
              </div>

              {/* BIO */}

              <div>
                <label
                  className={`block text-xs uppercase tracking-widest font-bold mb-2 ${dark ? "text-gray-500" : "text-gray-400"
                    }`}
                >
                  About / Experience
                </label>

                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />

                  <textarea
                    rows="3"
                    value={profile.bio}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        bio: e.target.value,
                      })
                    }
                    placeholder="Tell others about your farming or selling experience"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${dark
                        ? "bg-gray-800 border-gray-700 text-white"
                        : "bg-stone-50 border-stone-200 text-gray-900"
                      }`}
                  />
                </div>
              </div>

              {/* FOOTER */}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4">

                {message && (
                  <div className="flex items-center gap-2 text-emerald-500 font-semibold text-sm">
                    <CheckCircle className="w-4 h-4" />
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className={`sm:ml-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold transition hover:bg-emerald-700 shadow-lg ${saving
                      ? "opacity-70 cursor-not-allowed"
                      : ""
                    }`}
                >
                  <Save className="w-4 h-4" />

                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>

            </form>

          </div>
        </div>
      </div>
    </div>
  );
}