<template>
  <div class="quiz-container">
    <h1 class="quiz-title">选择题</h1>
    <p class="quiz-description">请选择正确的选项：</p>

    <form @submit.prevent="submitQuiz" class="quiz-form">
      <!-- 渲染选择题 -->
      <div v-for="(question, index) in chooseQuestions" :key="'mcq-' + index" class="question-card">
        <h3 class="question-text">{{ question.title }}</h3>

        <div v-for="(choice, idx) in [question.choice0, question.choice1, question.choice2, question.choice3]" :key="'choice-' + idx" class="choice">
          <input type="radio" :id="'option' + idx + '-' + index" v-model="answers[index]" :value="choice" 
            :name="'question' + index" class="option-input" />
          <label :for="'option' + idx + '-' + index" class="option-label">{{ choice }}</label>
        </div>

        <!-- 选择题评估反馈 -->
        <div v-if="submitted" class="feedback">
          <p class="answer-chosen">你选择的答案是：{{ answers[index] }}</p>
          <p>{{ isCorrect[index] ? '答案正确！' : '答案错误！' }}</p>
          <p v-if="!isCorrect[index]" class="correct-answer">正确答案是：{{ correctAnswers[index] }}</p>
        </div>
      </div>

      <h1 class="quiz-title">填空题</h1>
      <!-- 渲染填空题 -->
      <div v-for="(question, index) in fillQuestions" :key="'fib-' + index" class="question-card">
        <h3 class="question-text">{{ question.title }}</h3>
        <input type="text" v-model="answers[chooseQuestions.length + index]" class="answer-input" 
          placeholder="请输入你的答案" />

        <!-- 填空题评估反馈 -->
        <div v-if="submitted" class="feedback">
          <p class="answer-chosen">你填写的答案是：{{ answers[chooseQuestions.length + index] }}</p>
          <p>{{ isFillCorrect[index] ? '答案正确！' : '答案错误！' }}</p>
          <p v-if="!isFillCorrect[index]" class="correct-answer">正确答案是：{{ correctFillAnswers[index] }}</p>
        </div>
      </div>

      <!-- 提交按钮 -->
      <button type="submit" class="submit-btn">提交答案</button>
    </form>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { getCurrentInstance } from 'vue';

