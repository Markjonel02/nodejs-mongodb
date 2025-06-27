import axios from "axios";

const VITE_API_BACKEND_URL =
  import.meta.env || "http://localhost:5000";

const api = axios.create({
  baseURL: VITE_API_BACKEND_URL,
});

export default api;
