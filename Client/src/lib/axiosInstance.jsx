import axios from "axios";

const VITE_API_BACKEND_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/api";
// This configuration correctly handles different environments:
// In development, it points to http://localhost:5000/api.
// In production (e.g., on Vercel), it points to /api, which means requests will go to https://your-vercel-app.com/api/...

export const axiosInstance = axios.create({
  baseURL: VITE_API_BACKEND_URL,
  withCredentials: true, // Important for sending cookies/auth headers in cross-origin requests
});

axiosInstance.interceptors.request.use(
  (config) => {
    // Add the Authorization header if the user is logged in
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    // Handle successful responses
    return response;
  },
  (error) => {
    // Handle errors globally
    if (error.response && error.response.status === 401) {
      // Unauthorized access, redirect to login or show a message
      console.error("Unauthorized access - redirecting to login");
      window.location.href = "/login"; // Redirect to login page
    }
    return Promise.reject(error);
  }
);
