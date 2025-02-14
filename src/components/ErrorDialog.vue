<template>
  <div v-if="visible" class="error-dialog-overlay">
    <div class="error-dialog">
      <div class="error-dialog-header">
        <span class="error-dialog-title">Error Occurred</span>
        <button class="close-btn" @click="closeDialog">✖️</button>
      </div>
      <div class="error-dialog-body">
        <p>{{ message }}</p>
      </div>
      <div class="error-dialog-footer">
        <button @click="retry" class="retry-btn">Retry</button>
        <button @click="closeDialog" class="close-btn">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const visible = ref(false);
    const message = ref('');

    const showDialog = (msg) => {
      message.value = msg;
      visible.value = true;
    };

    const closeDialog = () => {
      visible.value = false;
    };

    const retry = () => {
      console.log("Retry action triggered");
      closeDialog();
    };

    return {
      visible,
      message,
      showDialog,
      closeDialog,
      retry,
    };
  },
};
</script>

<style scoped>
.error-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7); /* Darker, semi-transparent overlay */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.error-dialog {
  background: #1e1e2f; /* Dark background */
  border-radius: 8px;
  width: 90%;
  max-width: 420px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  color: #fff;
  text-align: center;
  animation: scaleUp 0.4s ease-out;
}

@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes scaleUp {
  0% { transform: scale(0.8); }
  100% { transform: scale(1); }
}

.error-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.error-dialog-title {
  font-size: 24px;
  color: #00bcd4; /* Electric cyan color */
  font-weight: 700;
  font-family: 'Roboto', sans-serif;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #00bcd4;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #f44336; /* Red on hover */
}

.error-dialog-body {
  margin-bottom: 20px;
  font-size: 16px;
  font-family: 'Roboto', sans-serif;
  color: #ccc;
}

.retry-btn,
.close-btn {
  padding: 14px 28px;
  margin: 8px;
  background-color: #00bcd4; /* Electric cyan background */
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-family: 'Roboto', sans-serif;
  transition: background-color 0.3s, transform 0.3s;
}

.retry-btn:hover,
.close-btn:hover {
  background-color: #f44336; /* Red when hovered */
  transform: scale(1.05); /* Slightly zoom in on hover */
}

.retry-btn:focus,
.close-btn:focus {
  outline: none;
  box-shadow: 0 0 10px rgba(0, 188, 212, 0.6);
}
</style>
