<template>
  <div>
    <div v-if="role === 'admin'">
      <!-- 管理员内容 -->
      <h2>管理员页面</h2>
      <p>这是管理员可以看到的内容。</p>
    </div>
    <div v-else-if="role === 'user'">
      <!-- 普通用户内容 -->
      <h2>用户页面</h2>
      <p>这是普通用户可以看到的内容。</p>
    </div>
    <div v-else-if="role === 'guest'">
      <!-- 游客内容 -->
      <h2>游客页面</h2>
      <p>这是游客可以看到的内容。</p>
    </div>
    <div v-else>
      <!-- 默认或无角色 -->
      <h2>无角色信息</h2>
      <p>没有角色信息，无法展示内容。</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      role: sessionStorage.getItem('role') || 'guest', // 默认值为 'guest'
    };
  },
};
</script>

<style scoped>
/* 可以根据不同角色做不同的样式调整 */
</style>
