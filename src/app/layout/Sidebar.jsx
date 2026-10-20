import { NavLink } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { useGameSense } from '@/shared/state'
import { GSIcon } from '@/shared/ui'
import { profileAvatars } from '@/features/player'
import SidebarSteamCard from '@/app/layout/SidebarSteamCard'

// 목표 UI의 핵심 메뉴 5개, 그리고 기존에 있던 나머지 메뉴(PC 성능 체크·커뮤니티·위시리스트·설정)를 아래 묶음에 둔다.
const primaryLinks = [
  ['/library', 'library', 'My Library', '내 라이브러리'],
  ['/analysis', 'chart', 'Analysis', '분석'],
  ['/explore', 'compass', 'Explore', '게임 탐색'],
  ['/recommendations', 'spark', 'AI Optimization', '맞춤 추천'],
]
const moreLinks = [
  ['/pc-check', 'monitor', 'PC 사양', 'PC 사양'],
  ['/pc-check/evaluation', 'chart', 'PC 종합평가', 'PC 종합평가'],
  ['/pc-check/diagnosis', 'monitor', 'PC 성능 진단', 'PC 성능 진단'],
  ['/hangul-blocks', 'gamepad', '손풀기게임', '손풀기게임'],
  ['/community', 'users', 'Community', '커뮤니티'],
  ['/wishlist', 'heart', 'Wishlist', '위시리스트'],
  ['/settings', 'settings', 'Settings', '설정'],
]

// gs-nav-link/active는 gamesense.css의 ".gs-nav-link.active > svg:has(path[d^='m3 10'])"
// (홈 아이콘만 채워 그리는 규칙)가 거는 훅이라 마커로 유지한다.
const navLinkBase =
  'gs-nav-link flex items-center gap-[16px] text-muted min-h-[46px] px-[14px] py-[11px] rounded-[12px] text-[13px] whitespace-nowrap transition-[background,color] duration-[180ms] hover:bg-surface-hover hover:text-text [&>svg]:shrink-0 min-[1600px]:text-[14px] max-[1350px]:gap-[13px] max-[1350px]:text-[12px] max-[850px]:min-h-[42px] max-[850px]:py-[9px]'
const navLinkActive = 'active bg-primary-soft text-primary-text font-[650]'
const navLinkClass = ({ isActive }) => [navLinkBase, isActive && navLinkActive].filter(Boolean).join(' ')

export default function Sidebar({ onClose }) {
  const { isSignedIn } = useAuth()
  const { t, wishlist, setQuery, player } = useGameSense()
  const follow = () => {
    setQuery('')
    onClose?.()
  }
  const nav = links =>
    links.map(([to, icon, en, ko]) => (
      <NavLink key={to} to={to} end onClick={follow} className={navLinkClass}>
        <GSIcon name={icon} size={21} />
        <span>{t(en, ko)}</span>
        {isSignedIn && to === '/wishlist' && wishlist.length > 0 && (
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
      <nav aria-label="주 메뉴" className="flex flex-col gap-[5px] max-[850px]:gap-[2px]">
        {nav(primaryLinks)}
      </nav>
      <div className="border-t border-border mt-[20px] pt-[16px] max-[850px]:mt-[14px] max-[850px]:pt-[12px]">
        <p className="text-muted text-[11px] tracking-[0.9px] m-[0_0_10px_14px]">{t('MORE', '더보기')}</p>
        <nav aria-label="더보기 메뉴" className="grid gap-[4px]">{nav(moreLinks)}</nav>
      </div>
      <div className="mt-auto">
        <SidebarSteamCard />
        {isSignedIn && (
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
      </div>
    </>
  )
}
