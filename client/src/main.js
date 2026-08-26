import { createApp } from 'vue'
import './style.css'
import './analytics.css'
import './sidebar.css'
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')