export default {
  name: 'QuizView',
  setup() {
    const answers = ref([]); // 用户的所有答案
    const submitted = ref(false); // 是否提交答案
    const isCorrect = ref([]); // 所有选择题的答案是否正确
    const isFillCorrect = ref([]); // 所有填空题的答案是否正确
    const chooseQuestions = ref([]); // 存储选择题
    const fillQuestions = ref([]); // 存储填空题
    const correctAnswers = ref([]); // 存储所有选择题正确答案
    const correctFillAnswers = ref([]); // 存储所有填空题正确答案
    const token = sessionStorage.getItem('token'); // 从 session 中获取 token
    const apiUrl = getCurrentInstance().appContext.config.globalProperties.$apiUrl;

    // 获取选择题
    const getChooseQuestions = async () => {
      try {
        const headers = { 'token': token };
        const response = await axios.post(apiUrl + '/obj_question/choose_list', { "type": "词法分析", "num": 10 }, { headers });
        chooseQuestions.value = response.data.data.chooseList; // 将返回的选择题添加到 chooseQuestions 中
        correctAnswers.value = chooseQuestions.value.map(q => q.correctAnswer); // 假设返回的每个问题有 correctAnswer 属性
      } catch (error) {
        console.error('无法获取选择题', error);
      }
    };

    // 获取填空题
    const getFillQuestions = async () => {
      try {
        const headers = { 'token': token };
        const response = await axios.post(apiUrl + '/obj_question/fill_list', { "type": "词法分析", "num": 10 }, { headers });
        fillQuestions.value = response.data.data.fillList; // 将返回的填空题添加到 fillQuestions 中
        correctFillAnswers.value = fillQuestions.value.map(q => q.correctAnswer); // 假设返回的每个问题有 correctAnswer 属性
      } catch (error) {
        console.error('无法获取填空题', error);
      }
    };

    // 获取所有题目
    const getQuizQuestions = async () => {
      await getChooseQuestions(); // 获取选择题
      await getFillQuestions(); // 获取填空题
    };

    // 提交答案
    const submitQuiz = async () => {
      submitted.value = true;

      // 校验选择题
      const chooseAnswers = chooseQuestions.value.map((question, index) => ({
        id: question.id,
        answer: answers.value[index]
      }));

      try {
        const chooseResponse = await axios.post(apiUrl + '/obj_question/choose_check', { answers: chooseAnswers }, {
          headers: { 'token': token }
        });

        const chooseCheckList = chooseResponse.data.data.checkUnitList;
        isCorrect.value = chooseCheckList.map(unit => unit.mark);
        correctAnswers.value = chooseCheckList.map(unit => unit.answer);
      } catch (error) {
        console.error('无法提交选择题答案', error);
      }

      // 校验填空题
      const fillAnswers = fillQuestions.value.map((question, index) => ({
        id: question.id,
        answer: answers.value[chooseQuestions.value.length + index]
      }));

      try {
        const fillResponse = await axios.post(apiUrl + '/obj_question/fill_check', { answers: fillAnswers }, {
          headers: { 'token': token }
        });

        const fillCheckList = fillResponse.data.data.checkUnitList;
        isFillCorrect.value = fillCheckList.map(unit => unit.mark);
        correctFillAnswers.value = fillCheckList.map(unit => unit.answer);
      } catch (error) {
        console.error('无法提交填空题答案', error);
      }
    };

    // 初始化获取题目
    onMounted(() => {
      getQuizQuestions(); // 获取所有题目
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
      submitQuiz
    };
  }
};
</script>

<style scoped>
/* 基本容器样式 */
.quiz-container {
  width: 90%;
  max-width: 1000px;
  margin: 40px auto;
  padding: 40px;
  background: linear-gradient(135deg, #f8f9fa, #eceff1);
  border-radius: 15px;
  box-shadow: 0 8px 35px rgba(0, 0, 0, 0.15);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 标题样式 */
.quiz-title {
  font-size: 36px;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 20px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* 说明文字 */
.quiz-description {
  text-align: center;
  font-size: 18px;
  color: #34495e;
  margin-bottom: 30px;
}

/* 表单样式 */
.quiz-form {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* 题目卡片 */
.question-card {
  background-color: #ffffff;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 8px 35px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease-in-out;
}

.question-card:hover {
  transform: translateY(-5px);
}

/* 题目文本 */
.question-text {
  font-size: 24px;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 15px;
  line-height: 1.5;
}

/* 选项样式 */
.choice {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.option-input {
  margin-right: 12px;
  width: 24px;
  height: 24px;
  accent-color: #4CAF50;
}

.option-label {
  font-size: 18px;
  color: #34495e;
  transition: color 0.3s ease;
}

.choice:hover .option-label {
  color: #4CAF50;
}

/* 填空输入框 */
.answer-input {
  padding: 16px;
  font-size: 18px;
  border: 2px solid #ddd;
  border-radius: 10px;
  width: 100%;
  max-width: 500px;
  background-color: #fafafa;
  margin-top: 12px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.answer-input:focus {
  border-color: #4CAF50;
  background-color: #ffffff;
  outline: none;
  box-shadow: 0 0 8px rgba(76, 175, 80, 0.3);
}

/* 提交按钮样式 */
.submit-btn {
  padding: 18px 40px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.submit-btn:hover {
  background-color: #45a049;
}

.submit-btn:active {
  transform: scale(0.98);
}

/* 反馈样式 */
.feedback {
  margin-top: 20px;
  font-size: 18px;
  color: #34495e;
}

.answer-chosen {
  font-weight: 600;
}

.correct-answer {
  color: #e74c3c;
}

.explanation {
  font-size: 16px;
  color: #7f8c8d;
}

/* 响应式设计 */
@media (max-width: 600px) {
  .quiz-container {
    padding: 25px;
  }

  .question-text {
    font-size: 20px;
  }

  .submit-btn {
    font-size: 18px;
  }

  .answer-input {
    max-width: 100%;
  }
}
</style>
