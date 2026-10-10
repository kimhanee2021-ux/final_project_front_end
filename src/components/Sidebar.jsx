import { NavLink } from 'react-router-dom'
import GSIcon from './discover/GSIcon'
function Sidebar() {
  return (
    <aside className="ai-sidebar">
      <NavLink to="/" className="ai-brand"><GSIcon name="gamepad" size={43}/><span><strong>GameSense</strong><small>Play Smarter</small></span></NavLink>
      <nav aria-label="메인 메뉴">
        <NavLink to="/" end className={({isActive})=>`ai-nav-link ${isActive?'active':''}`}><GSIcon name="home" size={22}/><span>홈</span></NavLink>
        <NavLink to="/ai-games" className={({isActive})=>`ai-nav-link ${isActive?'active':''}`}><GSIcon name="spark" size={22}/><span>AI 게임 도우미</span></NavLink>
      </nav>
      <div className="ai-sidebar-note"><GSIcon name="spark" size={25}/><strong>Better Games.<br/>A Smarter You.</strong><p>취향에 맞는 게임부터<br/>구매 전 고민까지.</p></div>
      <small className="ai-sidebar-foot">GAMESENSE · PLAY SMARTER</small>
    </aside>
  )
}

export default Sidebar
