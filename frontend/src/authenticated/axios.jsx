import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000', // Your Django backend
  withCredentials: true,            // VERY IMPORTANT: allows cookies to be sent
});

export default axiosInstance;
