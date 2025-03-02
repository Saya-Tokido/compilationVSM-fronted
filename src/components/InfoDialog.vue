<template>
  <div v-if="visible" class="success-dialog-overlay">
    <div class="success-dialog">
      <div class="success-dialog-header">
        <span class="success-dialog-title">Success</span>
        <button class="close-btn" @click="closeDialog">✖️</button>
      </div>
      <div class="success-dialog-body">
        <div class="success-icon">✔️</div>
        <p>{{ message }}</p>
      </div>
      <div class="success-dialog-footer">
        <button @click="closeDialog" class="action-btn">Close</button>
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

    return {
      visible,
      message,
      showDialog,
      closeDialog,
    };
  },
};
</script>

<style scoped>
.success-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.success-dialog {
  background: linear-gradient(145deg, #1e1e2f, #2a2a40); /* Gradient background */
  border-radius: 16px;
  width: 90%;
  max-width: 420px;
  padding: 24px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
  color: #fff;
  text-align: center;
  animation: scaleUp 0.4s ease-out;
  border: 1px solid rgba(255, 255, 255, 0.1); /* Subtle border */
}

@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes scaleUp {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.success-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.success-dialog-title {
  font-size: 24px;
  color: #4caf50; /* Green color for success */
  font-weight: 700;
  font-family: 'Roboto', sans-serif;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); /* Text shadow */
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #4caf50;
  transition: color 0.2s, transform 0.2s;
}

.close-btn:hover {
  color: #f44336; /* Red on hover */
  transform: rotate(90deg); /* Rotate on hover */
}

.success-dialog-body {
  margin-bottom: 24px;
  font-size: 16px;
  font-family: 'Roboto', sans-serif;
  color: #ccc;
}

.success-icon {
  font-size: 48px;
  color: #4caf50;
  margin-bottom: 16px;
  animation: bounce 0.6s ease-out;
}

@keyframes bounce {
  0% { transform: scale(0.5); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

.action-btn {
  padding: 14px 28px;
  margin: 8px;
  background-color: #4caf50; /* Green background for success */
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-family: 'Roboto', sans-serif;
  transition: background-color 0.3s, transform 0.3s, box-shadow 0.3s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.action-btn:hover {
  background-color: #388e3c; /* Darker green when hovered */
  transform: translateY(-2px); /* Slight lift on hover */
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
}

.action-btn:active {
  transform: translateY(0);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.action-btn:focus {
  outline: none;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.6);
}
</style>