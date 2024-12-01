import { createRouter, createWebHistory } from 'vue-router';
import LoginView from './views/LoginView.vue';
import ExperimentIntroView from './views/ExperimentIntroView.vue';
import QuizView from './views/QuizView.vue';
// import CompilerView from './views/CompilerView.vue';
import ProblemList from './views/ProblemList.vue';

const routes = [
  {
    path: '/',
    component: ExperimentIntroView,
    name: 'ExperimentIntroView'
  },
  {
    path: '/login',
    component: LoginView,
    name: 'LoginView'

  },
  {
    path: '/experiment',
    component: ExperimentIntroView,
    name: 'ExperimentIntroView'

  },
  {
    path: '/quiz',
    component: QuizView,
    name: 'QuizView'
  },
  {
    path: '/problems',
    name: 'problems',
    component: ProblemList
  }
  // {
  //   path: '/compiler/:problemId',
  //   name: 'compilerView',
  //   component: CompilerView
  // }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 导航守卫：检查登录状态
router.beforeEach((to, from, next) => {
  const token = sessionStorage.getItem('token') // 获取 sessionStorage 中的 token

  // 如果没有 token 且尝试访问受保护页面，重定向到登录页面
  if (to.name !== 'LoginView' && !token) {
    next({ name: 'LoginView' })
  } else {
    next() // 继续访问目标页面
  }
})

export default router;
