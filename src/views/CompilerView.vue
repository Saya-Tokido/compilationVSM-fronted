<template>
  <div>
    <h1>{{ problem.title }}</h1>
    <p>{{ problem.description }}</p>

    <textarea v-model="code" rows="10" cols="50" placeholder="输入 C/C++ 程序代码..."></textarea><br />
    <button @click="compileCode">编译</button>

    <!-- 编译结果 -->
    <div v-if="output">
      <h3>编译结果：</h3>
      <pre>{{ output }}</pre>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';

export default {
  name: 'CompilerView',
  setup() {
    const code = ref('');
    const output = ref('');
    const problem = ref({});
    const route = useRoute();
    const problemId = route.params.problemId;

    // 获取题目详细信息
    const fetchProblemDetails = async () => {
      try {
        const response = await axios.get(`/api/problem/${problemId}`);
        problem.value = response.data.problem; // 假设返回格式包含问题详细信息
      } catch (error) {
        console.error('获取题目详细信息失败', error);
      }
    };

    // 编译代码并提交判题
    const compileCode = async () => {
      try {
        const response = await axios.post('/api/compile', {
          code: code.value,
          problemId: problemId
        });
        output.value = response.data.result; // 假设返回格式包含编译结果
      } catch (error) {
        console.error('编译代码失败', error);
        output.value = '编译失败，请检查代码！';
      }
    };

    onMounted(fetchProblemDetails);

    return {
      code,
      output,
      problem,
      compileCode
    };
  }
};
</script>

<style scoped>
textarea {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
}
button {
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
}
</style>
