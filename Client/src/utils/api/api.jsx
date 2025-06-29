import axios from "axios";

const VITE_API_BACKEND_URL =
  import.meta.env.MODE === "production"
    ? "https://nodejs-mongodb-79vz.onrender.com"
    : "http://localhost:5000";
// This is correct.
// In dev: http://localhost:5000
// In prod (Vercel): /api (which means requests go to https://your-vercel-app.com/api/...)

export const api = axios.create({
  baseURL: VITE_API_BACKEND_URL,
});
