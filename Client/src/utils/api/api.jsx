import axios from "axios";

const VITE_API_BACKEND_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000"
    : "https://nodejs-mongodb-servers.onrender.com";
// This is correct.
// In dev: http://localhost:5000
// In prod (Vercel): /api (which means requests go to https://your-vercel-app.com/api/...)

export const api = axios.create({
  baseURL: VITE_API_BACKEND_URL,
});
// Set default headers if needed
api.defaults.headers.common["Content-Type"] = "application/json";
// If you need to set an Authorization header, you can do it like this:
// api.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("jwtToken")}`;
