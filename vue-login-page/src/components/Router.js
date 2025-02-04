import { createRouter, createWebHistory } from 'vue-router';
import Login from './components/Login.vue'; // Import Login.vue component

const routes = [
  { path: '/', component: Login }, // Set the default route to login
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
