import axios from "axios";

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL?.trim();
  if (envUrl) {
    const cleanUrl = envUrl.replace(/\/+$/, "");
    return cleanUrl.endsWith("/api") ? cleanUrl : `${cleanUrl}/api`;
  }
  return import.meta.env.DEV ? "http://localhost:5000/api" : "/api";
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
