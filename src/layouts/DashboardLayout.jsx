import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/common/Sidebar'
import Header from '../components/common/Header'
export default function DashboardLayout() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!open) return
    const close = event => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [open])
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        본문으로 이동
      </a>
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="workspace">
        <Header onMenu={() => setOpen(!open)} />
        <main id="main-content">
          <Outlet />
        </main>
        <footer className="page-footer">
          <span>Play what you love. Know what you spend.</span>
          <span>GameSense · 지출을 이해하는 새로운 방법</span>
        </footer>
      </div>
    </div>
  )
}
