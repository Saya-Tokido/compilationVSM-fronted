<template>
    <div>
      <h2>选择题目</h2>
      <ul>
        <li v-for="problem in problems" :key="problem.id">
          <router-link :to="{ name: 'compiler', params: { problemId: problem.id } }">{{ problem.title }}</router-link>
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  
  export default {
    name: 'ProblemList',
    setup() {
      const problems = ref([]);
  
      // 获取题目列表
      const fetchProblems = async () => {
        try {
          const response = await axios.get('/api/problems');
          problems.value = response.data.problems; // 假设返回格式包含题目列表
        } catch (error) {
          console.error('获取题目列表失败', error);
        }
      };
  
      onMounted(fetchProblems);
  
      return {
        problems
      };
    }
  };
  </script>
  