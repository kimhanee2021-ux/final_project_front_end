import { NavLink } from 'react-router-dom'
import { useAuth } from '../features/auth/context/AuthContext'
import { useGameSense } from '../contexts/GameSenseContext'
import GSIcon from '../components/common/GSIcon'

const primaryLinks = [
  ['/', 'home', 'Home', '홈'],
  ['/explore', 'compass', 'Explore', '탐색'],
  ['/genres', 'grid', 'Genres', '장르'],
  ['/trending', 'flame', 'New & Trending', '인기 게임'],
  ['/upcoming', 'calendar', 'Upcoming', '출시 예정'],
  ['/analysis', 'chart', 'Expenditure Pattern', '소비 패턴'],
  ['/recommendations', 'spark', 'AI Optimization', '맞춤 추천'],
  ['/pc-check', 'monitor', 'PC 성능 체크', 'PC 성능 체크'],
  ['/community', 'users', 'Community', '커뮤니티'],
  ['/notices', 'calendar', '공지사항', '공지사항'],
]
const libraryLinks = [
  ['/library', 'gamepad', 'My Games', '내 게임'],
  ['/wishlist', 'heart', 'Wishlist', '위시리스트'],
  ['/collections', 'folder', 'Collections', '컬렉션'],
]

const navLinkClass = extra => ({ isActive }) =>
  ['gs-nav-link', extra, isActive && 'active'].filter(Boolean).join(' ')

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
          <span className="gs-nav-count">{wishlist.length}</span>
        )}
      </NavLink>
    ))
  return (
    <>
      <NavLink to="/" end onClick={follow} className="gs-brand">
        <GSIcon name="gamepad" size={43} />
        <span>
          <strong>GameSense</strong>
          <small>Play Smarter</small>
        </span>
      </NavLink>
      <nav aria-label="주 메뉴" className="gs-primary-nav">
        {nav(primaryLinks)}
      </nav>
      <div className="gs-library-nav">
        <p>{t('MY LIBRARY', '나의 라이브러리')}</p>
        <nav aria-label="라이브러리">{nav(libraryLinks)}</nav>
      </div>
      <NavLink to="/explore" onClick={follow} className="gs-sidebar-promo">
        <span>
          Better
          <br />
          Games.
          <br />A Smarter You.
        </span>
        <span className="gs-round-button">
          <GSIcon name="arrow" size={19} />
        </span>
      </NavLink>
      <NavLink to="/settings" onClick={follow} className={navLinkClass('gs-settings-link')}>
        <GSIcon name="settings" size={22} />
        {t('Settings', '설정')}
      </NavLink>
    </>
  )
}
