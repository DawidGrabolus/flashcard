import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Dodaj to!

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), // I dodaj to tutaj!
  tailwindcss(), cloudflare()],
})