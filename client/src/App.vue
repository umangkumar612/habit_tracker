<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import authService from './services/authService'
import habitService from './services/habitService'
import checkInService from './services/checkInService'
import analyticsService from './services/analyticsService'
import { messageFromError } from './services/api'

const route = useRoute()
const router = useRouter()
const user = ref(null)
const habits = ref([])
const loading = ref(true)
const saving = ref(false)
const toast = ref(null)
const modal = ref(null)
const selectedHabit = ref(null)
const history = ref([])
const historyMonth = ref(new Date().toISOString().slice(0, 7))
const form = ref({ name: '', description: '', date: '' })
const authForm = ref({ email: '', password: '', timezone: 'UTC' })
const authError = ref('')
const analytics = ref(null)
const activity = ref({ days: [], startDate: '', endDate: '' })
const achievements = ref([])
const insight = ref(null)

const isAuthPage = computed(() => ['/login', '/register'].includes(route.path))
const currentPage = computed(() => route.path.slice(1) || 'dashboard')
const firstName = computed(() => user.value?.email?.split('@')[0] || 'there')
const today = computed(() => user.value?.timezone
  ? new Intl.DateTimeFormat('en-CA', { timeZone: user.value.timezone }).format(new Date())
  : new Date().toISOString().slice(0, 10))
const completedCount = computed(() => habits.value.filter((habit) => habit.completedToday).length)
const bestStreak = computed(() => habits.value.reduce((best, habit) => Math.max(best, habit.longestStreak || 0), 0))
const activeStreaks = computed(() => habits.value.filter((habit) => habit.currentStreak > 0).length)
const progress = computed(() => habits.value.length ? Math.round((completedCount.value / habits.value.length) * 100) : 0)
const pageTitle = computed(() => ({ dashboard: 'Overview', habits: 'Your habits', analytics: 'Analytics', history: 'History', settings: 'Settings' }[currentPage.value] || 'Overview'))

