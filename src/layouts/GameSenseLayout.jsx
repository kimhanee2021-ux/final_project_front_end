import { startTransition, useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/context/AuthContext'
import { authLink } from '../features/auth/authSession'
import { useGameSense } from '../contexts/GameSenseContext'
import { useTheme } from '../hooks/useTheme'
import GSIcon from '../components/common/GSIcon'
import GameDialog from '../features/games/components/GameDialog'
import Sidebar from './Sidebar'
import { profileAvatars } from '../features/player/mocks/playerMock'
import '../styles/gamesense.css'

function Header({ onMenu }) {
  const { isSignedIn, isAuthenticated, user, signOut } = useAuth()
  const location = useLocation()
  const returnTo = location.pathname + location.search + location.hash
  const { query, setQuery, t, language, changeLanguage, player } = useGameSense()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [popover, setPopover] = useState(null)
  const [read, setRead] = useState(false)
  const popoverRef = useRef(null)
  useEffect(() => {
    if (!popover) return
    const dismiss = event => {
      if (
        event.type === 'keydown'
          ? event.key === 'Escape'
          : !popoverRef.current?.contains(event.target)
      )
        setPopover(null)
    }
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('keydown', dismiss)
    return () => {
      document.removeEventListener('pointerdown', dismiss)
      document.removeEventListener('keydown', dismiss)
    }
  }, [popover])
  const toggle = value => setPopover(popover === value ? null : value)
  return (
    <header className="flex items-center justify-between gap-[28px] relative z-[20] h-[78px] min-[1600px]:h-[76px] max-[900px]:gap-[13px] max-[900px]:h-[74px] max-[600px]:h-[69px] max-[600px]:gap-[8px]">
      <button
        className="hidden max-[900px]:grid max-[900px]:shrink-0 w-[37px] h-[37px] place-items-center bg-transparent text-gs-text rounded-full p-0 hover:bg-gs-raised max-[600px]:w-[32px] max-[600px]:h-[32px]"
        onClick={onMenu}
        aria-label="메뉴 열기"
      >
        <GSIcon name="menu" />
      </button>
      <form
        role="search"
        className="gs-search flex items-center gap-[12px] bg-gs-search border border-[#64758a40] rounded-[30px] w-[min(48%,540px)] h-[40px] px-[15px] text-gs-muted focus-within:border-gs-mint focus-within:shadow-[0_0_0_3px_#35edbe0c] max-[1120px]:w-1/2 max-[900px]:flex-1 max-[900px]:w-auto max-[600px]:h-[37px] max-[600px]:gap-[8px] max-[600px]:px-[11px]"
        onSubmit={event => {
          event.preventDefault()
          navigate('/explore')
        }}
      >
        <GSIcon name="search" size={20} className="text-gs-text shrink-0 max-[600px]:w-[17px]" />
        <input
          className="min-w-0 w-full bg-transparent border-0 outline-none text-gs-text text-[12px] py-[6px] placeholder:text-gs-muted max-[600px]:text-[11px]"
          aria-label="게임 검색"
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder={t('Search games, genres, or anything...', '게임, 장르를 검색해 보세요...')}
        />
        {query ? (
          <button className="p-0 grid place-items-center bg-transparent text-gs-muted" type="button" aria-label="검색어 지우기" onClick={() => setQuery('')}>
            <GSIcon name="close" size={17} />
          </button>
        ) : (
          <kbd className="border border-[#68788855] rounded-[4px] w-[18px] text-[10px] font-[inherit] text-center opacity-[.65] max-[600px]:hidden">/</kbd>
        )}
      </form>
      <div className="flex items-center gap-[21px] max-[1350px]:gap-[13px] max-[900px]:gap-[12px] max-[600px]:gap-[5px]" ref={popoverRef}>
        <div className="flex h-[37px] border border-gs-border rounded-[24px] p-[3px] max-[600px]:hidden" role="group" aria-label="화면 테마">
          <button
            className={`grid place-items-center w-[36px] rounded-[24px] bg-transparent text-gs-muted hover:bg-gs-hover ${theme === 'light' ? 'bg-gs-raised shadow-[0_1px_5px_#0002] text-gs-text' : ''}`}
            onClick={() => setTheme('light')}
            aria-label="라이트 모드"
            aria-pressed={theme === 'light'}
          >
            <GSIcon name="sun" size={20} />
          </button>
          <button
            className={`grid place-items-center w-[36px] rounded-[24px] bg-transparent text-[#f0c97c] hover:bg-gs-hover ${theme === 'dark' ? 'bg-gs-raised shadow-[0_1px_5px_#0002]' : ''}`}
            onClick={() => setTheme('dark')}
            aria-label="다크 모드"
            aria-pressed={theme === 'dark'}
          >
            <GSIcon name="moon" size={19} />
          </button>
        </div>
        <div className="relative max-[900px]:hidden">
          <button
            className="flex gap-[8px] items-center h-[37px] px-[11px] border border-gs-border bg-transparent rounded-[25px] text-[12px]"
            aria-label="메뉴 언어 선택"
            aria-expanded={popover === 'language'}
            onClick={() => toggle('language')}
          >
            <GSIcon name="globe" size={20} />
            <span>{language === 'en' ? 'EN' : 'KO'}</span>
            <GSIcon name="chevron" size={15} />
          </button>
          {popover === 'language' && (
            <div className="absolute right-0 top-[calc(100%+15px)] bg-gs-panel border border-gs-border rounded-[13px] shadow-[var(--gs-shadow)] min-w-[150px] p-[10px] z-[45]">
              <p className="text-gs-muted p-[4px_9px_9px] text-[10px]">메뉴 언어</p>
              {[
                ['en', 'English'],
                ['ko', '한국어'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  className="w-full flex items-center justify-between p-[9px] bg-transparent rounded-[6px] text-[12px] hover:bg-gs-raised"
                  onClick={() => {
                    changeLanguage(value)
                    setPopover(null)
                  }}
                >
                  {label}
                  {language === value && <GSIcon name="check" size={16} />}
                </button>
              ))}
            </div>
          )}
        </div>
        {isSignedIn && <div className="relative">
          <button
            className="relative w-[37px] h-[37px] grid place-items-center bg-transparent text-gs-text rounded-full p-0 hover:bg-gs-raised max-[600px]:w-[30px]"
            aria-label="알림"
            aria-expanded={popover === 'notifications'}
            onClick={() => toggle('notifications')}
          >
            <GSIcon name="bell" />
            {!read && <span className="absolute top-[6px] right-[8px] w-[7px] h-[7px] bg-[#ff636f] border-[1.5px] border-gs-bg rounded-full" />}
          </button>
          {popover === 'notifications' && (
            <div className="absolute right-0 top-[calc(100%+15px)] bg-gs-panel border border-gs-border rounded-[13px] shadow-[var(--gs-shadow)] min-w-[150px] p-[10px] z-[45] w-[320px] p-[19px] max-[600px]:right-[-38px] max-[600px]:w-[min(320px,calc(100vw-32px))]">
              <div className="flex justify-between items-center">
                <strong>알림</strong>
                <button className="bg-transparent text-gs-mint text-[11px]" onClick={() => setRead(true)}>{read ? '모두 읽음' : '모두 읽기'}</button>
              </div>
              <div className={`flex gap-[12px] p-[20px_0] ${read ? 'opacity-60' : ''}`}>
                <GSIcon name="spark" className="text-[#b087fb] shrink-0" />
                <div>
                  <strong className="text-[12px]">취향에 맞는 게임이 도착했어요</strong>
                  <p className="text-gs-muted text-[11px] m-[5px_0_8px]">새로운 추천 게임을 만나보세요.</p>
                  <Link
                    className="text-gs-mint text-[11px]"
                    to="/recommendations"
                    onClick={() => {
                      setPopover(null)
                      setRead(true)
                    }}
                  >
                    추천 확인하기 <span>→</span>
                  </Link>
                </div>
              </div>
              <small className="text-[9px] text-gs-muted">데모 알림 · 실제 계정 알림이 아닙니다</small>
            </div>
          )}
        </div>}
        {isSignedIn ? <div className="flex items-center gap-[15px] shrink-0 max-[1120px]:gap-[9px] max-[600px]:gap-[4px]"><NavLink
          to="/mypage"
          className="flex items-center gap-[11px] border border-gs-border rounded-[28px] py-[5px] pr-[12px] pl-[5px] hover:border-[#34c7ae66] hover:bg-[#36d8b807] max-[900px]:py-[3px] max-[900px]:pr-[8px] max-[900px]:pl-[3px] max-[480px]:border-0 max-[480px]:p-0 [&>svg]:ml-[5px] max-[1120px]:[&>svg]:hidden"
          aria-label="마이페이지 열기"
          onClick={() => {
            setPopover(null)
            setQuery('')
          }}
        >
          <span className="gs-avatar border-[#3feac28a]!">
            <img
              src={(profileAvatars.find(item => item.id === player.profile.avatar) || profileAvatars[0]).image}
              alt=""
            />
          </span>
          <span className="flex flex-col gap-[3px] min-w-[87px] max-[1120px]:hidden">
            <strong className="block max-w-[130px] overflow-hidden whitespace-nowrap text-ellipsis font-[550] text-[12px]">Hello, {player.profile.name}</strong>
            <small className="text-[10px] text-gs-muted">{isAuthenticated ? user.email : '데모 체험 중'}</small>
          </span>
          <GSIcon name="chevron" size={17} />
        </NavLink>
        <button
          type="button"
          className="grid place-items-center w-[36px] h-[36px] rounded-[8px] bg-transparent text-gs-muted hover:bg-gs-raised hover:text-gs-mint max-[600px]:w-[30px]"
          aria-label="로그아웃"
          title="로그아웃"
          onClick={() => startTransition(() => {
            // Keep session and route changes in the same navigation transition.
            signOut()
            setPopover(null)
            setQuery('')
            navigate('/', { replace: true })
          })}
        >
          <GSIcon name="logout" size={19} />
        </button>
        </div> : <nav className="flex items-center gap-[15px] shrink-0 max-[1120px]:gap-[9px] max-[600px]:gap-[10px]" aria-label="계정">
          <Link to={authLink('signup', returnTo)} className="text-[12px] text-gs-muted whitespace-nowrap py-[10px] hover:text-gs-mint max-[600px]:text-[11px] max-[360px]:hidden">회원가입</Link>
          <Link to={authLink('login', returnTo)} className="inline-flex items-center justify-center gap-[8px] min-h-[38px] px-[19px] bg-gs-accent text-[#062c23] rounded-[9px] text-[12px] font-[750] whitespace-nowrap hover:bg-[#69f5d0] max-[600px]:min-h-[36px] max-[600px]:px-[12px]">로그인<GSIcon name="arrow" size={16} className="max-[600px]:hidden" /></Link>
        </nav>}
      </div>
    </header>
  )
}

function Shell() {
  const mobileMenu = useRef(null)
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  const { toast, setToast, notify } = useGameSense()
  // 스팀 연동 콜백이 끝나면 백엔드가 프론트 루트로 ?steamLinked=true를 붙여 돌려보낸다.
  useEffect(() => {
    if (new URLSearchParams(search).get('steamLinked') !== 'true') return
    notify('스팀 계정을 연동했어요. 보유 게임을 불러올게요.')
    navigate('/library', { replace: true })
  }, [search]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])
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
        document.querySelector('.gs-search input')?.focus()
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
    <div className="gs-shell text-gs-text min-h-screen bg-[radial-gradient(ellipse_at_80%_5%,#7fa4b405,transparent_55%),var(--gs-bg)]">
      <a className="fixed left-[16px] top-[-80px] z-[100] p-[12px] bg-surface focus:top-[10px]" href="#main-content">
        본문으로 이동
      </a>
      <aside className="fixed inset-y-0 left-0 z-[25] w-[244px] flex flex-col p-[25px_16px_17px] border-r border-gs-border bg-gs-bg overflow-y-auto [scrollbar-width:thin] min-[1600px]:w-[256px] min-[1600px]:pt-[25px] max-[1350px]:w-[212px] max-[1350px]:px-[12px] max-[1120px]:w-[200px] max-[900px]:hidden max-[850px]:pt-[21px]">
        <Sidebar />
      </aside>
      <dialog
        ref={mobileMenu}
        className="gs-mobile-drawer m-0 p-0 border-0 bg-gs-bg text-gs-text w-[280px] max-w-[85vw] h-[100dvh] max-h-[100dvh] border-r border-gs-border"
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
      <div className="ml-[244px] px-[24px] min-w-0 min-[1600px]:ml-[256px] min-[1600px]:px-[27px] max-[1350px]:ml-[212px] max-[1350px]:px-[20px] max-[1120px]:ml-[200px] max-[900px]:ml-0 max-[900px]:px-[22px] max-[600px]:px-[16px] max-[360px]:px-[12px]">
        <Header onMenu={() => mobileMenu.current.showModal()} />
        <main id="main-content" className="max-w-[1760px] mx-auto p-0">
          <Outlet />
        </main>
        <footer className="flex justify-between items-center gap-[15px] max-w-[1760px] mx-auto mt-[20px] p-[15px_0_19px] text-gs-muted text-[8px] max-[600px]:mt-[16px] max-[600px]:p-[15px_0_23px]">
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
          <div className="flex items-center gap-[12px] p-[14px_18px] border border-[#35edbe70] bg-gs-panel shadow-[var(--gs-shadow)] rounded-[12px] text-[12px] animate-[gs-appear_.2s_ease] pointer-events-auto max-[600px]:text-[11px] max-[600px]:p-[12px_14px]" key={toast.id}>
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

export default function GameSenseLayout() {
  return <Shell />
}
