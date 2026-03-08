import api from './client'

export const scheduleApi = {
  getByDate: (date) => api.get(`/schedules/${date}`).then((r) => r.data),
  upsert: (date, data) => api.put(`/schedules/${date}`, data).then((r) => r.data),
  getDates: (from, to) =>
    api.get('/schedules', { params: { from, to } }).then((r) => r.data),
}
