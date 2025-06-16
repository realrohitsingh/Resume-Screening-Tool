import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Using Vite's default port
    strictPort: false, // Allow switching ports if 5173 is taken
    host: true, // Listen on all network interfaces
    open: true, // Open browser on server start
  },
  logLevel: 'info', // Show more detailed logs
  customLogger: {
    info: (msg) => {
      // Ensure server URL is always logged clearly
      if (msg.includes('Local:') || msg.includes('Network:')) {
        console.log('\x1b[36m%s\x1b[0m', msg); // Cyan color for visibility
      } else {
        console.log(msg);
      }
    },
    warn: (msg) => console.warn(msg),
    error: (msg) => console.error(msg),
  }
});
