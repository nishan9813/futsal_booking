// import axios from 'axios';

// const axiosClient = axios.create({
//   baseURL: 'http://127.0.0.1:8000',
// });

// axiosClient.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('access_token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// axiosClient.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (
//       error.response &&
//       error.response.status === 401 &&
//       !originalRequest._retry
//     ) {
//       originalRequest._retry = true;
//       const refreshToken = localStorage.getItem('refresh_token');

//       if (refreshToken) {
//         try {
//           const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
//             refresh: refreshToken,
//           });

//           const newAccessToken = response.data.access;
//           localStorage.setItem('access_token', newAccessToken);

//           originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
//           return axiosClient(originalRequest);
//         } catch (refreshError) {
//           localStorage.clear();
//           window.location.href = '/login';
//           return Promise.reject(refreshError);
//         }
//       } else {
//         localStorage.clear();
//         window.location.href = '/login';
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default axiosClient;


import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refresh_token");

      if (refreshToken) {
        try {
          const response = await axios.post(
            "http://127.0.0.1:8000/api/token/refresh/",
            { refresh: refreshToken }
          );

          const newAccessToken = response.data.access;
          localStorage.setItem("access_token", newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosClient(originalRequest);
        } catch (refreshError) {
          localStorage.clear();

          // Only redirect if the request is NOT to a public endpoint
          if (!originalRequest.url.includes("/current_user/")) {
            window.location.href = "/login";
          }
          return Promise.reject(refreshError);
        }
      } else {
        localStorage.clear();
        if (!originalRequest.url.includes("/current_user/")) {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
