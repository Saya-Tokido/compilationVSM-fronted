<template>
  <div class="container">
    <div v-if="role === '1' && !isLoading" class="info-card">
      <h2>个人中心</h2>
      <div class="student-info">
        <div class="info-item">
          <strong>姓名:</strong>
          <span>{{ studentInfo.basicInfo?.name }}</span>
        </div>
        <div class="info-item">
          <strong>学号:</strong>
          <span>{{ studentInfo.basicInfo?.number }}</span>
        </div>
        <div class="info-item">
          <strong>行政班:</strong>
          <span>{{ studentInfo.adminClass }}</span>
        </div>
        <div class="info-item">
          <strong>教学班:</strong>
          <span>{{ studentInfo.teachClass }}</span>
        </div>
        <div class="info-item score-highlight">
          <strong>客观题成绩:</strong>
          <span>{{ studentInfo.objScore }}</span>
        </div>
        <div class="info-item score-highlight">
          <strong>词法分析题成绩:</strong>
          <span>{{ studentInfo.lexerScore }}</span>
        </div>
      </div>
    </div>

    <div v-else-if="role === '2' && !isLoading" class="info-card">
      <h2>个人中心</h2>
      <div class="info-item">
        <strong>姓名:</strong>
        <span>{{ teacherInfo.basicInfo.name }}</span>
      </div>
      <div class="info-item">
        <strong>工号:</strong>
        <span>{{ teacherInfo.basicInfo.number }}</span>
      </div>
      <h3 style="margin-top: 1.5rem;">所带教学班</h3>
      <div class="class-list">
        <span v-for="(className, index) in teacherInfo.classList" :key="index" class="class-tag">
          {{ className }}
        </span>
      </div>
    </div>

    <div v-else-if="role === '3'" class="info-card admin-panel">
      <h2>个人中心</h2>
      <p>系统管理功能入口</p>
      <!-- 可添加管理功能按钮 -->
    </div>

    <div v-else class="loading">
      <div class="loading-animation"></div>
      <p>正在加载用户数据...</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, getCurrentInstance } from 'vue';

export default {
  setup() {
    const role = sessionStorage.getItem('role');
    const studentInfo = ref({});
    const teacherInfo = ref({});
    const isLoading = ref(true); // 控制加载状态
    const token = sessionStorage.getItem('token');
    let apiUrl = '';

    // 获取学生信息
    const fetchStudentInfo = async () => {
      try {
        const response = await fetch(`${apiUrl}/student/self`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'token': token
          },
        });
        const data = await response.json();

        if (data.code === 0) {
          studentInfo.value = data.data;
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('请求错误:', error);
      } finally {
        isLoading.value = false;
      }
    };


    // 获取教师信息
    const fetchTeacherInfo = async () => {
      try {
        const response = await fetch(`${apiUrl}/teacher/self`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'token': token
          },
        });
        const data = await response.json();

        if (data.code === 0) {
          teacherInfo.value = data.data;
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('请求错误:', error);
      } finally {
        isLoading.value = false; // 数据请求完成，修改加载状态
      }
    };

    // 根据角色加载相应的信息
    onMounted(() => {
      const instance = getCurrentInstance();
      if (instance) {
        apiUrl = instance.appContext.config.globalProperties.$apiUrl;
      }
      if (role === '1') {
        fetchStudentInfo();
      } else if (role === '2') {
        fetchTeacherInfo();
      }
    });

    // 返回模板中需要的数据
    return {
      role,
      studentInfo,
      teacherInfo,
      isLoading,
    };
  },
};
</script>
<style scoped>
/* 通用样式 */
.container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 20px;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

/* 卡片样式 */
.info-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
}

/* 标题样式 */
h2 {
  color: #2c3e50;
  border-bottom: 3px solid #3498db;
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
}

/* 学生信息样式 */
.student-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.info-item strong {
  color: #34495e;
  margin-right: 1rem;
}

.info-item span {
  color: #2c3e50;
  font-weight: 500;
}

/* 成绩突出显示 */
.score-highlight {
  color: #e74c3c;
  font-size: 1.2rem;
  font-weight: bold;
}

/* 教师班级列表 */
.class-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
}

.class-tag {
  background: #3498db;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

/* 管理员面板 */
.admin-panel {
  text-align: center;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 12px;
  color: #7f8c8d;
}

/* 加载动画 */
.loading-animation {
  display: inline-block;
  width: 2rem;
  height: 2rem;
  border: 3px solid #f3f3f3;
  border-radius: 50%;
  border-top: 3px solid #3498db;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }

  .info-card {
    padding: 1.5rem;
  }

  .student-info {
    grid-template-columns: 1fr;
  }
}
</style>
