<template>
  <div id="app">
    <!-- 页面导航栏，排除登录页面 -->
    <AppNavbar v-if="!isLoginPage" />

    <!-- 错误提示组件 -->
    <ErrorDialog ref="errorDialog" />
    <div class="main-content">
      <!-- 动态加载页面组件 -->
      <router-view @trigger-error="triggerError" />
    </div>

    <!-- 浮动聊天框 -->
    <FloatingChat />
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import AppNavbar from './components/AppNavbar.vue'
import FloatingChat from './components/FloatingChat.vue'
import ErrorDialog from './components/ErrorDialog.vue'

export default {
  name: 'App',
  components: {
    AppNavbar,
    FloatingChat,
    ErrorDialog
  },
  setup() {
    const route = useRoute()
    const errorDialog = ref(null); // 创建 ref

    // 判断当前是否是登录页面
    const isLoginPage = computed(() => {
      let name = route.name ? route.name : 'LoginView'
      return name === 'LoginView'
    })

    const triggerError = (errorMessage) => {
      if (errorDialog.value) {
        errorDialog.value.showDialog(errorMessage); // 通过 ref 访问子组件方法
      }
    };


    return {
      isLoginPage,
      triggerError,
      errorDialog
    }
  }
}
</script>

<style scoped>
/* 页面背景设置为渐变 */
#app {
  background: linear-gradient(135deg, #2196F3, #4CAF50);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  font-family: 'Arial', sans-serif;
}

/* 页面主要内容区域，占满整个屏幕 */
.main-content {
  position: relative;
  z-index: 9;
  flex: 1;
  /* 占满剩余空间 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 20px;
  overflow-y: auto;
  /* 确保内容过多时可以滚动 */
}

/* 如果不是登录页面，应用导航栏 */
AppNavbar {
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* 页面内容区域 */
router-view {
  width: 100%;
  max-width: 1200px;
  margin-top: 80px;
  /* 为了避免导航栏遮挡内容 */
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  overflow: auto;
  /* 让内容可以滚动 */
}

/* 浮动聊天窗口 */
.FloatingChat {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #4CAF50;
  padding: 12px 20px;
  border-radius: 50px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  color: white;
  font-size: 16px;
}

.FloatingChat:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {

  /* 小屏幕下，内容区域和导航栏调整 */
  #app {
    padding: 10px;
  }

  .main-content {
    padding: 10px;
  }

  router-view {
    margin-top: 60px;
    /* 确保导航栏不会遮挡 */
    width: 100%;
    padding: 15px;
    box-shadow: none;
  }

  .FloatingChat {
    bottom: 10px;
    right: 10px;
    font-size: 14px;
  }
}
</style>
