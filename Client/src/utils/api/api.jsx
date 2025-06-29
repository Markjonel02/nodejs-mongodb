import axios from "axios";

const VITE_API_BACKEND_URL =
  "https://nodejs-mongodb-79vz.onrender.com" || "http://localhost:5000";

// Export the configured Axios instance
export const api = axios.create({
  baseURL: VITE_API_BACKEND_URL,
  withCredentials: true, // Important for sending cookies/auth headers in cross-origin requests
});
