<template>
  <div class="login-container">
    <!-- 系统标题 -->
    <div class="system-title">
      <h1>编译原理虚拟仿真系统</h1>
    </div>

    <!-- 登录表单 -->
    <div class="login-form">
      <h2>登录</h2>
      <form @submit.prevent="login">
        <div class="input-group">
          <label for="username">用户名:</label>
          <input type="text" v-model="username" id="username" placeholder="请输入用户名" required />
        </div>
        <div class="input-group">
          <label for="password">密码:</label>
          <input type="password" v-model="password" id="password" placeholder="请输入密码" required />
        </div>
        <button type="submit">登录</button>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </form>
    </div>
  </div>
</template>
<script>
import { ref } from 'vue'
import md5 from 'js-md5'  // 导入 md5 加密库
import axios from 'axios'
import { useRouter } from 'vue-router'  // 导入 useRouter
import { getCurrentInstance} from 'vue'

export default {
  name: 'LoginView',
  setup() {
    const username = ref('')
    const password = ref('')
    const errorMessage = ref('')
    const router = useRouter()  // 获取 router 对象
    const apiUrl = getCurrentInstance().appContext.config.globalProperties.$apiUrl
    const login = async () => {
      try {
        // 在将密码发送到后端之前进行 MD5 加密
        const encryptedPassword = md5(password.value)
        // 发送 POST 请求到后端，密码是加密后的
        const response = await axios.post(apiUrl+'/login', {
          userName: username.value,
          password: encryptedPassword
        })

        // 如果后端返回 token
        if (0 == response.data.code) {
          // 将 token 存储到 sessionStorage
          sessionStorage.setItem('token', response.data.data.token)
          // 登录成功后跳转到实验介绍页面
          router.push('/experiment')  // 使用 router.push() 进行跳转
        } else {
          // 登录失败
          errorMessage.value = '登录失败，请检查用户名和密码。'
        }
      } catch (error) {
        // 捕获请求错误
        console.error('登录请求失败', error)
        errorMessage.value = '请求失败，请稍后再试。'
      }
    }

    return {
      username,
      password,
      login,
      errorMessage
    }
  }
}
</script>


<style scoped>
/* 背景和布局样式 */
body {
  background: linear-gradient(to right, #FF6A00, #FFB700);
  font-family: 'Arial', sans-serif;
}

.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  padding: 0 20px;
}

.system-title {
  text-align: center;
  margin-bottom: 40px;
}

.system-title h1 {
  font-size: 36px;
  font-weight: bold;
  background: linear-gradient(to left, #FF6A00, #FFB700);
  -webkit-background-clip: text;
  color: transparent;
  margin: 0;
  padding: 0;
  letter-spacing: 2px;
}

.login-form {
  background: white;
  padding: 30px 40px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

h2 {
  font-size: 28px;
  color: #333;
  margin-bottom: 20px;
  font-weight: bold;
}

/* 输入框和按钮样式 */
.input-group {
  margin-bottom: 20px;
  text-align: left;
}

.input-group label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 12px 15px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid #ccc;
  box-sizing: border-box;
  background-color: #f8f8f8;
  transition: all 0.3s ease;
}

input:focus {
  border-color: #FF6A00;
  background-color: #fff;
  outline: none;
}

button {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  background-color: #FF6A00;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #FF4D00;
}

button:active {
  background-color: #FF6A00;
  transform: scale(0.98);
}

/* 错误信息样式 */
.error-message {
  color: red;
  font-size: 14px;
  margin-top: 10px;
  font-weight: bold;
}

/* 响应式布局 */
@media (max-width: 600px) {
  .login-form {
    padding: 20px;
  }
}
</style>
