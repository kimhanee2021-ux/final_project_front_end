import { startTransition, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth, authLink } from '@/features/auth'
import { useGameSense } from '@/shared/state'
import { GSIcon } from '@/shared/ui'
import { profileAvatars } from '@/features/player'
import SidebarSteamCard from '@/app/layout/SidebarSteamCard'
import SidebarMenuGroup from '@/app/layout/SidebarMenuGroup'
import { headerMenus } from '@/app/layout/headerMenus'

// gs-nav-link/active는 gamesense.css의 ".gs-nav-link.active > svg:has(path[d^='m3 10'])"
// (홈 아이콘만 채워 그리는 규칙)가 거는 훅이라 마커로 유지한다.
const navLinkBase =
  'gs-nav-link flex items-center gap-[16px] text-muted min-h-[46px] px-[14px] py-[11px] rounded-[12px] text-[13px] whitespace-nowrap transition-[background,color] duration-[180ms] hover:bg-surface-hover hover:text-text [&>svg]:shrink-0 min-[1600px]:text-[14px] max-[1350px]:gap-[13px] max-[1350px]:text-[12px] max-[850px]:min-h-[42px] max-[850px]:py-[9px]'
const navLinkActive = 'active bg-primary-soft text-primary-text font-[650]'
const navLinkClass = ({ isActive }) => [navLinkBase, isActive && navLinkActive].filter(Boolean).join(' ')

// 모바일 사이드바: 헤더바와 같은 메뉴 목록(headerMenus)을 묶음별로 보여준다.
export default function Sidebar({ onClose }) {
  const { isAuthenticated, signOut } = useAuth()
  const { wishlist, setQuery, player } = useGameSense()
  const location = useLocation()
  const navigate = useNavigate()
  const returnTo = location.pathname + location.search + location.hash
  // 지금 보고 있는 페이지가 속한 묶음은 처음부터 펼쳐 둔다.
  const [openId, setOpenId] = useState(
    () => headerMenus.find(menu => menu.children?.some(child => child.to === location.pathname))?.id ?? null
  )
  const follow = () => {
    setQuery('')
    onClose?.()
  }
  const logout = () =>
    startTransition(() => {
      // 세션 변경과 라우트 이동을 같은 전환 안에서 처리한다.
      signOut()
      follow()
      navigate('/', { replace: true })
    })
  const nav = links =>
    links.map(({ to, icon, label, description }) => (
      <NavLink key={to} to={to} end onClick={follow} className={navLinkClass}>
        <GSIcon name={icon} size={21} />
        <span className="min-w-0">
          {label}
          {description && <small className="block mt-[2px] text-[11px] font-[400] text-faint whitespace-normal">{description}</small>}
        </span>
        {isAuthenticated && to === '/wishlist' && wishlist.length > 0 && (
          <span className="ml-auto text-[10px] min-w-[21px] h-[21px] py-[2px] px-[6px] text-center rounded-[6px] bg-surface-soft text-muted">{wishlist.length}</span>
        )}
      </NavLink>
    ))
  const avatar = (profileAvatars.find(item => item.id === player.profile.avatar) || profileAvatars[0]).image

  return (
    <>
      <NavLink to="/library" end onClick={follow} className="flex items-center gap-[12px] m-[0_6px_30px] w-fit max-[1350px]:gap-[9px]">
        <span className="grid place-items-center w-[38px] h-[38px] rounded-[11px] bg-[linear-gradient(135deg,#9a82f8,#6246dd)] text-white shrink-0">
          <GSIcon name="gamepad" size={22} />
        </span>
        <strong className="text-[22px] tracking-[-0.6px] leading-[1.2] font-[720] max-[1350px]:text-[20px]">GameSense</strong>
      </NavLink>
      <div className="grid gap-[6px]">
        {headerMenus.map(menu =>
          menu.children ? (
            <SidebarMenuGroup
              key={menu.id}
              menu={menu}
              open={openId === menu.id}
              onToggle={() => setOpenId(openId === menu.id ? null : menu.id)}
              renderLinks={nav}
            />
          ) : (
            <nav key={menu.id} aria-label={menu.label} className="grid">
              {nav([menu])}
            </nav>
          )
        )}
      </div>
      <div className="mt-auto">
        <SidebarSteamCard />
        {isAuthenticated && (
          <NavLink
            to="/mypage"
            onClick={follow}
            className="mt-[14px] flex items-center gap-[11px] border-t border-border pt-[14px] hover:text-primary-text"
            aria-label="마이페이지 열기"
          >
            <span className="gs-avatar shrink-0">
              <img src={avatar} alt="" />
            </span>
            <strong className="block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-[600]">Hello, {player.profile.name}</strong>
            <GSIcon name="arrow" size={15} className="ml-auto text-muted shrink-0" />
          </NavLink>
        )}
        {isAuthenticated ? (
          <button type="button" className={`${navLinkBase} w-full mt-[6px]`} onClick={logout}>
            <GSIcon name="logout" size={21} />
            <span>로그아웃</span>
          </button>
        ) : (
          <nav className="mt-[14px] flex items-center gap-[8px]" aria-label="계정">
            <Link to={authLink('login', returnTo)} onClick={follow} className="flex-1 grid place-items-center min-h-[40px] rounded-full bg-gs-accent text-gs-on-accent text-[13px] font-[700] hover:brightness-110">로그인</Link>
            <Link to={authLink('signup', returnTo)} onClick={follow} className="flex-1 grid place-items-center min-h-[40px] rounded-full text-[13px] text-gs-muted hover:text-gs-mint">회원가입</Link>
          </nav>
        )}
      </div>
    </>
  )
}
