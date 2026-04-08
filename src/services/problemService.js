import api from './api'

export const problemService = {
  // GET /api/problems?page&limit&difficulty&tags&search
  getAll:        (params)    => api.get('/problems', { params }),
  // GET /api/problems/:id  (no hidden test cases)
  getById:       (id)        => api.get(`/problems/${id}`),
  // GET /api/problems/:id/admin  (with hidden test cases)
  getByIdAdmin:  (id)        => api.get(`/problems/${id}/admin`),
  // POST /api/problems
  create:        (body)      => api.post('/problems', body),
  // PUT /api/problems/:id
  update:        (id, body)  => api.put(`/problems/${id}`, body),
  // DELETE /api/problems/:id
  remove:        (id)        => api.delete(`/problems/${id}`),
}
