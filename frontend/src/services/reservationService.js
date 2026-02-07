import api from './api'

export const reservationService = {
  create: async (data) => {
    const response = await api.post('/reservations', data)
    return response.data
  },

  getAll: async () => {
    const response = await api.get('/reservations')
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/reservations/${id}`)
    return response.data
  },
}
