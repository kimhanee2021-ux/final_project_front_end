import { startTransition } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth, authLink } from '@/features/auth'
import { useGameSense } from '@/shared/state'
import { GSIcon } from '@/shared/ui'
import { profileAvatars } from '@/features/player'
import HeaderNav from '@/app/layout/HeaderNav'
import SettingsMenu from '@/app/layout/SettingsMenu'
import SearchBox from '@/app/layout/SearchBox'

const iconButton =
  'relative w-[38px] h-[38px] grid place-items-center bg-transparent text-gs-muted rounded-full p-0 hover:bg-gs-hover hover:text-gs-mint'

// 상단 고정 헤더바: 로고 · 메인 메뉴 · 검색 · 알림/테마 · 사용자 영역.
export default function Header({ onMenu }) {
  const { isAuthenticated, signOut } = useAuth()
  const location = useLocation()
  const returnTo = location.pathname + location.search + location.hash
  const { setQuery, player } = useGameSense()
  const navigate = useNavigate()
  const avatar = (profileAvatars.find(item => item.id === player.profile.avatar) || profileAvatars[0]).image

  return (
    <header className="sticky top-0 z-[30] bg-gs-panel shadow-[var(--gs-shadow)]">
      <div className="flex items-center gap-[20px] h-[68px] max-w-[1280px] mx-auto px-[24px] max-[600px]:px-[16px] max-[600px]:gap-[10px]">
        <button className={`${iconButton} min-[901px]:hidden`} onClick={onMenu} aria-label="메뉴 열기">
          <GSIcon name="menu" />
        </button>
        <Link to="/library" className="flex items-center gap-[10px] shrink-0" onClick={() => setQuery('')}>
          <span className="grid place-items-center w-[34px] h-[34px] rounded-[10px] bg-[linear-gradient(135deg,#7B61FF,#5E3FE8)] text-white">
            <GSIcon name="gamepad" size={20} />
          </span>
          <strong className="text-[20px] tracking-[-0.6px] font-[720] max-[600px]:hidden">GameSense</strong>
        </Link>
        <HeaderNav onNavigate={() => setQuery('')} />
        <SearchBox />
        <div className="flex items-center gap-[6px] shrink-0">
          <SettingsMenu />
        </div>
        {isAuthenticated ? (
          <div className="flex items-center gap-[4px] shrink-0">
            <NavLink
              to="/mypage"
              className="flex items-center gap-[10px] h-[40px] pl-[4px] pr-[14px] rounded-full hover:bg-gs-hover max-[600px]:pr-[4px]"
              aria-label="마이페이지 열기"
              onClick={() => setQuery('')}
            >
              <span className="gs-avatar block !w-[32px] !h-[32px]">
                <img src={avatar} alt="" />
              </span>
              <span className="text-[13px] font-[600] max-[1100px]:hidden">마이페이지</span>
            </NavLink>
            <button
              type="button"
              className={`${iconButton} max-[600px]:hidden`}
              aria-label="로그아웃"
              title="로그아웃"
              onClick={() =>
                startTransition(() => {
                  // 세션 변경과 라우트 이동을 같은 전환 안에서 처리한다.
                  signOut()
                  setQuery('')
                  navigate('/', { replace: true })
                })
              }
            >
              <GSIcon name="logout" size={19} />
            </button>
          </div>
        ) : (
          <nav className="flex items-center gap-[8px] shrink-0" aria-label="계정">
            <Link to={authLink('signup', returnTo)} className="text-[13px] text-gs-muted whitespace-nowrap px-[10px] hover:text-gs-mint max-[600px]:hidden">회원가입</Link>
            <Link to={authLink('login', returnTo)} className="inline-flex items-center min-h-[38px] px-[18px] rounded-full bg-gs-accent text-gs-on-accent text-[13px] font-[700] whitespace-nowrap hover:brightness-110">로그인</Link>
          </nav>
        )}
      </div>
    </header>
  )
}
