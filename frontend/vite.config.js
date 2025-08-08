// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react-swc'

// // https://vite.dev/config/
// export default defineConfig({
//   server: {
//     proxy: {
//       '/api': 'http://127.0.0.1:8000',

//     }
//   }
// })



import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // 👈 change to the port you want
    proxy: {
      '/api': 'http://127.0.0.1:8000/',
    }
  }
})
