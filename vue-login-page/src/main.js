import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // Add this line for routing
import 'animate.css';

createApp(App).use(router).mount('#app'); // If using Vue Router
