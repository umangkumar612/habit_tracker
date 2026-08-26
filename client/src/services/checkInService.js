import api from './api'

const checkInService = {
  async createCheckIn(habitId, date) {
    const { data } = await api.post(`/habits/${habitId}/check-ins`, { date })
    return data.data.habit
  },
  async getCheckIns(habitId) {
    const { data } = await api.get(`/habits/${habitId}/check-ins`)
    return data.data.checkIns
  },
}

export default checkInService
