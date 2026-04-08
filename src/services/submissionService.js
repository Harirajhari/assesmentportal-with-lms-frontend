import api from './api'

export const executionService = {
  // POST /api/execute  { problemId, language, code }
  run:    (body) => api.post('/execute', body),
  // POST /api/submit   { problemId, language, code }
  submit: (body) => api.post('/submit', body),
}

export const submissionService = {
  // GET /api/submissions?page&limit&status&problemId&collegeId
  getAll:   (params) => api.get('/submissions', { params }),
  // GET /api/submissions/stats
  getStats: ()       => api.get('/submissions/stats'),
  // GET /api/submissions/:id
  getById:  (id)     => api.get(`/submissions/${id}`),
}
