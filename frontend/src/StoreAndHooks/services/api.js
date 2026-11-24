import axios from "axios";

export const apiError = {
  url: null,
  method: null,
  status: null,
  message: null,
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorData = {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status || "Network Error",
      message:
        error.response?.data?.message ||
        error.message ||
        "Something went wrong!",
    };

    Object.assign(apiError, errorData);

    window.dispatchEvent(
      new CustomEvent("api-error", {
        detail: errorData,
      }),
    );

    return Promise.reject(error);
  },
);

export default api;
