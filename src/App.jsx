import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./componentas/Navbar";
import Footer from "./componentas/Footer";
import Home from "./pages/Home";
import SmartAssistant from "./pages/SmartAssistant";
import Weather from "./componentas/Weather"
import SoilReport from "./componentas/SoilAnalysis"
import './App.css'
import PlantDiseaseDetector from "./componentas/plant_disease_detector";
import FertiliserRecommender from "./pages/FertiliserRecommender";
import KisanSahayak from "./pages/KisanSahayak";

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
    <BrowserRouter>
      <div className={`flex flex-col min-h-screen ${dark ? "bg-gray-950" : "bg-stone-50"}`}>
        <Navbar dark={dark} setDark={setDark} />
        <main className="flex-grow pt-16">
          <Routes>
            <Route path="/" element={<Home dark={dark} />} />
            {/* Add these as you build each page */}
            <Route path="/smart-assistant" element={<SmartAssistant dark={dark} />} />
            <Route path="/weather-prediction" element={<Weather dark={dark} />} />
            <Route path="/soil-report" element={<SoilReport dark={dark} />} />
            <Route path="/fertiliser-guide" element={<FertiliserRecommender dark={dark} />} />

            <Route path="/crop-disease" element={<PlantDiseaseDetector dark={dark} />} />

            <Route path="/government-schemes" element={<KisanSahayak dark={dark} />} />
            {/* <Route path="/connect-buyers" element={<ConnectBuyers />} /> */}
            {/* <Route path="/buy-supplies" element={<BuySupplies />} /> */}
          </Routes>
        </main>
        <Footer dark={dark} />
      </div>
    </BrowserRouter>
  )
}

export default App
