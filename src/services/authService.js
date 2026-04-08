import api from './api'

export const authService = {
  // POST /api/auth/login → { success, data: { accessToken, refreshToken, user } }
  login:         (body)  => api.post('/auth/login', body),
  // POST /api/auth/refresh
  refresh:       (body)  => api.post('/auth/refresh', body),
  // POST /api/auth/logout
  logout:        ()      => api.post('/auth/logout'),
  // GET /api/auth/me → { success, data: user }
  me:            ()      => api.get('/auth/me'),
}
