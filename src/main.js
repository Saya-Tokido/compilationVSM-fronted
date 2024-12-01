import { createApp, ref, onMounted } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// 创建一个 ref 来存储登录状态
const isAuthenticated = ref(false)

// 检查 sessionStorage 是否有 token
onMounted(() => {
  const token = sessionStorage.getItem('token')
  if (token) {
    isAuthenticated.value = true
  }
})
app.config.globalProperties.$apiUrl = 'http://192.168.1.150:607'
// 使用 provide 把登录状态共享给所有组件
app.provide('isAuthenticated', isAuthenticated)

app.use(router).mount('#app')
