import axios from 'axios';

const isServer = typeof window === 'undefined';

const backendBaseUrl = (
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api'
).trim();

const ssrAxios = axios.create({
  baseURL: isServer ? backendBaseUrl : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

ssrAxios.interceptors.request.use(
  (config) => {
    if (isServer && String(config.baseURL || '').startsWith('/')) {
      config.baseURL = backendBaseUrl;
    }

    if (!isServer) {
      const token = localStorage.getItem('token');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default ssrAxios;
