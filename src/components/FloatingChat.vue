<template>
  <div v-if="isVisible" class="floating-chat-container">
    <div class="chat-header">
      <h3>智能问答</h3>
      <button @click="toggleChat" class="close-btn">×</button>
    </div>
    <div class="chat-body">
      <div class="left-pane">
        <!-- 输出展示区域 -->
        <div class="messages">
          <div v-for="(msg, index) in messages" :key="index" class="message">
            <p>{{ msg }}</p>
          </div>
        </div>
        <!-- 自由问答输入框 -->
        <div class="chat-input-container">
          <input type="text" v-model="userInput" placeholder="请输入问题..." @keydown.enter="sendMessage" class="chat-input" />
        </div>
      </div>

      <div class="right-pane">
        <!-- 选择问题列表 -->
        <div v-if="isSelectingQuestion" class="question-list">
          <transition name="fade">
            <ul>
              <li v-for="(question, index) in questionList" :key="index" @click="selectQuestion(question)" class="question-item">
                <span class="question-icon">?</span>
                {{ question.value }}
              </li>
            </ul>
          </transition>
        </div>
        <!-- 提示语句 -->
        <div v-if="!isSelectingQuestion && !loading && questionList.length === 0" class="empty-message">
          <p>选择或输入你的问题。</p>
        </div>
      </div>
    </div>

    <!-- 显示加载状态 -->
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>正在加载...
    </div>
  </div>
  <button @click="toggleChat" class="floating-chat-btn">?</button>
</template>

<script>
import { ref, getCurrentInstance } from "vue";
import axios from "axios";

export default {
  name: "FloatingChat",
  setup() {
    const isVisible = ref(false); // 控制悬浮窗显示与隐藏
    const userInput = ref(""); // 用户输入的消息
    const messages = ref([]); // 聊天记录
    const loading = ref(false); // 加载状态
    const questionList = ref([]); // 问题列表
    const isSelectingQuestion = ref(false); // 是否正在选择指定问题
    const token = sessionStorage.getItem('token'); // 从 session 中获取 token
    const apiUrl = getCurrentInstance().appContext.config.globalProperties.$apiUrl;

    // 切换聊天窗口的显示和隐藏
    const toggleChat = () => {
      isVisible.value = !isVisible.value;
      if (isVisible.value) {
        fetchQuestionList(); // 打开时获取问题列表
      }
    };

    // 获取问题列表
    const fetchQuestionList = async () => {
      try {
        const headers = { 'token': token };
        const response = await axios.get(apiUrl + "/aiqa/knowledge/questionlist", { headers });
        if (response.data.code === 0) {
          questionList.value = response.data.data.questionList;
          isSelectingQuestion.value = true; // 显示问题列表
        }
      } catch (error) {
        console.error("获取问题列表失败", error);
      }
    };

    // 选择指定问题
    const selectQuestion = async (question) => {
      messages.value.push(`用户: ${question.value}`);
      loading.value = true;
      isSelectingQuestion.value = false; // 点击问题后隐藏问题列表

      try {
        const headers = { 'token': token };
        const response = await axios.post(apiUrl + "/aiqa/knowledge/specific_question", {
          key: question.key,
        }, { headers });
        if (response.data.code === 0) {
          messages.value.push(`AI: ${response.data.data.answer}`);
        }
      } catch (error) {
        console.error("请求指定问题答案失败", error);
      } finally {
        loading.value = false;
        // 在回答结束后，如果想继续选择问题，恢复问题列表显示
        fetchQuestionList();  // 重新加载问题列表
      }
    };

    // 发送自由问答
    const sendMessage = async () => {
      if (!userInput.value.trim()) return; // 如果输入为空则不发送
      messages.value.push(`用户: ${userInput.value}`);
      loading.value = true;

      try {
        const headers = { 'token': token };
        const response = await axios.post(apiUrl + "/aiqa/knowledge/free", {
          question: userInput.value,
        }, { headers });
        if (response.data.code === 0) {
          messages.value.push(`AI: ${response.data.data.answer}`);
        }
      } catch (error) {
        console.error("请求自由问答失败", error);
      } finally {
        loading.value = false;
        userInput.value = ""; // 清空输入框
        // 滚动到聊天框的底部
        const chatBody = document.querySelector(".chat-body");
        chatBody.scrollTop = chatBody.scrollHeight;
      }
    };

    return {
      isVisible,
      userInput,
      messages,
      loading,
      questionList,
      isSelectingQuestion,
      toggleChat,
      sendMessage,
      selectQuestion,
    };
  },
};
</script>

<style scoped>
.floating-chat-container {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 700px;
  background: linear-gradient(135deg, #4caf50, #81c784);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: row;
  padding: 15px;
  z-index: 1000;
  transition: transform 0.3s ease, opacity 0.3s ease;
  max-height: 500px;
}

.chat-header {
  background-color: rgba(0, 0, 0, 0.1);
  color: white;
  padding: 10px;
  border-radius: 15px 15px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
}

.chat-header h3 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 22px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: #e74c3c;
}

.chat-body {
  display: flex;
  flex-grow: 1;
  margin-top: 10px;
}

.left-pane {
  flex: 2;
  display: flex;
  flex-direction: column;
  margin-right: 10px;
}

.right-pane {
  flex: 1;
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.messages {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 10px;
}

.message {
  margin-bottom: 15px;
  font-size: 14px;
  color: #2c3e50;
  padding: 8px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  transition: background-color 0.3s ease;
}

.message:nth-child(odd) {
  background-color: #f0f0f0;
}

.chat-input-container {
  display: flex;
  justify-content: center;
}

.chat-input {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border-radius: 10px;
  border: 1px solid #ddd;
  margin-top: 10px;
  outline: none;
  transition: border-color 0.3s ease;
}

.chat-input:focus {
  border-color: #4caf50;
}

.loading {
  text-align: center;
  font-size: 22px;
  color: #4caf50;
}

.loading-spinner {
  margin: 0 auto;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #4caf50;
  border-radius: 50%;
  width: 30px;
  height: 30px;
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

.floating-chat-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  font-size: 32px;
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  transition: transform 0.3s ease;
}

.floating-chat-btn:hover {
  background-color: #45a049;
  transform: scale(1.1);
}

.question-list {
  max-height: 300px;
  overflow-y: auto;
  margin-top: 10px;
  padding: 5px 0;
  list-style-type: none;
}

.question-item {
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color 0.3s ease;
}

.question-item:hover {
  background-color: #d4e157;
}

.question-icon {
  margin-right: 10px;
  font-size: 18px;
  color: #4caf50;
}

.empty-message {
  text-align: center;
  font-size: 16px;
  color: #888;
}

@media (max-width: 900px) {
  .floating-chat-container {
    width: 100%;
    bottom: 20px;
    right: 20px;
  }

  .floating-chat-btn {
    width: 50px;
    height: 50px;
    font-size: 26px;
  }

  .chat-header h3 {
    font-size: 16px;
  }

  .message {
    font-size: 12px;
  }

  .chat-input {
    font-size: 14px;
    padding: 10px;
  }

  .left-pane {
    flex: 1;
  }

  .right-pane {
    display: none;
  }
}
</style>
