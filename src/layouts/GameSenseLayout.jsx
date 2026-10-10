import { startTransition, useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { authLink } from '../features/auth/authSession'
import { useGameSense } from '../contexts/GameSenseContext'
import { useTheme } from '../hooks/useTheme'
import GSIcon from '../components/discover/GSIcon'
import GameDialog from '../components/discover/GameDialog'
import Sidebar from './Sidebar'
import { profileAvatars } from '../mocks/playerMock'
import '../styles/gamesense.css'
import '../styles/auth.css'

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
    <header className="gs-header">
      <button className="gs-icon-button gs-mobile-menu" onClick={onMenu} aria-label="메뉴 열기">
        <GSIcon name="menu" />
      </button>
      <form
        role="search"
        className="gs-search"
        onSubmit={event => {
          event.preventDefault()
          navigate('/explore')
        }}
      >
        <GSIcon name="search" size={20} />
        <input
          aria-label="게임 검색"
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder={t('Search games, genres, or anything...', '게임, 장르를 검색해 보세요...')}
        />
        {query ? (
          <button type="button" aria-label="검색어 지우기" onClick={() => setQuery('')}>
            <GSIcon name="close" size={17} />
          </button>
        ) : (
          <kbd>/</kbd>
        )}
      </form>
      <div className="gs-header-actions" ref={popoverRef}>
        <div className="gs-theme-switch" role="group" aria-label="화면 테마">
          <button
            onClick={() => setTheme('light')}
            aria-label="라이트 모드"
            aria-pressed={theme === 'light'}
            className={theme === 'light' ? 'active' : ''}
          >
            <GSIcon name="sun" size={20} />
          </button>
          <button
            onClick={() => setTheme('dark')}
            aria-label="다크 모드"
            aria-pressed={theme === 'dark'}
            className={theme === 'dark' ? 'active' : ''}
          >
            <GSIcon name="moon" size={19} />
          </button>
        </div>
        <div className="gs-popover-wrap gs-language-wrap">
          <button
            className="gs-language"
            aria-label="메뉴 언어 선택"
            aria-expanded={popover === 'language'}
            onClick={() => toggle('language')}
          >
            <GSIcon name="globe" size={20} />
            <span>{language === 'en' ? 'EN' : 'KO'}</span>
            <GSIcon name="chevron" size={15} />
          </button>
          {popover === 'language' && (
            <div className="gs-popover gs-language-menu">
              <p>메뉴 언어</p>
              {[
                ['en', 'English'],
                ['ko', '한국어'],
              ].map(([value, label]) => (
                <button
                  key={value}
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
        {isSignedIn && <div className="gs-popover-wrap">
          <button
            className="gs-icon-button gs-notification-button"
            aria-label="알림"
            aria-expanded={popover === 'notifications'}
            onClick={() => toggle('notifications')}
          >
            <GSIcon name="bell" />
            {!read && <span className="gs-notification-dot" />}
          </button>
          {popover === 'notifications' && (
            <div className="gs-popover gs-notifications">
              <div className="gs-popover-heading">
                <strong>알림</strong>
                <button onClick={() => setRead(true)}>{read ? '모두 읽음' : '모두 읽기'}</button>
              </div>
              <div className={read ? 'gs-notice-item is-read' : 'gs-notice-item'}>
                <GSIcon name="spark" />
                <div>
                  <strong>취향에 맞는 게임이 도착했어요</strong>
                  <p>새로운 추천 게임을 만나보세요.</p>
                  <Link
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
              <small>데모 알림 · 실제 계정 알림이 아닙니다</small>
            </div>
          )}
        </div>}
        {isSignedIn ? <div className="gs-account-session"><NavLink
          to="/mypage"
          className="gs-profile gs-profile-link"
          aria-label="마이페이지 열기"
          onClick={() => {
            setPopover(null)
            setQuery('')
          }}
        >
          <span className="gs-avatar">
            <img
              src={(profileAvatars.find(item => item.id === player.profile.avatar) || profileAvatars[0]).image}
              alt=""
            />
          </span>
          <span className="gs-profile-label">
            <strong>Hello, {player.profile.name}</strong>
            <small>{isAuthenticated ? user.email : '데모 체험 중'}</small>
          </span>
          <GSIcon name="chevron" size={17} />
        </NavLink>
        <button
          type="button"
          className="gs-account-logout"
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
        </div> : <nav className="gs-account-entry" aria-label="계정">
          <Link to={authLink('signup', returnTo)} className="gs-account-signup">회원가입</Link>
          <Link to={authLink('login', returnTo)} className="gs-account-login">로그인<GSIcon name="arrow" size={16} /></Link>
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
    <div className="gs-shell">
      <a className="skip-link" href="#main-content">
        본문으로 이동
      </a>
      <aside className="gs-sidebar">
        <Sidebar />
      </aside>
      <dialog
        ref={mobileMenu}
        className="gs-mobile-drawer"
        aria-label="메인 메뉴"
        onClick={event => {
          if (event.target === event.currentTarget) mobileMenu.current.close()
        }}
      >
        <div className="gs-drawer-content">
          <button
            className="gs-drawer-close gs-icon-button"
            onClick={() => mobileMenu.current.close()}
            aria-label="메뉴 닫기"
          >
            <GSIcon name="close" size={19} />
          </button>
          <Sidebar onClose={() => mobileMenu.current.close()} />
        </div>
      </dialog>
      <div className="gs-workspace">
        <Header onMenu={() => mobileMenu.current.showModal()} />
        <main id="main-content" className="gs-main">
          <Outlet />
        </main>
        <footer className="gs-footer">
          <span>
            <i />
            {pathname === '/ai-games' ? <>AI GAME ASSISTANT <span className="gs-footer-separator">/</span> 게임 정보와 Gemini 답변으로 상담합니다.</> : <>DEMO EXPERIENCE <span className="gs-footer-separator">/</span> 모든 플레이 기록과 추천은 더미 데이터입니다.</>}
          </span>
          <span>Made for the way you play.</span>
        </footer>
      </div>
      <GameDialog />
      <div className="gs-toast-region" role="status" aria-live="polite">
        {toast && (
          <div className="gs-toast" key={toast.id}>
            <GSIcon name="check" size={18} />
            {toast.message}
            <button aria-label="알림 닫기" onClick={() => setToast(null)}>
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
