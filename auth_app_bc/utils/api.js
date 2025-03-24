// utils/api.js
import axios from "axios";
import * as SecureStore from "expo-secure-store";

// Lee el token de SecureStore
const getToken = async () => {
  try {
    return await SecureStore.getItemAsync("session_token");
  } catch (error) {
    console.error("Error obteniendo el token:", error);
    return null;
  }
};

const api = axios.create({
  // Cambia por la URL de tu servidor (por ej. la de ngrok)
  baseURL: "https://7217-2806-10be-8-111a-746b-54-d6a4-5af.ngrok-free.app",
  timeout: 10000,
});

// Interceptor para agregar token JWT en cada request
api.interceptors.request.use(
  async (config) => {
    // Evitar agregar token en la ruta de login
    if (config.url.includes("/auth")) {
      return config; // login no requiere Authorization
    }

    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Manejo de respuestas
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        // Token inválido o expirado
        console.log("Token expirado, eliminando session_token");
        await SecureStore.deleteItemAsync("session_token");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
