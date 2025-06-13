import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './index.css'
import App from './App.jsx'
import { validateConfig, debugConfig } from './config/environment.js'

// Validate environment configuration
try {
  validateConfig();
  debugConfig();
} catch (error) {
  console.error('❌ Configuration Error:', error.message);
  // In production, you might want to show a user-friendly error page
  if (import.meta.env.PROD) {
    document.body.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column; font-family: Arial, sans-serif;">
        <h1 style="color: #dc3545;">Configuration Error</h1>
        <p>The application is not properly configured. Please contact support.</p>
      </div>
    `;
    throw error;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
