import api from './api'

const habitService = {
  async getHabits() {
    const { data } = await api.get('/habits')
    return data.data.habits
  },
  async getHabit(id) {
    const { data } = await api.get(`/habits/${id}`)
    return data.data.habit
  },
  async createHabit(payload) {
    const { data } = await api.post('/habits', payload)
    return data.data.habit
  },
  async updateHabit(id, payload) {
    const { data } = await api.put(`/habits/${id}`, payload)
    return data.data.habit
  },
  async deleteHabit(id) {
    await api.delete(`/habits/${id}`)
  },
}

export default habitService
