import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  // baseURL: 'http://localhost:8000', // Django backend URL
 // Django backend URL
  withCredentials: true,            // send cookies along with requests
  xsrfCookieName: 'csrftoken',      // cookie name Django sets by default
  xsrfHeaderName: 'X-CSRFToken',    // header axios sends with CSRF token
});

export default axiosClient;
