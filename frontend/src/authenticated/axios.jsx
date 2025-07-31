import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000', // Your Django backend
  withCredentials: true,            // VERY IMPORTANT: allows cookies to be sent
});

export default axiosInstance;
