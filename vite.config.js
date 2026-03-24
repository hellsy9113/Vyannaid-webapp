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
        // Handle all backend routes — but bypass for navigation requests (HTML)
        // so React Router handle deep links/refreshes.
        '/api':       { target: apiTarget, changeOrigin: true },
        '/auth':      { target: apiTarget, changeOrigin: true, bypass: (req) => req.headers.accept?.includes('html') ? '/index.html' : null },
        '/dashboard': { target: apiTarget, changeOrigin: true, bypass: (req) => req.headers.accept?.includes('html') ? '/index.html' : null },
        '/admin':     { target: apiTarget, changeOrigin: true, bypass: (req) => req.headers.accept?.includes('html') ? '/index.html' : null },
        '/counsellor':{ target: apiTarget, changeOrigin: true, bypass: (req) => req.headers.accept?.includes('html') ? '/index.html' : null },
        '/profile':   { target: apiTarget, changeOrigin: true, bypass: (req) => req.headers.accept?.includes('html') ? '/index.html' : null },
        '/messages':  { target: apiTarget, changeOrigin: true, bypass: (req) => req.headers.accept?.includes('html') ? '/index.html' : null },
        '/socket.io': {
          target: apiTarget,
          ws: true,
          changeOrigin: true,
        },
      },

    },
  };
})
