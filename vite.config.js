import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 백엔드(스프링) 주소. 기본값은 application.yaml의 server.port(8080)
  const backendUrl = loadEnv(mode, process.cwd(), '').VITE_BACKEND_URL || 'http://localhost:8080'
  return {
  plugins: [react(), tailwindcss()],// React, Tailwind 플러그인 적용
  base:'/',//배포하려는 서버 상황에 맞게 절대 경로로 설정(기본값:/)
  server:{
    host:'0.0.0.0',//모든 아이피 접속 허용
    port:9191,// 개발 서버 포트 설정 (기본값: 5173)
    open:true,// 개발 서버 실행 시 자동으로 브라우저 열기(기본값:false)
    // /api 요청을 백엔드로 넘긴다. 브라우저 입장에서는 같은 출처라 CORS 설정과 무관하게 동작한다.
    proxy:{
      '/api':{
        target:backendUrl,
        // Origin 헤더가 남아 있으면 스프링이 CORS 요청으로 보고 허용 목록(기본 5173)과 대조해 403을 낸다
        configure:proxy=>proxy.on('proxyReq',proxyReq=>proxyReq.removeHeader('origin')),
      },
    },
  },
  build:{
    outDir:'dist' // 빌드 결과물 폴더 지정(기본값:dist)
  }
  }
})
