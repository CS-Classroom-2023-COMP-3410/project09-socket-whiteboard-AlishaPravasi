import { defineConfig } from 'vite';

export default defineConfig({
  root: '.', // Ensure Vite serves from the project root
  publicDir: 'public', // Explicitly define public assets
  server: {
    port: 5173,
    proxy: {
      "/socket.io": {
        target: "http://localhost:3000",
        ws: true, // Enable WebSocket proxying
        changeOrigin: true
      }
    }
  }
});
