import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import process from 'node:process'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],// React, Tailwind 플러그인 적용
  base:'/',//배포하려는 서버 상황에 맞게 절대 경로로 설정(기본값:/)
  server:{
    host:'0.0.0.0',//모든 아이피 접속 허용
    port:9191,// 개발 서버 포트 설정 (기본값: 5173)
    open:false,
    proxy: {'/api': {target:process.env.AI_API_TARGET||'http://localhost:8080',changeOrigin:true,configure(proxy){proxy.on('proxyReq',req=>req.removeHeader('origin'))}}}
  },
  build:{
    outDir:'dist' // 빌드 결과물 폴더 지정(기본값:dist)
  }
})
