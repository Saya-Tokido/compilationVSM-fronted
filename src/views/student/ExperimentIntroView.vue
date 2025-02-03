<template>
  <div class="intro-container">
    <h1 class="page-title">编译原理实验系统</h1>
    <p class="course-description">
      本实验系统旨在帮助学生深入理解编译器的工作原理及各个阶段的运作。通过实践，你将掌握从词法分析、语法分析到代码生成等重要编译过程的基本概念和实现方法。
    </p>

    <div class="features">
      <div class="feature-card">
        <h3>课程内容</h3>
        <p>编译原理课程涵盖了编译器的各个阶段，从词法分析到代码生成，重点讲解了以下内容：</p>
        <ul>
          <li>编译器概述：编译过程、各个阶段的介绍。</li>
          <li>词法分析：词法单元的识别和正则表达式的使用。</li>
          <li>语法分析：上下文无关文法和语法分析方法。</li>
          <li>语义分析：类型检查、符号表和作用域管理。</li>
          <li>优化：常见优化技术，如死代码消除和常量折叠。</li>
          <li>代码生成：中间代码到机器代码的转换。</li>
        </ul>
      </div>

      <div class="feature-card">
        <h3>实验内容</h3>
        <p>实验项目包括：</p>
        <ul>
          <li>填空实验：帮助学生理解编译器各阶段的核心概念。</li>
          <li>词法分析器实现：设计一个词法分析器，识别不同的词法单元。</li>
          <li>语法分析器实现：构建一个语法分析器，生成语法树。</li>
          <li>语义分析和符号表：进行类型检查和符号表管理。</li>
          <li>代码优化：进行常见的代码优化，提升程序性能。</li>
          <li>代码生成：实现一个代码生成器，将中间代码转为目标代码。</li>
          <li>项目实验：设计一个完整的编译器，涵盖所有编译阶段。</li>
        </ul>
      </div>
    </div>

    <div class="start-experiment">
      <router-link to="/student/quiz" class="start-btn">开始选择填空实验</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExperimentIntroView'
};
</script>

<style scoped>
/* 页面整体布局 */
.intro-container {
  width: 80%;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  background-color: #f9f9f9;
  border-radius: 10px;
}

/* 页面标题样式 */
.page-title {
  text-align: center;
  font-size: 36px;
  color: #2c3e50;
  margin-bottom: 20px;
}

/* 课程描述文本 */
.course-description {
  text-align: center;
  font-size: 18px;
  color: #34495e;
  margin-bottom: 40px;
}

/* 卡片布局 */
.features {
  display: flex;
  justify-content: space-between;
  gap: 30px;
  margin-bottom: 40px;
}

/* 每个功能卡片 */
.feature-card {
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  width: 48%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.feature-card h3 {
  font-size: 24px;
  color: #2c3e50;
  margin-bottom: 15px;
}

.feature-card p, .feature-card ul {
  font-size: 16px;
  color: #7f8c8d;
}

.feature-card ul {
  margin-top: 10px;
}

/* 开始实验按钮 */
.start-experiment {
  text-align: center;
}

.start-btn {
  display: inline-block;
  padding: 12px 30px;
  background-color: #3498db;
  color: white;
  font-size: 18px;
  border-radius: 25px;
  text-decoration: none;
  transition: background-color 0.3s ease;
}

.start-btn:hover {
  background-color: #2980b9;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .features {
    flex-direction: column;
    align-items: center;
  }

  .feature-card {
    width: 100%;
    margin-bottom: 20px;
  }
}
</style>
