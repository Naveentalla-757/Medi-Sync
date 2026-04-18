import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle 401s (optional but good practice)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional: Handle unauthorized globally (e.g. logout)
      // localStorage.removeItem('user');
      // window.location = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
