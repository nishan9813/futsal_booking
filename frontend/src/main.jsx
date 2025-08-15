
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Create a custom theme (optional)
// const theme = createTheme({
//   palette: {
//     primary: {
//       main: '#1976d2',  // Customize your primary color
//     },
//     secondary: {
//       main: '#ac3b61',
//     },
//   },
// });

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <App />
  </StrictMode>
);