function notify(message, type = 'success') {
  toast.value = { message, type }
  window.setTimeout(() => { toast.value = null }, 3600)
}
function navigate(path) { router.push(path) }
function initials(email) { return email?.slice(0, 2).toUpperCase() || 'HF' }
function getError(error) { return messageFromError(error) }
function prettyDate(date) {
  if (!date) return ''
  const [year, month, day] = date.split('-')
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))))
}
function shortDate(date) {
  const [year, month, day] = date.split('-')
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))))
}
async function loadApp() {
  if (!localStorage.getItem('habitflow_token')) { loading.value = false; return }
  try {
    user.value = await authService.getCurrentUser()
    habits.value = await habitService.getHabits()
    const results = await Promise.all([
      analyticsService.getAnalytics(),
      analyticsService.getActivity(),
      analyticsService.getAchievements(),
      analyticsService.getInsight(),
    ])
    analytics.value = results[0]
    activity.value = results[1]
    achievements.value = results[2]
    insight.value = results[3]
  }
  catch (_) { localStorage.removeItem('habitflow_token'); navigate('/login') }
  finally { loading.value = false }
}
async function submitAuth() {
  authError.value = ''; saving.value = true
  try {
    const result = route.path === '/register'
      ? await authService.register(authForm.value)
      : await authService.login({ email: authForm.value.email, password: authForm.value.password })
    localStorage.setItem('habitflow_token', result.token); user.value = result.user
    habits.value = await habitService.getHabits()
    await refreshAnalytics()
    navigate('/dashboard')
    await nextTick(addAnalyticsNavigation)
  } catch (error) { authError.value = getError(error) } finally { saving.value = false }
}
async function logout() {
  try { await authService.logout() } catch (_) { /* token is cleared regardless */ }
  localStorage.removeItem('habitflow_token'); user.value = null; habits.value = []; navigate('/login')
}
async function refreshAnalytics() {
  try {
    const results = await Promise.all([
      analyticsService.getAnalytics(),
      analyticsService.getActivity(),
      analyticsService.getAchievements(),
      analyticsService.getInsight(),
    ])
    analytics.value = results[0]
    activity.value = results[1]
    achievements.value = results[2]
    insight.value = results[3]
  } catch (error) { notify(getError(error), 'error') }
}
function openHabitModal(habit = null) {
  selectedHabit.value = habit; form.value = { name: habit?.name || '', description: habit?.description || '', date: '' }; modal.value = 'habit'
}
async function saveHabit() {
  if (!form.value.name.trim()) return notify('Habit name cannot be empty.', 'error')
  saving.value = true
  try {
    const habit = selectedHabit.value ? await habitService.updateHabit(selectedHabit.value.id, form.value) : await habitService.createHabit(form.value)
    habits.value = selectedHabit.value ? habits.value.map((item) => item.id === habit.id ? habit : item) : [habit, ...habits.value]
    await refreshAnalytics()
    modal.value = null; notify(selectedHabit.value ? 'Habit updated successfully.' : 'Habit created successfully.')
  } catch (error) { notify(getError(error), 'error') } finally { saving.value = false }
}
async function deleteHabit() {
  saving.value = true
  try { await habitService.deleteHabit(selectedHabit.value.id); habits.value = habits.value.filter((habit) => habit.id !== selectedHabit.value.id); await refreshAnalytics(); modal.value = null; notify('Habit deleted.') }
  catch (error) { notify(getError(error), 'error') } finally { saving.value = false }
}
async function checkIn(habit, date = today.value) {
  saving.value = true
  try {
    const updated = await checkInService.createCheckIn(habit.id, date)
    habits.value = habits.value.map((item) => item.id === updated.id ? updated : item)
    if (selectedHabit.value?.id === updated.id) selectedHabit.value = updated
    notify(date === today.value ? 'Check-in completed.' : `Check-in added for ${shortDate(date)}.`)
    if (selectedHabit.value?.id === habit.id) history.value = await checkInService.getCheckIns(habit.id)
    await refreshAnalytics()
  } catch (error) { notify(getError(error), 'error') } finally { saving.value = false }
}
async function openHistory(habit) {
  selectedHabit.value = habit; modal.value = 'history'; history.value = []
  try { history.value = await checkInService.getCheckIns(habit.id) } catch (error) { notify(getError(error), 'error') }
}
function openBackfill() { form.value.date = ''; modal.value = 'backfill' }
async function submitBackfill() { if (!form.value.date || form.value.date > today || (selectedHabit.value?.created_local_date && form.value.date < String(selectedHabit.value.created_local_date).slice(0, 10))) return notify('Choose a valid past date.', 'error'); modal.value = 'history'; await checkIn(selectedHabit.value, form.value.date) }
function closeModal() { if (!saving.value) modal.value = null }
function shiftMonth(amount) { const [year, month] = historyMonth.value.split('-').map(Number); historyMonth.value = new Date(Date.UTC(year, month - 1 + amount, 1)).toISOString().slice(0, 7) }
const calendarDays = computed(() => { const [year, month] = historyMonth.value.split('-').map(Number); const first = new Date(Date.UTC(year, month - 1, 1)); const count = new Date(Date.UTC(year, month, 0)).getUTCDate(); const offset = (first.getUTCDay() + 6) % 7; return [...Array(offset).fill(null), ...Array.from({ length: count }, (_, index) => `${year}-${String(month).padStart(2, '0')}-${String(index + 1).padStart(2, '0')}`)] })
const historyDates = computed(() => new Set(history.value.map((item) => item.localDate)))
const totalCheckIns = computed(() => history.value.length)
const monthLabel = computed(() => { const [year, month] = historyMonth.value.split('-').map(Number); return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, 1))) })
function isBeforeCreation(date) { return selectedHabit.value?.created_local_date && date < String(selectedHabit.value.created_local_date).slice(0, 10) }
function onUnauthorized() { user.value = null; habits.value = []; navigate('/login') }
function addAnalyticsNavigation() {
  const nav = document.querySelector('.sidebar nav')
  if (!nav || nav.querySelector('.analytics-nav-link')) return
  const button = document.createElement('button')
  button.className = 'analytics-nav-link'
  button.innerHTML = '<span>◈</span> Analytics'
  button.addEventListener('click', () => navigate('/analytics'))
  nav.appendChild(button)
}
function updateAnalyticsNavigation() {
  const link = document.querySelector('.analytics-nav-link')
  if (link) link.classList.toggle('active', currentPage.value === 'analytics')
}
watch(() => route.path, (path) => { if (isAuthPage.value && user.value) navigate('/dashboard'); if (path === '/register') authForm.value = { email: '', password: '', timezone: 'UTC' }; nextTick(updateAnalyticsNavigation) })
onMounted(async () => { window.addEventListener('habitflow:unauthorized', onUnauthorized); await loadApp(); await nextTick(addAnalyticsNavigation); updateAnalyticsNavigation() })
onUnmounted(() => window.removeEventListener('habitflow:unauthorized', onUnauthorized))
</script>

