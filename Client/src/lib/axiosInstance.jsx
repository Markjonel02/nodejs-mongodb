import axios from "axios";

const VITE_API_BACKEND_URL =
<<<<<<< HEAD:Client/src/utils/api/api.jsx
  "https://nodejs-mongodb-server-yscc.onrender.com" || "http://localhost:5000";

// Export the configured Axios instance
export const api = axios.create({
=======
  import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/api";
// This is correct.
// In dev: http://localhost:5000
// In prod (Vercel): /api (which means requests go to https://your-vercel-app.com/api/...)

export const axiosInstance = axios.create({
>>>>>>> production:Client/src/lib/axiosInstance.jsx
  baseURL: VITE_API_BACKEND_URL,
  withCredentials: true, // Important for sending cookies/auth headers in cross-origin requests
});
