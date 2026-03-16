import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";

import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Add these as you build each page */}
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
