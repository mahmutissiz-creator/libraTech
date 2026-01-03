import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Dosya yollarını relative (göreceli) yapar, böylece GitHub Pages'de 404 hatası almazsınız.
});