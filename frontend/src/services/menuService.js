import api from './api'

export const menuService = {
  getAll: async (category = null) => {
    const params = category ? { category } : {}
    const response = await api.get('/menu', { params })
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/menu/${id}`)
    return response.data
  },

  create: async (data) => {
    const response = await api.post('/menu', data)
    return response.data
  },
}
