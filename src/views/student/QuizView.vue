<template>
  <div class="quiz-container">
    <!-- 警示横幅 -->
    <div class="warning-banner animated-card">
      ⚠️ 客观题有且仅有一次计分机会，请认真对待！
    </div>

    <!-- 模式状态指示 -->
    <div class="mode-status animated-card" :class="modeClass">
      <span class="mode-icon">{{ modeIcon }}</span>
      {{ modeText }}
    </div>

    <main class="quiz-main">
      <!-- 选择题模块 -->
      <section class="question-section">
        <div class="section-header">
          <h2 class="section-title">选择题</h2>
          <div class="decorative-line"></div>
        </div>

        <div class="questions-grid">
          <div v-for="(question, index) in chooseQuestions" 
               :key="'mcq-' + index" 
               class="question-card animated-card">
            <h3 class="question-text">{{ question.title }}</h3>

            <div v-for="(choice, idx) in [question.choice0, question.choice1, question.choice2, question.choice3]"
                 :key="'choice-' + idx" 
                 class="choice">
              <input type="radio" 
                     :id="'option' + idx + '-' + index" 
                     v-model="answers[index]" 
                     :value="choice"
                     :name="'question' + index" 
                     class="option-input" />
              <label :for="'option' + idx + '-' + index" class="option-label">{{ choice }}</label>
            </div>

            <!-- 反馈区域 -->
            <div v-if="submitted" class="feedback" :data-correct="isCorrect[index]">
              <p class="answer-chosen">你的选择：{{ answers[index] || '未选择' }}</p>
              <p>{{ isCorrect[index] ? '✅ 答案正确' : '❌ 答案错误' }}</p>
              <p v-if="!isCorrect[index]" class="correct-answer">正确答案：{{ correctAnswers[index] }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 填空题模块 -->
      <section class="question-section">
        <div class="section-header">
          <h2 class="section-title">填空题</h2>
          <div class="decorative-line"></div>
        </div>

        <div class="questions-grid">
          <div v-for="(question, index) in fillQuestions" 
               :key="'fib-' + index" 
               class="question-card animated-card">
            <h3 class="question-text">{{ question.title }}</h3>
            <input type="text" 
                   v-model="answers[chooseQuestions.length + index]" 
                   class="answer-input"
                   placeholder="请输入答案" />

            <!-- 反馈区域 -->
            <div v-if="submitted" class="feedback" :data-correct="isFillCorrect[index]">
              <p class="answer-chosen">你的填写：{{ answers[chooseQuestions.length + index] || '未填写' }}</p>
              <p>{{ isFillCorrect[index] ? '✅ 答案正确' : '❌ 答案错误' }}</p>
              <p v-if="!isFillCorrect[index]" class="correct-answer">正确答案：{{ correctFillAnswers[index] }}</p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 粘性提交按钮 -->
    <div class="sticky-submit">
      <button type="submit" 
              class="submit-btn animated-card"
              @click.prevent="submitQuiz">
        <span class="button-text">提交答案</span>
        <span class="button-icon">🚀</span>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { getCurrentInstance } from 'vue';

export default {
  name: 'QuizView',
  setup() {
    // 响应式数据
    const answers = ref([]);
    const submitted = ref(false);
    const isCorrect = ref([]);
    const isFillCorrect = ref([]);
    const chooseQuestions = ref([]);
    const fillQuestions = ref([]);
    const correctAnswers = ref([]);
    const correctFillAnswers = ref([]);
    const token = sessionStorage.getItem('token');
    let apiUrl = '';

    // 模式相关状态
    const modeText = ref('');
    const modeClass = ref('');
    const modeIcon = computed(() => 
      modeClass.value === 'practice-mode' ? '📘' : '📝'
    );

    // 获取题目列表
    const getQuizQuestions = async () => {
      const chooseType = '词法分析';
      const chooseNum = 10;
      const fillType = '词法分析';
      const fillNum = 10;

      try {
        const headers = { 'token': token };
        const response = await axios.post(
          apiUrl + '/student/obj-question/list',
          { chooseType, chooseNum, fillType, fillNum },
          { headers }
        );

        if (response.data.code === 0) {
          // 初始化题目数据
          chooseQuestions.value = response.data.data.chooseList || [];
          fillQuestions.value = response.data.data.fillList || [];
          
          // 初始化答案数组
          answers.value = new Array(
            chooseQuestions.value.length + 
            fillQuestions.value.length
          ).fill('');

          // 设置模式状态
          const isPractice = response.data.data.practise === 1;
          modeText.value = isPractice 
            ? '练习模式，不计分' 
            : '测验模式，认真对待';
          modeClass.value = isPractice 
            ? 'practice-mode' 
            : 'test-mode';
        } else {
          alert(`获取题目失败：${response.data.message}`);
        }
      } catch (error) {
        console.error('题目加载失败:', error);
        alert('题目加载失败，请检查网络连接');
      }
    };

    // 提交答案处理
    const submitQuiz = async () => {
      // 测验模式确认提示
      if (modeClass.value === 'test-mode') {
        const confirm = window.confirm('本次提交将会计入成绩，确定提交吗？');
        if (!confirm) return;
      }

      submitted.value = true;

      try {
        // 构建请求数据
        const chooseAnswers = chooseQuestions.value.map((q, i) => ({
          id: q.id,
          answer: answers.value[i]
        }));

        const fillAnswers = fillQuestions.value.map((q, i) => ({
          id: q.id,
          answer: answers.value[chooseQuestions.value.length + i]
        }));

        // 提交校验请求
        const { data } = await axios.post(
          apiUrl + '/student/obj-question/check',
          { chooseAnswer: chooseAnswers, fillAnswer: fillAnswers },
          { headers: { 'token': token } }
        );

        if (data.code === 0) {
          // 处理选择题结果
          isCorrect.value = data.data.chooseResultList.map(r => r.mark === 1);
          correctAnswers.value = data.data.chooseResultList.map(r => r.answer);

          // 处理填空题结果
          isFillCorrect.value = data.data.fillResultList.map(r => r.mark === 1);
          correctFillAnswers.value = data.data.fillResultList.map(r => r.answer);

          modeText.value = '练习模式，不计分';
          modeClass.value = 'practice-mode';

        } else {
          alert(`答案校验失败：${data.message}`);
        }
      } catch (error) {
        console.error('提交失败:', error);
        alert('答案提交失败，请稍后重试');
      }
    };

    // 组件挂载时初始化
    onMounted(() => {
      const instance = getCurrentInstance();
      if (instance) {
        apiUrl = instance.appContext.config.globalProperties.$apiUrl;
        getQuizQuestions();
      }
    });

    return {
      answers,
      submitted,
      isCorrect,
      isFillCorrect,
      correctAnswers,
      correctFillAnswers,
      chooseQuestions,
      fillQuestions,
      submitQuiz,
      modeText,
      modeClass,
      modeIcon
    };
  }
};
</script>
<style scoped>
/* 背景层 */
.quiz-container {
  background: linear-gradient(160deg, #f8f9fa 0%, #e9ecef 100%);
  min-height: 100vh;
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 警示横幅 */
.warning-banner {
  position: relative;
  margin: 2rem 0;
  width: 100%;
  background: rgba(255, 165, 0, 0.1);
  color: #e65100;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: bold;
  text-align: center;
  box-shadow: 0 6px 15px rgba(255, 165, 0, 0.2);
  transform: translateY(-5px);
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 模式状态悬浮层 */
.mode-status {
  margin: 1rem 0;
  padding: 1rem 2rem;
  border-radius: 12px;
  background-color: rgba(0, 0, 0, 0.05);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  font-size: 1.1rem;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease-in-out;
}

.mode-status:hover {
  transform: translateY(-3px);
}

/* 题目卡片 */
.question-card {
  background: #fff;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
}

.question-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.15);
}

.question-text {
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.decorative-line {
  width: 50px;
  height: 3px;
  background-color: #007bff;
  margin: 0.5rem auto;
  border-radius: 5px;
}

/* 选择框样式 */
.choice {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.option-input {
  margin-right: 0.8rem;
  transition: transform 0.2s ease;
}

.option-input:checked {
  transform: scale(1.2);
}

.option-label {
  font-size: 1rem;
  color: #555;
  transition: color 0.3s ease;
}

.option-label:hover {
  color: #007bff;
}

/* 填空题样式 */
.answer-input {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 1rem;
  margin-top: 1rem;
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}

.answer-input:focus {
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
  outline: none;
}

/* 提交按钮 */
.submit-btn {
  background-color: #007bff;
  color: white;
  font-size: 1.1rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.2);
}

.submit-btn:hover {
  background-color: #0056b3;
  box-shadow: 0 6px 20px rgba(0, 123, 255, 0.3);
  transform: translateY(-3px);
}

.submit-btn:active {
  transform: translateY(2px);
}

/* 反馈区域 */
.feedback {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
  font-size: 1.1rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.feedback p {
  margin: 0.5rem 0;
}

.feedback[data-correct='true'] {
  border-left: 4px solid #28a745;
}

.feedback[data-correct='false'] {
  border-left: 4px solid #dc3545;
}

.correct-answer {
  font-size: 1rem;
  font-weight: 600;
  color: #007bff;
}

/* 粘性提交按钮 */
.sticky-submit {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}
</style>