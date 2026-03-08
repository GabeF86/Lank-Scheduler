import api from './client'

export const staffApi = {
  getAll: () => api.get('/staff').then((r) => r.data),
  create: (data) => api.post('/staff', data).then((r) => r.data),
  update: (id, data) => api.put(`/staff/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/staff/${id}`).then((r) => r.data),
}
