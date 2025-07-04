import axios from "axios";

const VITE_API_BACKEND_URL =
  "https://nodejs-mongodb-server-67rf.onrender.com/api";

export const axiosInstance = axios.create({
  baseURL: VITE_API_BACKEND_URL,
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
      // Optionally, you can redirect to a login page here
    }
    return Promise.reject(error);
  }
);
