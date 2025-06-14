import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    
    // Define global constants
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
    },
    
    // Resolve configuration
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@pages': resolve(__dirname, 'src/pages'),
        '@services': resolve(__dirname, 'src/services'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@config': resolve(__dirname, 'src/config'),
      },
    },
    
    // Optimize dependencies
    optimizeDeps: {
      include: [
        'react', 
        'react-dom', 
        'react-router-dom', 
        'axios', 
        'bootstrap',
        'bootstrap-icons',
        'date-fns'
      ],
    },
    
    // CSS configuration
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "bootstrap/scss/bootstrap";`,
        },
      },
    },
    
    // Build configuration
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      minify: mode === 'production' ? 'esbuild' : false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['bootstrap'],
            utils: ['axios', 'date-fns'],
          },
        },
      },
      // Optimize for deployment
      target: 'es2015',
      chunkSizeWarningLimit: 1000,
      assetsDir: 'assets',
    },
    
    // Server configuration
    server: {
      port: 3000,
      host: true, // Allow external connections
      cors: true,
    },
    
    // Preview configuration (for production preview)
    preview: {
      port: process.env.PORT || 4173,
      host: '0.0.0.0', // Required for Render deployment
      cors: true,
    },
    
    // Environment variables
    envPrefix: 'VITE_',
  }
})
