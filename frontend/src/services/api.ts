import axios from 'axios';
import { getMockData } from './mockApiData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle expired token responses & offline mock fallbacks
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isNetworkError =
      error.message === 'Network Error' ||
      !error.response ||
      error.code === 'ERR_NETWORK' ||
      error.response.status === 502 ||
      error.response.status === 503 ||
      error.response.status === 504;

    if (isNetworkError && error.config) {
      try {
        const parsedData = error.config.data ? JSON.parse(error.config.data) : {};
        // Adjust url with baseURL prefix removed for matching logic
        const urlWithoutBase = (error.config.url || '').replace(API_URL, '');
        const mockResponse = getMockData(urlWithoutBase, error.config.method || 'GET', parsedData);
        return Promise.resolve({
          data: mockResponse,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        });
      } catch (err) {
        const urlWithoutBase = (error.config.url || '').replace(API_URL, '');
        const mockResponse = getMockData(urlWithoutBase, error.config.method || 'GET', {});
        return Promise.resolve({
          data: mockResponse,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        });
      }
    }

    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register') &&
        window.location.pathname !== '/'
      ) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
