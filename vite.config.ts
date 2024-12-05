import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';


// https://vitejs.dev/config/
export default defineConfig(({ command, mode /*, isSsrBuild, isPreview*/ }) => {
  console.log(`command: ${command}, mode: ${mode}`);
  const useHttps = command !== 'build';
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@src': path.resolve(__dirname, './src'),
        '@amplify': path.resolve(__dirname, './amplify'),
        '@root': path.resolve(__dirname)
      },
    },
    server: {
      https: useHttps ? {
        key: fs.readFileSync(path.resolve(__dirname, './.cert/key.pem')),
        cert: fs.readFileSync(path.resolve(__dirname, './.cert/cert.pem'))
      } : undefined,
      port: 5173,
      host: '0.0.0.0'
    }
  }
})
