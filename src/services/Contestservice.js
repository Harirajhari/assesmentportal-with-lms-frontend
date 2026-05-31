import api from './api'

export const contestService = {
  list:           (params)                   => api.get('/contests', { params }),
  get:            (id)                       => api.get(`/contests/${id}`),
  join:           (id)                       => api.post(`/contests/${id}/join`),
  submit:         (id, problemOrder, body)   => api.post(`/contests/${id}/submit/${problemOrder}`, body),
  leaderboard:    (id)                       => api.get(`/contests/${id}/leaderboard`),
  mySubmissions:  (id)                       => api.get(`/contests/${id}/my-submissions`),
  // Admin
  create:         (body)                     => api.post('/contests', body),
  update:         (id, body)                 => api.put(`/contests/${id}`, body),
  remove:         (id)                       => api.delete(`/contests/${id}`),
}