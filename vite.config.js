import path from 'node:path'
import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 백엔드(스프링) 주소. 기본값은 application.yaml의 server.port(8080)
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = process.env.AI_API_TARGET || env.AI_API_TARGET || env.VITE_BACKEND_URL || 'http://localhost:8080'
  // FastAPI 추천 서버 주소(final_project_fast_api). 기본값은 uvicorn 기본 포트(8000). RECOMMEND_API_TARGET도 같은 뜻으로 받는다.
  const recommendUrl =
    process.env.AI_RECOMMEND_TARGET || env.AI_RECOMMEND_TARGET ||
    process.env.RECOMMEND_API_TARGET || env.RECOMMEND_API_TARGET ||
    'http://localhost:8000'
  return {
  plugins: [react(), tailwindcss()],// React, Tailwind 플러그인 적용
  // '@/...' 는 src 폴더를 가리킨다 (예: '@/features/auth'). 폴더를 옮겨도 import 경로가 길어지지 않는다.
  resolve:{alias:{'@':path.resolve(process.cwd(),'src')}},
  base:'/',//배포하려는 서버 상황에 맞게 절대 경로로 설정(기본값:/)
  server:{
    host:'0.0.0.0',//모든 아이피 접속 허용
    port:9191,// 개발 서버 포트 설정 (기본값: 5173)
    open:false,
    // /api 요청을 백엔드로 넘긴다. 브라우저 입장에서는 같은 출처라 CORS 설정과 무관하게 동작한다.
    proxy:{
      // /recommend-api/... -> FastAPI 추천 서버의 /... (스프링 /api와 서버가 달라 경로로 구분한다). 라이브러리 추천 미리보기·/ai-recommends가 쓴다.
      '/recommend-api':{
        target:recommendUrl,
        rewrite:path=>path.replace(/^\/recommend-api/,''),
        configure:proxy=>proxy.on('proxyReq',proxyReq=>proxyReq.removeHeader('origin')),
      },
      // 게임 추천(/api/v1)을 그대로 FastAPI로 보낸다. /recommendations 페이지가 쓴다. 객체 순서대로 먼저 맞는 규칙이 쓰이므로 /api보다 앞에 둬야 한다.
      '/api/v1':{
        target:recommendUrl,
        configure:proxy=>proxy.on('proxyReq',proxyReq=>proxyReq.removeHeader('origin')),
      },
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
