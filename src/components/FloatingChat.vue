<template>
    <div v-if="isVisible" class="floating-chat-container">
      <div class="chat-header">
        <h3>智能问答</h3>
        <button @click="toggleChat" class="close-btn">×</button>
      </div>
      <div class="chat-body">
        <div class="messages">
          <div v-for="(msg, index) in messages" :key="index" class="message">
            <p>{{ msg }}</p>
          </div>
        </div>
        <input
          type="text"
          v-model="userInput"
          placeholder="请输入问题..."
          @keydown.enter="sendMessage"
          class="chat-input"
        />
      </div>
      <div v-if="loading" class="loading">...</div>
    </div>
    <button @click="toggleChat" class="floating-chat-btn">?</button>
  </template>
  
  <script>
  import { ref } from "vue";
  
  export default {
    name: "FloatingChat",
    setup() {
      const isVisible = ref(false); // 控制悬浮窗显示与隐藏
      const userInput = ref(""); // 用户输入的消息
      const messages = ref([]); // 聊天记录
      const loading = ref(false); // 加载状态
  
      // 切换聊天窗口的显示和隐藏
      const toggleChat = () => {
        isVisible.value = !isVisible.value;
      };
  
      // 模拟发送消息和获取智能回答
      const sendMessage = async () => {
        if (!userInput.value.trim()) return; // 如果输入为空则不发送
        messages.value.push(`用户: ${userInput.value}`);
        loading.value = true;
  
        // 模拟向后端发送请求，获取智能回答
        setTimeout(() => {
          messages.value.push(`AI: ${generateAnswer(userInput.value)}`);
          loading.value = false;
          userInput.value = ""; // 清空输入框
          // 滚动到聊天框的底部
          const chatBody = document.querySelector(".chat-body");
          chatBody.scrollTop = chatBody.scrollHeight;
        }, 1000); // 模拟延迟
      };
  
      // 模拟生成一个智能回答（可以替换为后端请求）
      const generateAnswer = (input) => {
        return `这是对 "${input}" 的回答。`; // 模拟的回答
      };
  
      return {
        isVisible,
        userInput,
        messages,
        loading,
        toggleChat,
        sendMessage,
      };
    },
  };
  </script>
  
  <style scoped>
  .floating-chat-container {
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 350px;
    background: linear-gradient(135deg, #4caf50, #81c784);
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    padding: 15px;
    z-index: 1000;
    transition: transform 0.3s ease, opacity 0.3s ease;
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
    flex-grow: 1;
    overflow-y: auto;
    margin: 15px 0;
    padding-right: 10px;
  }
  
  .messages {
    max-height: 250px;
    overflow-y: auto;
  }
  
  .message {
    margin-bottom: 15px;
    font-size: 14px;
    color: #2c3e50;
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
  
  .floating-chat-container {
    transform: translateY(0);
    opacity: 1;
  }
  
  .floating-chat-container.hide {
    transform: translateY(100%);
    opacity: 0;
  }
  
  /* 消息区背景 */
  .messages {
    background: rgba(255, 255, 255, 0.7);
    padding: 10px;
    border-radius: 10px;
  }
  
  .message:nth-child(odd) {
    background-color: #f0f0f0;
    border-radius: 10px 10px 0 10px;
    padding: 10px;
  }
  
  .message:nth-child(even) {
    background-color: #e8f5e9;
    border-radius: 10px 10px 10px 0;
    padding: 10px;
  }
  
  /* 响应式设计 */
  @media (max-width: 600px) {
    .floating-chat-container {
      width: 90%;
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
  }
  </style>
  