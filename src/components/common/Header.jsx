import { useLocation } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import Icon from './Icon'
export default function Header({ onMenu }) {
  const { pathname } = useLocation()
  const label = pathname === '/analysis' ? '소비 분석' : pathname === '/library' ? '게임 라이브러리' : '대시보드'
  return <header className="header"><div className="header-location"><button className="icon-button mobile-menu" onClick={onMenu} aria-label="메뉴 열기"><Icon name="menu" /></button><span className="breadcrumb-brand">Workspace</span><span className="breadcrumb-slash">/</span><strong>{label}</strong></div><div className="header-actions"><ThemeToggle /><span className="header-divider" /><div className="avatar">G</div><span className="profile-name">게이머님</span></div></header>
}
