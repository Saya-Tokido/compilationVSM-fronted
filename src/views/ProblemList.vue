<template>
  <div class="container">
    <h2 class="title">选择题目</h2>
    
    <!-- Loading Indicator -->
    <div v-if="loading" class="loading">加载中...</div>

    <!-- Problems List -->
    <ul v-else class="problem-list">
      <li v-for="problem in problems" :key="problem.id" class="problem-item">
        <div class="problem-card">
          <h3 class="problem-title">{{ problem.name }}</h3>
          <p class="problem-info"><strong>难度：</strong>{{ problem.level }}</p>
          <p class="problem-info"><strong>提交次数：</strong>{{ problem.commitNum }}</p>
          <p class="problem-info"><strong>通过率：</strong>{{ problem.passPercent }}</p>
          <router-link :to="{ name: 'compilerView', params: { problemId: problem.id } }" class="start-btn">
            开始编程
          </router-link>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { ref, onMounted, getCurrentInstance } from 'vue';
import axios from 'axios';

export default {
  name: 'ProblemList',
  setup() {
    const problems = ref([]); // 存储题目信息
    const loading = ref(true); // 控制加载状态
    const apiUrl = getCurrentInstance().appContext.config.globalProperties.$apiUrl;
    const token = sessionStorage.getItem('token');

    // 获取题目列表
    const fetchProblems = async () => {
      try {
        const headers = { 'token': token };
        const requestData = {
          language: "c",        // 请求语言类型
          compLanguage: "PL0"   // 编译语言类型
        };

        const response = await axios.post(apiUrl + '/master/question/method_name', requestData, { headers });

        if (response.data.code === 0) {
          problems.value = response.data.data.methodList; // 获取题目列表
        } else {
          console.error('获取题目列表失败', response.data.message);
        }
      } catch (error) {
        console.error('获取题目列表失败', error);
      } finally {
        loading.value = false; // 请求完成后，关闭加载状态
      }
    };

    onMounted(fetchProblems); // 页面加载时调用获取题目列表

    return {
      problems,
      loading
    };
  }
};
</script>

<style scoped>
/* 整体布局 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px;
  background-color: #f1f6f9;
  border-radius: 15px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease-in-out;
}

.container:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.15);
}

/* 标题 */
.title {
  font-size: 2.8rem;
  font-weight: 700;
  color: #333;
  text-align: center;
  margin-bottom: 40px;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
}

/* 题目列表 */
.problem-list {
  list-style-type: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

/* 题目项 */
.problem-item {
  display: flex;
  justify-content: center;
}

.problem-card {
  width: 100%;
  padding: 25px;
  background: linear-gradient(135deg, #ffffff, #f9fafb);
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.problem-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

/* 题目标题 */
.problem-title {
  font-size: 1.6rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 12px;
  line-height: 1.5;
}

/* 题目信息 */
.problem-info {
  font-size: 1.1rem;
  color: #555;
  margin: 6px 0;
  transition: color 0.3s ease;
}

.problem-info strong {
  font-weight: 700;
}

/* 鼠标悬停时信息颜色变化 */
.problem-card:hover .problem-info {
  color: #007BFF;
}

/* "开始编程" 按钮 */
.start-btn {
  display: inline-block;
  margin-top: 20px;
  padding: 14px 22px;
  background-color: #4CAF50;
  color: white;
  font-size: 1.1rem;
  font-weight: bold;
  text-align: center;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.start-btn:hover {
  background-color: #45a049;
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* Loading 状态 */
.loading {
  font-size: 1.3rem;
  color: #4CAF50;
  text-align: center;
  font-weight: bold;
  padding: 50px 0;
  animation: loadingAnimation 1.5s infinite;
}

@keyframes loadingAnimation {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
</style>
