import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SmartAssistant from "./pages/SmartAssistant";
import Weather from "./componentas/Weather"
import SoilReport from "./componentas/SoilAnalysis"
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Add these as you build each page */}
        <Route path="/smart-assistant" element={<SmartAssistant />} />
        <Route path="/weather-prediction" element={<Weather />} />
        <Route path="/soil-report" element={<SoilReport />} />
        {/* <Route path="/disease-detection" element={<DiseaseDetection />} /> */}
        {/* <Route path="/fertiliser-guide" element={<FertiliserGuide />} /> */}
        {/* <Route path="/government-schemes" element={<GovernmentSchemes />} /> */}
        {/* <Route path="/connect-buyers" element={<ConnectBuyers />} /> */}
        {/* <Route path="/smart-assistant" element={<SmartAssistant />} /> */}
        {/* <Route path="/buy-supplies" element={<BuySupplies />} /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
