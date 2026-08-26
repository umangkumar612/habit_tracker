import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', component: { template: '<div />' }, meta: { guest: true } },
  { path: '/register', component: { template: '<div />' }, meta: { guest: true } },
  { path: '/dashboard', component: { template: '<div />' }, meta: { auth: true } },
  { path: '/habits', component: { template: '<div />' }, meta: { auth: true } },
  { path: '/analytics', component: { template: '<div />' }, meta: { auth: true } },
  { path: '/history', component: { template: '<div />' }, meta: { auth: true } },
  { path: '/settings', component: { template: '<div />' }, meta: { auth: true } },
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to) => {
  const authenticated = Boolean(localStorage.getItem('habitflow_token'))
  if (to.meta.auth && !authenticated) return '/login'
  if (to.meta.guest && authenticated) return '/dashboard'
})

export default router
