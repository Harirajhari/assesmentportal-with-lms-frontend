import api from './api'

export const collegeService = {
  getAll:    (params)   => api.get('/colleges', { params }),
  getById:   (id)       => api.get(`/colleges/${id}`),
  create:    (body)     => api.post('/colleges', body),
  update:    (id, body) => api.put(`/colleges/${id}`, body),
  remove:    (id)       => api.delete(`/colleges/${id}`),
  students:  (id)       => api.get(`/colleges/${id}/students`),
}

export const studentService = {
  getAll:    (params)   => api.get('/students', { params }),
  getById:   (id)       => api.get(`/students/${id}`),
  create:    (body)     => api.post('/students', body),
  update:    (id, body) => api.put(`/students/${id}`, body),
  remove:    (id)       => api.delete(`/students/${id}`),
}

export const leaderboardService = {
  // GET /api/leaderboard  → student gets own college; admin gets all
  get:          (params)    => api.get('/leaderboard', { params }),
  // GET /api/leaderboard/:collegeId  (admin only)
  getByCollege: (collegeId) => api.get(`/leaderboard/${collegeId}`),
  // POST /api/leaderboard/:collegeId/rebuild  (admin)
  rebuild:      (collegeId) => api.post(`/leaderboard/${collegeId}/rebuild`),
}
