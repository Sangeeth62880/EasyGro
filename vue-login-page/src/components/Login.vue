<template>
  <div class="login-container">
    <div class="login-card animate__animated animate__fadeIn">
      <h1 class="title">Login</h1>
      <form @submit.prevent="login">
        <div class="input-group">
          <label for="username">Username</label>
          <input
            type="text"
            v-model="username"
            id="username"
            placeholder="Enter your username"
            required
          />
        </div>

        <div class="input-group">
          <label for="password">Password</label>
          <input
            type="password"
            v-model="password"
            id="password"
            placeholder="Enter your password"
            required
          />
        </div>

        <button type="submit" class="login-btn">Login</button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: "",
      password: "",
    };
  },
  methods: {
    login() {
      // Simple login logic (this can be connected to an API later)
      if (this.username && this.password) {
        alert(`Welcome, ${this.username}!`);
      } else {
        alert("Please fill in both fields.");
      } 
    },
  },
};
</script>

<style scoped>
/* Add a colorful background and center the form */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f8ff; /* Soft light blue background */
}

.login-card {
  background-color: #ffffff;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
  animation: fadeIn 2s ease-out;
}

.title {
  color: #4b9cd3;
  font-size: 36px;
  margin-bottom: 20px;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  font-size: 14px;
  color: #333;
  display: block;
  margin-bottom: 8px;
}

.input-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.input-group input:focus {
  border-color: #4b9cd3;
  box-shadow: 0 0 8px rgba(75, 156, 211, 0.5);
}

.login-btn {
  background-color: #4b9cd3;
  color: white;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.3s ease;
}

.login-btn:hover {
  background-color: #357ab7;33
}
</style>
