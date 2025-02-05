<template>
  <nav class="navbar">
    <div class="navbar-logo">
      <h1>编译原理</h1>
    </div>
    <div class="navbar-center">
      <ul class="navbar-links">
        <!-- 根据角色动态显示链接 -->
        <li v-if="role === '1'">
          <router-link to="/student/experiment" class="navbar-link" active-class="active-link">实验介绍</router-link>
        </li>
        <li v-if="role === '1'">
          <router-link to="/student/quiz" class="navbar-link" active-class="active-link">客观题</router-link>
        </li>
        <li v-if="role === '1'">
          <router-link to="/student/lexer-compiler" class="navbar-link" active-class="active-link">词法分析题编译</router-link>
        </li>
        <li v-if="role === '2'">
          <router-link to="/teacher/student-management" class="navbar-link" active-class="active-link">学生信息管理</router-link>
        </li>
        <li v-if="role === '2'">
          <router-link to="/teacher/obj-review" class="navbar-link" active-class="active-link">学生客观题答题情况</router-link>
        </li>
        <li v-if="role === '2'">
          <router-link to="/teacher/lexer-review" class="navbar-link" active-class="active-link">学生词法分析器题答题情况</router-link>
        </li>
        <li v-if="role === '3'">
          <router-link to="/admin/account-management" class="navbar-link" active-class="active-link">账号管理</router-link>
        </li>
      </ul>
    </div>
    <button class="logout-btn" @click="logout">退出</button>
  </nav>
</template>

<script>
import { ref, onMounted,getCurrentInstance } from 'vue';
import axios from 'axios';

export default {
  name: 'AppNavbar',
  setup() {
    const role = ref(sessionStorage.getItem('role') || 'guest'); // 默认为 guest
    let apiUrl = '';// 用于存储 API 地址

    // 在 mounted 钩子中初始化 apiUrl
    onMounted(() => {
      const instance = getCurrentInstance();
      if (instance) {
        apiUrl = instance.appContext.config.globalProperties.$apiUrl;
      }
    });

    const logout = async () => {
      try {
        await axios.get(`${apiUrl}/logout`, {
          headers: {
            token: sessionStorage.getItem('token') // 携带 token
          }
        });
          // 清除 sessionStorage 中的 token 和 role
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('role');
          window.location.href = '/'; // 跳转到首页
      } catch (error) {
        console.error('登出失败', error);
        alert('登出失败，请稍后重试！');
      }
    };

    return {
      role,
      logout
    };
  }
}
</script>

<style scoped>
/* Navbar 基本样式 */
.navbar {
  background: linear-gradient(135deg, #45aaf2, #34d8eb, #4caf50); /* 渐变背景 */
  color: white;
  padding: 15px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  border-radius: 25px; /* 圆角 */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); /* 更深的阴影 */
  z-index: 10;
  backdrop-filter: blur(8px); /* 背景模糊效果 */
  -webkit-backdrop-filter: blur(8px); /* Safari 支持 */
  transition: all 0.3s ease;
}

/* Logo 样式 */
.navbar-logo h1 {
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0;
  color: white;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.navbar-logo h1:hover {
  transform: scale(1.05); /* 悬浮放大效果 */
}

/* 中间菜单 */
.navbar-center {
  display: flex;
  justify-content: flex-start;  /* 将菜单项放置到右边 */
  flex-grow: 1; /* 使菜单容器占据剩余空间 */
}

.navbar-links {
  display: flex;
  gap: 30px;
  align-items: center;
  margin: 0;
  padding: 0;
}

.navbar-link {
  text-decoration: none;
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
  padding: 10px;
  border-radius: 5px;
  transition: color 0.3s ease, transform 0.3s ease, background-color 0.3s ease;
  position: relative;
}

.navbar-link::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -5px;
  width: 100%;
  height: 2px;
  background-color: transparent;
  transition: background-color 0.3s ease;
}

.navbar-link:hover {
  color: #FFD700; /* 鼠标悬停时的颜色 */
  background-color: rgba(255, 255, 255, 0.1); /* 鼠标悬停时的背景色 */
  transform: translateY(-5px); /* 小的悬浮效果 */
}

.navbar-link:hover::after {
  background-color: #FFD700; /* 鼠标悬停时的下划线 */
}

/* 当前活动链接的样式 */
.navbar-link.active-link {
  color: #FFD700; /* 当前活动链接的文字颜色 */
  font-weight: bold;
}

.navbar-link.active-link::after {
  background-color: #FFD700; /* 当前活动链接的下划线颜色 */
  height: 3px; /* 更粗的下划线 */
}

/* 退出按钮样式 */
.logout-btn {
  background-color: #FF4081;
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  position: absolute;
  right: 30px;
  top: 50%;
  transform: translateY(-50%);
}

.logout-btn:hover {
  background-color: #E91E63;
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.logout-btn:focus {
  outline: none;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navbar {
    padding: 20px;
    flex-direction: column;
    align-items: flex-start;
  }

  .navbar-logo h1 {
    font-size: 2rem;
    margin-bottom: 10px;
  }

  .navbar-center {
    flex-direction: column;
    gap: 20px;
  }

  .navbar-links {
    flex-direction: column;
    gap: 15px;
  }

  .logout-btn {
    position: static;
    margin-top: 20px;
    width: 100%;
    font-size: 14px;
  }
}
</style>