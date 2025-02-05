import { createRouter, createWebHistory } from 'vue-router';
import LoginView from './views/LoginView.vue';
import ExperimentIntroView from './views/student/ExperimentIntroView.vue';
import QuizView from './views/student/QuizView.vue';
import MethodCompilerView from './views/MethodCompilerView.vue';
import LexerCompilerView from './views/student/LexerCompilerView.vue';
import ProblemList from './views/ProblemList.vue';
import AccountManagement from './views/admin/AccountManagement.vue';
import StudentManagement from './views/teacher/StudentManagement.vue';
import ObjReview from './views/teacher/ObjReview.vue';
import LexerReview from './views/teacher/LexerReview.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    meta: { requiresAuth: true },
    redirect: () => {
      const role = sessionStorage.getItem('role');
      // 在这里返回对应的重定向路由名称
      if (role === '1') {
        return { name: 'ExperimentIntroView' };
      } else if (role === '2') {
        return { name: 'StudentManagement' };
      } else if (role === '3') {
        return { name: 'AccountManagement' };
      } else {
        return { name: 'LoginView' };  // 未登录或无角色，跳转登录页
      }
    }
  },
  {
    path: '/login',
    component: LoginView,
    name: 'LoginView'
  },
  {
    path: '/student/experiment',
    component: ExperimentIntroView,
    name: 'ExperimentIntroView',
    meta: { requiresAuth: true, role: '1' }

  },
  {
    path: '/student/quiz',
    component: QuizView,
    name: 'QuizView',
    meta: { requiresAuth: true, role: '1' }
  },
  {
    path: '/problems',
    name: 'problems',
    component: ProblemList,
    meta: { requiresAuth: true, role: '1' }
  },
  {
    path: '/method_compiler/:problemId',
    name: 'MethodCompilerView',
    component: MethodCompilerView,
    meta: { requiresAuth: true, role: '1' }
  },
  {
    path: '/student/lexer-compiler',
    name: 'LexerCompilerView',
    component: LexerCompilerView,
    meta: { requiresAuth: true, role: '1' }
  },
  {
    path: '/teacher/student-management',
    name: 'StudentManagement',
    component: StudentManagement,
    meta: { requiresAuth: true, role: '2' }
  },
  {
    path: '/teacher/obj-review',
    name: 'ObjReview',
    component: ObjReview,
    meta: { requiresAuth: true, role: '2' }
  },
  {
    path: '/teacher/lexer-review',
    name: 'LexerReview',
    component: LexerReview,
    meta: { requiresAuth: true, role: '2' }
  },
  {
    path: '/admin/account-management',
    name: 'AccountManagement',
    component: AccountManagement,
    meta: { requiresAuth: true, role: '3' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 导航守卫：检查登录状态
router.beforeEach((to, from, next) => {
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('role');

  // 如果目标页面需要认证且没有登录
  if (to.meta.requiresAuth && !token) {
    alert('您需要登录才能访问该页面。');  // 提示用户未登录
    return next({ name: 'LoginView' }); // 重定向到登录页
  }

  // 如果目标页面要求特定角色（例如管理员），且用户没有该角色
  if (to.meta.role && to.meta.role !== role) {
    alert('您的角色权限不足，请联系管理员。');  // 提示用户角色不匹配
    return next({ name: 'LoginView' }); // 如果角色不匹配，重定向到登录页
  }

  // 如果用户已经登录且访问的是公开页面，允许访问
  next();
});



export default router;
