import axios from 'axios';

// Create a custom axios instance with default settings
const axiosClient = axios.create({
baseURL: 'http://localhost:8000', // adjust to your Django backend URL
withCredentials: true,         // send cookies on every request
xsrfCookieName: 'csrftoken',   // name of cookie to read CSRF token from
xsrfHeaderName: 'X-CSRFToken', // header to send CSRF token with
});

export default axiosClient;
