import axios from 'axios'

const getDefaultBaseUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:8000'
  const host = window.location.hostname
  const isLocal = host === 'localhost' || host === '127.0.0.1'
  return isLocal ? 'http://localhost:8000' : 'https://seyirtepe-api.onrender.com'
}

const rawBaseUrl = import.meta.env.VITE_API_URL || getDefaultBaseUrl()
const normalizedBaseUrl = String(rawBaseUrl).replace(/\/+$/, '')
const API_URL = normalizedBaseUrl.includes('/api/v1')
  ? normalizedBaseUrl
  : `${normalizedBaseUrl}/api/v1`

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const getApiOrigin = () => {
  try {
    const base = api.defaults.baseURL || API_URL
    const fallback = typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
    return new URL(String(base), fallback).origin
  } catch {
    return String(normalizedBaseUrl).replace(/\/+$/, '').replace(/\/api\/v1\/?$/, '')
  }
}

export const toAbsoluteApiUrl = (pathOrUrl) => {
  if (!pathOrUrl) return ''
  const value = String(pathOrUrl)
  if (/^https?:\/\//i.test(value)) return value
  const prefix = getApiOrigin()
  return value.startsWith('/') ? `${prefix}${value}` : `${prefix}/${value}`
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally
    if (error.response?.status === 401) {
      // Handle unauthorized
      const hadAdminToken = !!localStorage.getItem('adminToken')
      localStorage.removeItem('adminToken')
      localStorage.removeItem('token')

      // If we're in admin UI, force re-login
      if (typeof window !== 'undefined') {
        const path = window.location?.pathname || ''
        const isAdminPath = path === '/admin' || path.startsWith('/admin/')
        const isLoginPath = path === '/admin/login'
        if (hadAdminToken && isAdminPath && !isLoginPath) {
          window.location.assign('/admin/login')
        }
      }
    }
    return Promise.reject(error)
  }
)

// Categories API
export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const getCategoriesWithProducts = async () => {
  const response = await api.get('/categories/with-products');
  return response.data;
};

// Products API
export const getProducts = async (categoryId = null) => {
  const url = categoryId ? `/products?category_id=${categoryId}` : '/products';
  const response = await api.get(url);
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

// Reservations API
export const createReservation = async (data) => {
  const response = await api.post('/reservations', data);
  return response.data;
};

// Contact API
export const sendContactMessage = async (data) => {
  const response = await api.post('/contact', data);
  return response.data;
};

export const getContactInfo = async () => {
  const response = await api.get('/contact/info');
  return response.data;
};

export default api
