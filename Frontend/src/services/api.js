import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token from localStorage if present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: async (credentials) => {
    const response = await apiClient.post("/api/auth/login", credentials);
    if (response.data?.token) {
      localStorage.setItem("token", response.data.token);
    }
    if (response.data?.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await apiClient.post("/api/auth/register", userData);
    if (response.data?.token) {
      localStorage.setItem("token", response.data.token);
    }
    if (response.data?.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get("/api/auth/me");
    return response.data;
  },

  logout: async () => {
    try {
      await apiClient.post("/api/auth/logout");
    } catch (e) {
      // Ignore network errors on logout
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

export const scanAPI = {
  uploadAndAnalyze: async (formData) => {
    const response = await apiClient.post("/api/upload/scan", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000, // 60 seconds timeout for ML model execution
    });
    return response.data;
  },

  getAllScans: async () => {
    const response = await apiClient.get("/api/upload/posts");
    return response.data;
  },

  getScanById: async (id) => {
    const response = await apiClient.get(`/api/upload/${id}`);
    return response.data;
  },
};

export const patientAPI = {
  saveInfo: async (patientData) => {
    const response = await apiClient.post("/api/detail/info", patientData);
    return response.data;
  },

  getAll: async () => {
    const response = await apiClient.get("/api/detail");
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/api/detail/${id}`);
    return response.data;
  },
};

export default apiClient;
