import { useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useGameSense } from '@/shared/state'
import { GSIcon } from '@/shared/ui'
import { GameDialog } from '@/features/games'
import { MySpendingProvider } from '@/features/spending'
import Header from '@/app/layout/Header'
import Sidebar from '@/app/layout/Sidebar'
import '@/shared/styles/gamesense.css'

function Shell() {
  const mobileMenu = useRef(null)
  const { pathname, search, hash } = useLocation()
  const navigate = useNavigate()
  const { toast, setToast, notify } = useGameSense()
  // 스팀 연동 콜백이 끝나면 백엔드가 프론트 루트로 ?steamLinked=true를 붙여 돌려보낸다.
  useEffect(() => {
    if (new URLSearchParams(search).get('steamLinked') !== 'true') return
    notify('스팀 계정을 연동했어요. 보유 게임을 불러올게요.')
    navigate('/library', { replace: true })
  }, [search]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    // #앵커가 있으면 그 위치로, 없으면 맨 위로 이동한다.
    const target = hash && document.getElementById(hash.slice(1))
    if (target) target.scrollIntoView()
    else window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])
  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(null), 3200)
    return () => window.clearTimeout(timeout)
  }, [toast, setToast])
  useEffect(() => {
    const keyboardSearch = event => {
      if (
        event.key === '/' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) &&
        !document.querySelector('dialog[open]')
      ) {
        event.preventDefault()
        document.querySelector('.gs-search-trigger')?.click()
      }
    }
    const media = window.matchMedia('(min-width: 901px)')
    const closeDrawer = () => {
      if (media.matches) mobileMenu.current?.close()
    }
    document.addEventListener('keydown', keyboardSearch)
    media.addEventListener('change', closeDrawer)
    return () => {
      document.removeEventListener('keydown', keyboardSearch)
      media.removeEventListener('change', closeDrawer)
    }
  }, [])
  return (
    // gs-shell 클래스는 이제 레이아웃을 담당하지 않지만, gamesense.css의 전역 리셋
    // (button transition, focus-visible 색상, prefers-reduced-motion, body:has() 배경)이
    // 이 클래스를 훅으로 쓰고 있어서 마커로 남겨둔다.
    <div className="gs-shell text-gs-text min-h-screen bg-gs-bg">
      <a className="fixed left-[16px] top-[-80px] z-[100] p-[12px] bg-surface focus:top-[10px]" href="#main-content">
        본문으로 이동
      </a>
      <dialog
        ref={mobileMenu}
        className="gs-mobile-drawer m-0 p-0 border-0 bg-gs-panel text-gs-text w-[280px] max-w-[85vw] h-[100dvh] max-h-[100dvh] border-r border-gs-border"
        aria-label="메인 메뉴"
        onClick={event => {
          if (event.target === event.currentTarget) mobileMenu.current.close()
        }}
      >
        <div className="relative p-[26px_16px_17px] min-h-full flex flex-col">
          <button
            className="absolute top-[5px] right-[4px] w-[29px] h-[29px] grid place-items-center bg-transparent text-gs-text rounded-full hover:bg-gs-raised"
            onClick={() => mobileMenu.current.close()}
            aria-label="메뉴 닫기"
          >
            <GSIcon name="close" size={19} />
          </button>
          <Sidebar onClose={() => mobileMenu.current.close()} />
        </div>
      </dialog>
      <div className="min-w-0">
        <Header onMenu={() => mobileMenu.current.showModal()} />
        {/* 각 페이지가 Panel(패널 박스)로 내용을 나열한다. 레이아웃은 헤더와 푸터만 맡는다. */}
        <main id="main-content">
          <Outlet />
        </main>
        <footer className="flex justify-between items-center gap-[15px] max-w-[1100px] mx-auto px-[24px] py-[24px] max-[600px]:px-[16px] text-gs-muted text-[12px]">
          <span className="flex items-center gap-[7px] max-[600px]:block max-[600px]:leading-[1.9]">
            <i className="w-[4px] h-[4px] rounded-full bg-gs-mint max-[600px]:inline-block max-[600px]:mr-[5px] max-[600px]:mb-[2px]" />
            DEMO EXPERIENCE <span className="p-[0_3px] opacity-40">/</span> 모든 플레이 기록과 추천은
            더미 데이터입니다.
          </span>
          <span className="tracking-[1px] max-[900px]:hidden">Made for the way you play.</span>
        </footer>
      </div>
      <GameDialog />
      <div className="fixed bottom-[25px] left-1/2 -translate-x-1/2 z-[100] max-w-[calc(100vw-32px)] w-max pointer-events-none max-[600px]:bottom-[17px]" role="status" aria-live="polite">
        {toast && (
          <div className="flex items-center gap-[12px] p-[14px_18px] border border-gs-accent bg-gs-panel shadow-[var(--gs-shadow)] rounded-[12px] text-[12px] animate-[gs-appear_.2s_ease] pointer-events-auto max-[600px]:text-[11px] max-[600px]:p-[12px_14px]" key={toast.id}>
            <GSIcon name="check" size={18} className="text-gs-mint shrink-0" />
            {toast.message}
            <button className="ml-[6px] flex bg-transparent p-0 text-gs-muted" aria-label="알림 닫기" onClick={() => setToast(null)}>
              <GSIcon name="close" size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// 홈·상단 스팀 상태·사이드바 스팀 카드·분석 화면이 소비 데이터를 한 번만 받아 같이 쓰도록
// 레이아웃 전체를 MySpendingProvider로 감싼다.
export default function GameSenseLayout() {
  return (
    <MySpendingProvider>
      <Shell />
    </MySpendingProvider>
  )
}
