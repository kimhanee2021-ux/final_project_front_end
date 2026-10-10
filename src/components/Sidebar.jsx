import { NavLink } from 'react-router-dom'
function Sidebar() {
  return (
    <aside className="min-h-screen w-48 max-sm:w-24 shrink-0 border-r border-slate-200 bg-slate-50 p-4">
      <nav className="flex flex-col gap-5 text-sm" aria-label="메인 메뉴"><NavLink to="/">홈</NavLink><NavLink to="/ai-games" className={({isActive})=>isActive?'font-bold text-indigo-700':''}>AI 게임 도우미</NavLink></nav>
    </aside>
  )
}

export default Sidebar
