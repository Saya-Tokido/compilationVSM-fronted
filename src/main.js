import { createApp, ref, onMounted } from 'vue'
import App from './App.vue'
import router from './router'
import ErrorDialog from './components/ErrorDialog.vue'
import InfoDialog from './components/InfoDialog.vue'

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
app.config.globalProperties.$apiUrl = 'http://192.168.0.3:607/api'
// 使用 provide 把登录状态共享给所有组件
app.provide('isAuthenticated', isAuthenticated)
app.component('ErrorDialog', ErrorDialog);
app.component('InfoDialog',InfoDialog);

// // 注册全局方法 showError
// app.config.globalProperties.$showError = function (message) {
//   const errorDialog = app.config.globalProperties.$errorDialog;
//   if (errorDialog) {
//     errorDialog.showDialog(message);  // 调用 ErrorDialog 的 showDialog 方法
//   }
// };

app.use(router).mount('#app')