<template>
<div class="app-root">
  <section v-if="currentPage === 'analytics'" class="analytics-page page-content">
    <div class="section-heading page-heading"><div><p class="eyebrow">The bigger picture</p><h2>Your rhythm,<br><em>in focus.</em></h2><p class="muted">A clear view of the consistency you are building.</p></div><button class="button button-primary" @click="navigate('/dashboard')">Back to overview →</button></div>
    <div class="analytics-summary summary-grid"><article class="summary-card"><span class="summary-icon violet">◌</span><small>Total habits</small><strong>{{ analytics?.totalHabits || 0 }}</strong><span class="summary-note">{{ analytics?.activeHabits || 0 }} active</span></article><article class="summary-card"><span class="summary-icon green">✓</span><small>Total check-ins</small><strong>{{ analytics?.totalCheckIns || 0 }}</strong><span class="summary-note">{{ analytics?.totalCompletedLocalDays || 0 }} local days</span></article><article class="summary-card"><span class="summary-icon amber">⌁</span><small>Active streaks</small><strong>{{ analytics?.activeStreaks || 0 }}</strong><span class="summary-note">Best {{ analytics?.bestStreak || 0 }} days</span></article><article class="summary-card"><span class="summary-icon rose">✦</span><small>Overall consistency</small><strong>{{ analytics?.overallConsistency || 0 }}<i>%</i></strong><span class="summary-note">{{ analytics?.completedToday || 0 }} completed today</span></article></div>
    <div class="analytics-columns"><section class="analytics-panel activity-panel"><div class="panel-heading"><div><p class="eyebrow">Activity</p><h3>Last 90 local days</h3></div><span class="activity-legend">Less <i></i><i></i><i></i><i></i> More</span></div><div class="heatmap"><span v-for="day in activity.days" :key="day.date" class="heat-cell" :class="`level-${Math.min(4, day.count)}`" :title="`${day.date}: ${day.count} check-ins`"></span></div><div class="heatmap-range"><span>{{ activity.startDate }}</span><span>{{ activity.endDate }}</span></div></section><section class="analytics-panel strongest-panel"><p class="eyebrow">Most consistent</p><h3>{{ analytics?.mostConsistentHabit?.name || 'Your first habit is waiting' }}</h3><strong class="large-metric">{{ analytics?.mostConsistentHabit?.consistency || 0 }}<small>% consistency</small></strong><p class="muted">{{ analytics?.mostConsistentHabit ? 'The habit you return to most reliably.' : 'Create a habit to start seeing your pattern.' }}</p></section></div>
    <section class="analytics-panel insight-panel" v-if="insight"><span class="insight-mark">✦</span><div><p class="eyebrow">Your insight</p><h3>{{ insight.title }}</h3><p>{{ insight.message }}</p></div></section>
    <section class="analytics-panel achievements-panel"><div class="panel-heading"><div><p class="eyebrow">Milestones</p><h3>Quiet progress, noticed.</h3></div><span class="muted">{{ achievements.filter((item) => item.unlocked).length }} unlocked</span></div><div class="achievement-grid"><article v-for="achievement in achievements" :key="achievement.key" class="achievement" :class="{ unlocked: achievement.unlocked }"><span class="achievement-icon">{{ achievement.unlocked ? '✓' : '○' }}</span><div><strong>{{ achievement.title }}</strong><p>{{ achievement.description }}</p></div></article></div></section>
  </section>
  <div v-if="loading" class="loading-screen"><div class="brand-mark">✓</div><span>Loading HabitFlow</span></div>
  <div v-else-if="isAuthPage" class="auth-layout"><section class="auth-intro"><div class="brand"><span class="brand-mark">✓</span><strong>HabitFlow</strong></div><div class="intro-copy"><p class="eyebrow">A quieter way to grow</p><h1>Small actions.<br><em>Lasting change.</em></h1><p>Build a rhythm that belongs to you, one meaningful day at a time.</p></div><div class="intro-footer"><span>01</span><span class="intro-line"></span><span>Make today count</span></div></section><section class="auth-panel"><div class="auth-form-wrap"><div class="mobile-brand brand"><span class="brand-mark">✓</span><strong>HabitFlow</strong></div><p class="eyebrow">{{ route.path === '/register' ? 'Get started' : 'Welcome back' }}</p><h2>{{ route.path === '/register' ? 'Build habits that stick.' : 'Good to see you again.' }}</h2><p class="form-lead">{{ route.path === '/register' ? 'Your best routines start with a single step.' : 'Pick up where you left off.' }}</p><form @submit.prevent="submitAuth"><label>Email address<input v-model="authForm.email" type="email" autocomplete="email" placeholder="you@example.com" required></label><label>Password<input v-model="authForm.password" type="password" autocomplete="current-password" placeholder="At least 8 characters" required></label><label v-if="route.path === '/register'">Timezone<select v-model="authForm.timezone"><option>UTC</option><option>Asia/Kolkata</option><option>America/New_York</option><option>Europe/London</option><option>Australia/Sydney</option></select></label><p v-if="authError" class="form-error">{{ authError }}</p><button class="button button-primary button-wide" :disabled="saving">{{ saving ? 'Please wait...' : route.path === '/register' ? 'Create account' : 'Sign in' }}<span>↗</span></button></form><p class="auth-switch">{{ route.path === '/register' ? 'Already have an account?' : "Don't have an account?" }} <button class="text-button" @click="navigate(route.path === '/register' ? '/login' : '/register')">{{ route.path === '/register' ? 'Sign in' : 'Create account' }}</button></p></div></section></div>
  <div v-else class="app-shell"><aside class="sidebar"><div class="brand"><span class="brand-mark">✓</span><strong>HabitFlow</strong></div><nav><button :class="{ active: currentPage === 'dashboard' }" @click="navigate('/dashboard')"><span>◫</span> Overview</button><button :class="{ active: currentPage === 'habits' }" @click="navigate('/habits')"><span>◌</span> Habits</button><button :class="{ active: currentPage === 'history' }" @click="navigate('/history')"><span>◷</span> History</button></nav><div class="sidebar-bottom"><button :class="{ active: currentPage === 'settings' }" @click="navigate('/settings')"><span>⚙</span> Settings</button><div class="profile-mini"><div class="avatar">{{ initials(user?.email) }}</div><div><strong>{{ user?.email }}</strong><small>{{ user?.timezone }}</small></div><button class="icon-button" aria-label="Log out" @click="logout">↪</button></div></div></aside><main class="main-content"><header class="topbar"><div><p class="breadcrumb">Workspace / <strong>{{ pageTitle }}</strong></p><h1>{{ pageTitle }}</h1></div><div class="topbar-actions"><span class="date-chip">{{ prettyDate(today) }}</span><button class="button button-primary" @click="openHabitModal()">＋ New habit</button></div></header>
    <section v-if="currentPage === 'dashboard'" class="page-content"><div class="welcome-row"><div><p class="eyebrow">{{ new Date().getHours() < 12 ? 'Good morning' : 'Good to see you' }}, {{ firstName }}</p><h2>Small steps. Strong streaks.</h2><p class="muted">Keep your momentum moving forward.</p></div><div class="progress-ring" :style="{ '--progress': `${progress * 3.6}deg` }"><strong>{{ progress }}%</strong><small>today</small></div></div><div class="summary-grid"><article class="summary-card"><span class="summary-icon violet">◌</span><small>Total habits</small><strong>{{ habits.length }}</strong><span class="summary-note">Your daily practice</span></article><article class="summary-card"><span class="summary-icon green">✓</span><small>Completed today</small><strong>{{ completedCount }}<i> / {{ habits.length }}</i></strong><span class="summary-note">{{ progress }}% of your day</span></article><article class="summary-card"><span class="summary-icon amber">⌁</span><small>Active streaks</small><strong>{{ activeStreaks }}</strong><span class="summary-note">Habits in motion</span></article><article class="summary-card"><span class="summary-icon rose">✦</span><small>Best streak</small><strong>{{ bestStreak }}<i> days</i></strong><span class="summary-note">Personal record</span></article></div><div class="section-heading"><div><p class="eyebrow">Your rhythm</p><h3>Today’s habits</h3></div><button class="text-button" @click="navigate('/habits')">View all →</button></div><div v-if="habits.length" class="habit-grid"><article v-for="habit in habits.slice(0, 4)" :key="habit.id" class="habit-card" :class="{ completed: habit.completedToday }"><div class="card-top"><div class="habit-symbol">{{ habit.name.slice(0, 1).toUpperCase() }}</div><button class="icon-button" aria-label="Edit habit" @click="openHabitModal(habit)">•••</button></div><h3>{{ habit.name }}</h3><p>{{ habit.description || 'A little consistency goes a long way.' }}</p><div class="habit-stats"><span>⌁ {{ habit.currentStreak }} days</span><span>✦ Best {{ habit.longestStreak }}</span></div><div class="card-action"><button v-if="!habit.completedToday" class="button button-soft" :disabled="saving" @click="checkIn(habit)">Check in today →</button><span v-else class="completed-label">✓ Completed today</span><button class="history-link" @click="openHistory(habit)">History</button></div></article></div><div v-else class="empty-state"><div class="empty-icon">✦</div><h3>No habits yet</h3><p>Create your first habit and start building your streak.</p><button class="button button-primary" @click="openHabitModal()">Create your first habit ↗</button></div></section>
    <section v-else-if="currentPage === 'habits'" class="page-content"><div class="section-heading page-heading"><div><p class="eyebrow">Your collection</p><h2>Make the ordinary<br><em>extraordinary.</em></h2></div><button class="button button-primary" @click="openHabitModal()">＋ New habit</button></div><div v-if="habits.length" class="habit-grid full-grid"><article v-for="habit in habits" :key="habit.id" class="habit-card" :class="{ completed: habit.completedToday }"><div class="card-top"><div class="habit-symbol">{{ habit.name.slice(0, 1).toUpperCase() }}</div><button class="icon-button" @click="openHabitModal(habit)">•••</button></div><h3>{{ habit.name }}</h3><p>{{ habit.description || 'A little consistency goes a long way.' }}</p><div class="habit-stats"><span>⌁ {{ habit.currentStreak }} days</span><span>✦ Best {{ habit.longestStreak }}</span></div><div class="card-action"><button v-if="!habit.completedToday" class="button button-soft" :disabled="saving" @click="checkIn(habit)">Check in today →</button><span v-else class="completed-label">✓ Completed today</span><button class="history-link" @click="openHistory(habit)">History</button></div></article></div><div v-else class="empty-state"><div class="empty-icon">✦</div><h3>Your collection is waiting</h3><p>Start with one small habit you can return to every day.</p><button class="button button-primary" @click="openHabitModal()">Create a habit ↗</button></div></section>
    <section v-else-if="currentPage === 'history'" class="page-content"><div class="section-heading page-heading"><div><p class="eyebrow">Patterns over time</p><h2>Every day<br><em>adds up.</em></h2></div><span class="muted">{{ habits.length }} habits tracked</span></div><div class="history-list"><button v-for="habit in habits" :key="habit.id" class="history-row" @click="openHistory(habit)"><span class="habit-symbol">{{ habit.name.slice(0, 1).toUpperCase() }}</span><span class="history-name"><strong>{{ habit.name }}</strong><small>{{ habit.description || 'No description' }}</small></span><span class="history-stat"><small>Current streak</small><strong>{{ habit.currentStreak }} days</strong></span><span class="history-stat"><small>Best streak</small><strong>{{ habit.longestStreak }} days</strong></span><span>→</span></button><div v-if="!habits.length" class="empty-state"><h3>No history yet</h3><p>Your completed habits will appear here.</p></div></div></section>
    <section v-else class="page-content"><div class="section-heading page-heading"><div><p class="eyebrow">Your workspace</p><h2>Settings</h2><p class="muted">Keep your account details close at hand.</p></div></div><div class="settings-panel"><div class="settings-section"><div><p class="eyebrow">Account</p><h3>Profile details</h3><p class="muted">Your identity and calendar context.</p></div><div class="settings-fields"><label>Email address<input :value="user?.email" disabled></label><label>Timezone<input :value="user?.timezone" disabled></label></div></div><div class="settings-section"><div><p class="eyebrow">Security</p><h3>Account access</h3><p class="muted">Your sessions are protected by secure token authentication.</p></div><button class="button button-outline" @click="logout">Log out ↪</button></div><div class="policy-note">ⓘ <p><strong>About timezone changes</strong><br>Future habits and check-ins follow your saved timezone. Existing historical calendar dates never change.</p></div></div></section></main><nav class="mobile-nav"><button :class="{ active: currentPage === 'dashboard' }" @click="navigate('/dashboard')">◫<small>Overview</small></button><button :class="{ active: currentPage === 'habits' }" @click="navigate('/habits')">◌<small>Habits</small></button><button class="mobile-add" @click="openHabitModal()">＋</button><button :class="{ active: currentPage === 'history' }" @click="navigate('/history')">◷<small>History</small></button><button :class="{ active: currentPage === 'settings' }" @click="navigate('/settings')">⚙<small>Settings</small></button></nav></div>
  <div v-if="toast" class="toast" :class="toast.type"><span>{{ toast.type === 'success' ? '✓' : '!' }}</span>{{ toast.message }}</div>
  <div v-if="modal" class="modal-backdrop" @click.self="closeModal"><div class="modal" :class="{ 'modal-wide': modal === 'history' }"><button class="modal-close" aria-label="Close" @click="closeModal">×</button><template v-if="modal === 'habit'"><p class="eyebrow">{{ selectedHabit ? 'Refine your rhythm' : 'Start a new rhythm' }}</p><h2>{{ selectedHabit ? 'Edit habit' : 'Create a new habit' }}</h2><p class="muted">Give this practice a clear place in your day.</p><form @submit.prevent="saveHabit"><label>Habit name<input v-model="form.name" maxlength="100" placeholder="Read, move, learn..." required></label><label>Description <span class="field-count">{{ form.description.length }}/500</span><textarea v-model="form.description" maxlength="500" rows="4" placeholder="What does showing up look like?"></textarea></label><div class="modal-actions"><button type="button" class="button button-outline" @click="closeModal">Cancel</button><button class="button button-primary" :disabled="saving">{{ saving ? 'Saving...' : selectedHabit ? 'Save changes' : 'Create habit' }} ↗</button></div></form><button v-if="selectedHabit" class="danger-link" @click="modal = 'delete'">Delete this habit</button></template><template v-else-if="modal === 'delete'"><p class="eyebrow danger-text">Permanent action</p><h2>Delete this habit?</h2><p class="muted">This will permanently remove <strong>{{ selectedHabit?.name }}</strong> and its check-in history.</p><div class="modal-actions"><button class="button button-outline" @click="modal = 'habit'">Keep habit</button><button class="button button-danger" :disabled="saving" @click="deleteHabit">{{ saving ? 'Deleting...' : 'Delete habit' }}</button></div></template><template v-else-if="modal === 'backfill'"><p class="eyebrow">Add to your story</p><h2>Add past check-in</h2><p class="muted">Choose a local calendar date you completed this habit.</p><form @submit.prevent="submitBackfill"><label>Date<input v-model="form.date" type="date" :min="String(selectedHabit?.created_local_date).slice(0, 10)" :max="today" required></label><div class="modal-actions"><button type="button" class="button button-outline" @click="modal = 'history'">Cancel</button><button class="button button-primary">Add check-in ↗</button></div></form></template><template v-else><div class="history-modal-head"><div><p class="eyebrow">{{ selectedHabit?.name }}</p><h2>Your consistency</h2></div><button class="button button-soft" @click="openBackfill">＋ Past check-in</button></div><div class="mini-stats"><span><strong>{{ selectedHabit?.currentStreak }}</strong><small>Current streak</small></span><span><strong>{{ selectedHabit?.longestStreak }}</strong><small>Best streak</small></span></div><div class="calendar-head"><button class="icon-button" @click="shiftMonth(-1)">←</button><strong>{{ monthLabel }}</strong><button class="icon-button" @click="shiftMonth(1)">→</button></div><div class="calendar"><span v-for="(day, index) in ['M','T','W','T','F','S','S']" :key="`${day}-${index}`" class="weekday">{{ day }}</span><span v-for="(date, index) in calendarDays" :key="date || `blank-${index}`" class="calendar-day" :class="{ blank: !date, done: date && historyDates.has(date), future: date && date > today, before: date && isBeforeCreation(date) }">{{ date?.slice(-2).replace(/^0/, '') }}<i v-if="date && historyDates.has(date)">✓</i></span></div><div class="history-feed"><p class="eyebrow">Recent check-ins</p><div v-for="item in history.slice(0, 5)" :key="item.id" class="feed-row"><span>✓</span><strong>{{ prettyDate(item.localDate) }}</strong><small>{{ item.checkedInAt?.slice(11, 16) || '' }} UTC</small></div><p v-if="!history.length" class="muted">No check-ins yet. Your first one starts the story.</p></div></template></div></div>
</div>
</template>
