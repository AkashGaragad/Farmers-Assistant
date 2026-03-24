import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5001/api/auction",
});

// get all auctions
export const getAllAuctions = () => API.get("/");

// place bid
export const placeBid = (id, data) => API.post(`/bid/${id}`, data);

// get closed auctions for market price
export const getMarketPrices = () => API.get("/market-price");
