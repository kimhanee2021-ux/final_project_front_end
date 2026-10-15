import { NavLink } from 'react-router-dom'
import { useAuth } from '../features/auth/context/AuthContext'
import { useGameSense } from '../contexts/GameSenseContext'
import GSIcon from '../components/common/GSIcon'

const primaryLinks = [
  ['/', 'home', 'Home', '홈'],
  ['/explore', 'compass', 'Explore', '탐색'],
  ['/trending', 'flame', 'Trending', '트렌드'],
  ['/analysis', 'chart', 'Expenditure Pattern', '소비 패턴'],
  ['/recommendations', 'spark', 'AI Optimization', '맞춤 추천'],
  ['/pc-check', 'monitor', 'PC 성능 체크', 'PC 성능 체크'],
  ['/community', 'users', 'Community', '커뮤니티'],
]
const libraryLinks = [
  ['/library', 'gamepad', 'My Games', '내 게임'],
  ['/wishlist', 'heart', 'Wishlist', '위시리스트'],
]

// gs-nav-link/active는 클래스 이름 자체는 더 이상 스타일을 안 담당하지만,
// gamesense.css에 남겨둔 ".gs-nav-link.active > svg:has(path[d^='m3 10'])"
// (홈 아이콘만 fill로 채우는 규칙)가 거는 훅이라 마커로 유지한다.
const navLinkBase =
  'gs-nav-link relative flex items-center gap-[19px] text-gs-muted min-h-[47px] p-[12px_13px] rounded-[9px] text-[13px] whitespace-nowrap transition-[background,color] duration-[180ms] hover:bg-gs-raised hover:text-gs-text [&>svg]:shrink-0 [&>svg]:text-gs-text min-[1600px]:min-h-[48px] min-[1600px]:text-[14px] max-[1350px]:gap-[14px] max-[1350px]:text-[12px] max-[850px]:min-h-[42px] max-[850px]:py-[9px]'
const navLinkActive =
  "active before:content-[''] before:absolute before:left-[-16px] before:top-0 before:bottom-0 before:w-[4px] before:bg-gs-accent before:rounded-[0_5px_5px_0] before:shadow-[0_0_14px_#35edbe33] max-[1350px]:before:left-[-12px] max-[900px]:before:left-[-16px] bg-[linear-gradient(95deg,var(--gs-active),#1b91801a)] text-gs-mint font-[650] [&>svg]:text-gs-mint"
const navLinkClass = extra => ({ isActive }) =>
  [navLinkBase, isActive && navLinkActive, extra].filter(Boolean).join(' ')

export default function Sidebar({ onClose }) {
  const { isSignedIn } = useAuth()
  const { t, wishlist, setQuery } = useGameSense()
  const follow = () => {
    setQuery('')
    onClose?.()
  }
  const nav = links =>
    links.map(([to, icon, en, ko]) => (
      <NavLink key={to} to={to} end onClick={follow} className={navLinkClass()}>
        <GSIcon name={icon} size={22} />
        <span>{t(en, ko)}</span>
        {isSignedIn && to === '/wishlist' && wishlist.length > 0 && (
          <span className="ml-auto text-[10px] min-w-[21px] h-[21px] py-[2px] px-[6px] text-center rounded-[5px] bg-gs-raised">{wishlist.length}</span>
        )}
      </NavLink>
    ))
  return (
    <>
      <NavLink to="/" end onClick={follow} className="flex items-center gap-[13px] m-[0_5px_32px] w-fit [&>svg]:text-gs-accent [&>svg]:shrink-0 max-[1350px]:gap-[9px]">
        <GSIcon name="gamepad" size={43} />
        <span className="flex flex-col">
          <strong className="text-[25px] tracking-[-0.8px] leading-[1.2] font-[720] max-[1350px]:text-[22px]">GameSense</strong>
          <small className="text-[13px] text-gs-muted mt-[2px] tracking-[0.1px]">Play Smarter</small>
        </span>
      </NavLink>
      <nav aria-label="주 메뉴" className="flex flex-col gap-[5px] max-[850px]:gap-[2px]">
        {nav(primaryLinks)}
      </nav>
      <div className="border-t border-gs-border m-[31px_8px_0] pt-[18px] min-[1600px]:mt-[38px] max-[850px]:mt-[22px] max-[850px]:pt-[16px]">
        <p className="text-gs-muted text-[11px] tracking-[0.9px] m-[0_0_13px_2px] max-[850px]:mb-[8px]">{t('MY LIBRARY', '나의 라이브러리')}</p>
        <nav aria-label="라이브러리" className="m-[0_-8px] grid gap-[4px]">{nav(libraryLinks)}</nav>
      </div>
      <NavLink to="/settings" onClick={follow} className={navLinkClass('mt-auto max-[850px]:mt-[12px]')}>
        <GSIcon name="settings" size={22} />
        {t('Settings', '설정')}
      </NavLink>
    </>
  )
}
