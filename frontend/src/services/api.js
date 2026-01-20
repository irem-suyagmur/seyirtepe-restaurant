import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token')
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
      localStorage.removeItem('token')
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
