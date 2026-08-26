import api from './api'

export const authService = {
  async register(payload) {
    const { data } = await api.post('/auth/register', payload)
    return data.data
  },
  async login(payload) {
    const { data } = await api.post('/auth/login', payload)
    return data.data
  },
  async getCurrentUser() {
    const { data } = await api.get('/auth/me')
    return data.data.user
  },
  async logout() {
    await api.post('/auth/logout')
  },
}

export default authService
