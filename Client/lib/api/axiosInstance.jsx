import axios from "axios";

const VITE_API_BACKEND_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000"
    : "/api";
// This is correct.
// In dev: http://localhost:5000
// In prod (Vercel): /api (which means requests go to https://your-vercel-app.com/api/...)

export const axiosInstance = axios.create({
  baseURL: VITE_API_BACKEND_URL,
});
