import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_URL || 'http://localhost:3000';

  return {
    plugins: [react()],
    server: {
      allowedHosts: true, // Thoroughly allow all tunnels (ngrok, etc.)
      host: true, // Expose to LAN (needed for testing from a second machine)
      headers: {
        'ngrok-skip-browser-warning': 'true', // Skip ngrok interstitial page
      },
      proxy: {
        // Handle all backend routes - keep focused on API and Auth
        '/api': { target: apiTarget, changeOrigin: true },
        '/auth': { target: apiTarget, changeOrigin: true },
        '/socket.io': {
          target: apiTarget,
          ws: true,
          changeOrigin: true,
        },
      },
    },
  };
})
