import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./componentas/Navbar";
import Footer from "./componentas/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./componentas/ProtectedRoute";
import SmartAssistant from "./pages/SmartAssistant";
import Weather from "./componentas/Weather"
import SoilReport from "./componentas/SoilAnalysis"
import './App.css'
import PlantDiseaseDetector from "./componentas/plant_disease_detector";
import FertiliserRecommender from "./pages/FertiliserRecommender";
import KisanSahayak from "./pages/KisanSahayak";
import LiveAuctionPage from "./pages/LiveAuctionPage";
import ProfilePage from "./pages/ProfilePage";
import SellerDashboard from "./pages/SellerDashboard";
import FarmerDashboard from "./pages/FarmerDashboard";
import CartPage from "./pages/CartPage";

import BuySuppliesPage from "./pages/BuySuppliesPage";
function App() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className={`flex flex-col min-h-screen ${dark ? "bg-gray-950" : "bg-stone-50"}`}>
          <Navbar dark={dark} setDark={setDark} />
          <main className="flex-grow pt-16">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home dark={dark} />} />
              <Route path="/login" element={<Login dark={dark} />} />
              <Route path="/register" element={<Register dark={dark} />} />

              {/* Protected Feature Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/live-auction" element={<LiveAuctionPage dark={dark} />} />
                <Route path="/smart-assistant" element={<SmartAssistant dark={dark} />} />
                <Route path="/weather-prediction" element={<Weather dark={dark} />} />
                <Route path="/soil-report" element={<SoilReport dark={dark} />} />
                <Route path="/fertiliser-guide" element={<FertiliserRecommender dark={dark} />} />
                <Route path="/crop-disease" element={<PlantDiseaseDetector dark={dark} />} />
                <Route path="/government-schemes" element={<KisanSahayak dark={dark} />} />

                {/* Dashboard & Profile */}
                <Route path="/profile" element={<ProfilePage dark={dark} />} />
                <Route path="/cart" element={<CartPage dark={dark} />} />

                <Route path="/buy-supplies" element={<BuySuppliesPage dark={dark} />} />
                <Route path="/seller-dashboard" element={<SellerDashboard dark={dark} />} />
                <Route path="/farmer-dashboard" element={<FarmerDashboard dark={dark} />} />
              </Route>
            </Routes>
          </main>
          <Footer dark={dark} />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
