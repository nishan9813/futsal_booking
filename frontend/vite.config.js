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
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(),
        tailwindcss(),

  ],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://127.0.0.1:8000/',
    }
  }
})

