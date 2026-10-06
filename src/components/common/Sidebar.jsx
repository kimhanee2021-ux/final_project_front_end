import { NavLink } from 'react-router-dom'
import Icon from './Icon'
export default function Sidebar({ open, onClose }) {
  return (
    <>
      <button
        className={'sidebar-backdrop ' + (open ? 'visible' : '')}
        aria-label="메뉴 닫기"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />
      <aside className={'sidebar ' + (open ? 'is-open' : '')}>
        <NavLink to="/" className="brand" onClick={onClose}>
          <span className="brand-symbol">
            <i />
            <i />
          </span>
          GameSense<span className="brand-dot">.</span>
        </NavLink>
        <span className="nav-caption">MY GAME LIFE</span>
        <nav aria-label="주 메뉴">
          {[
            ['/', 'grid', '대시보드'],
            ['/analysis', 'chart', '소비 분석'],
            ['/library', 'library', '게임 라이브러리'],
          ].map(([to, icon, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) => 'nav-item ' + (isActive ? 'active' : '')}
            >
              <Icon name={icon} />
              <span>{label}</span>
              <Icon name="chevron" size={15} />
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="small-spark">✦</span>
            <strong>
              좋아하는 게임에,
              <br />더 가치 있는 소비.
            </strong>
            <p>
              나만의 게임 소비 습관을
              <br />
              발견해 보세요.
            </p>
          </div>
          <div className="connection">
            <span className="status-dot" />
            <div>
              <strong>데모 둘러보기</strong>
              <small>실제 계정은 연결되지 않았어요</small>
            </div>
          </div>
          <div className="sidebar-foot">
            GAMESENSE <span>© 2026</span>
          </div>
        </div>
      </aside>
    </>
  )
}
