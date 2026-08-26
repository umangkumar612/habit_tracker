import api from './api'

const analyticsService = {
  async getAnalytics() {
    const { data } = await api.get('/analytics')
    return data.data
  },
  async getActivity(days = 90) {
    const { data } = await api.get('/analytics/activity', { params: { days } })
    return data.data
  },
  async getAchievements() {
    const { data } = await api.get('/achievements')
    return data.data.achievements
  },
  async getInsight() {
    const { data } = await api.get('/insights')
    return data.data
  },
}

export default analyticsService
