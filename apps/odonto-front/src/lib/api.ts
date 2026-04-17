import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Export types that Kubb-generated clients expect
export type RequestConfig<TData = unknown> = AxiosRequestConfig<TData>;
export type ResponseErrorConfig<TError = unknown> = TError;
export type Client = typeof fetch;

export const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const savedActiveClinic = sessionStorage.getItem('activeClinic');
    if (savedActiveClinic) {
      try {
        const clinic = JSON.parse(savedActiveClinic);
        if (clinic && clinic.id) {
          config.headers['X-Clinic-Id'] = String(clinic.id);
        }
      } catch {
        /* ignore */
      }
    }
  }
  return config;
});

interface QueuedRequest {
  resolve: (value: string | null) => void;
  reject: (reason?: unknown) => void;
}

let isRefreshing = false;
let failedQueue: QueuedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/login' &&
      originalRequest.url !== '/auth/refresh'
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // POST /auth/refresh with HttpOnly refresh_token cookie automatically included
        // Response will include new HttpOnly cookies for access_token and refresh_token
        await api.post('/auth/refresh');

        isRefreshing = false;
        processQueue(null);

        // Retry original request (browser will send new cookies automatically)
        return api(originalRequest);
      } catch (err) {
        isRefreshing = false;
        processQueue(err);

        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('activeClinic');
          const publicPaths = ['/login', '/register', '/auth/'];
          const isPublicPath = publicPaths.some((p) => window.location.pathname.startsWith(p));
          if (!isPublicPath) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  },
);

const fetch = api.request.bind(api);
export default fetch;
