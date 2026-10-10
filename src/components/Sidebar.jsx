import { NavLink } from 'react-router-dom'

function Sidebar() {
  return (
    <aside className="min-h-screen w-48 max-sm:w-20 shrink-0 border-r border-slate-200 bg-slate-50 p-4">
      <nav aria-label="메인 메뉴" className="flex flex-col gap-4 text-sm">
        <NavLink to="/">홈</NavLink>
        <NavLink to="/notices" className={({ isActive }) => isActive ? 'font-bold text-blue-700' : ''}>공지사항</NavLink>
      </nav>
    </aside>
  )
}

export default Sidebar
