import axios from "axios";

const VITE_API_BACKEND_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/api";

const api = axios.create({
  baseURL: VITE_API_BACKEND_URL,
});

export default api;
