import { useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { GSIcon } from '@/shared/ui'
import { useDismiss } from '@/shared/hooks'
import { headerMenus } from '@/app/layout/headerMenus'

const itemBase = 'relative flex items-center gap-[4px] h-full px-[14px] text-[14px] whitespace-nowrap transition-colors bg-transparent'
const activeLine = 'text-gs-mint font-[650] after:absolute after:left-[14px] after:right-[14px] after:bottom-0 after:h-[3px] after:rounded-full after:bg-gs-accent'
const itemClass = active => `${itemBase} ${active ? activeLine : 'text-gs-muted hover:text-gs-text'}`

// 메인 메뉴. 서브 메뉴가 있는 항목은 눌러서 펼치고, 바깥을 누르거나 이동하면 닫힌다.
export default function HeaderNav({ onNavigate }) {
  const { pathname } = useLocation()
  const [openId, setOpenId] = useState(null)
  const navRef = useRef(null)
  useDismiss(navRef, openId !== null, () => setOpenId(null))

  const go = () => {
    setOpenId(null)
    onNavigate?.()
  }

  return (
    <nav aria-label="주 메뉴" className="flex h-full max-[900px]:hidden" ref={navRef}>
      {headerMenus.map(menu =>
        menu.children ? (
          <div key={menu.id} className="relative h-full">
            <button
              type="button"
              className={itemClass(menu.children.some(child => child.to.split(/[?#]/)[0] === pathname || (child.matchChildren && pathname.startsWith(`${child.to}/`))))}
              aria-expanded={openId === menu.id}
              onClick={() => setOpenId(openId === menu.id ? null : menu.id)}
            >
              {menu.label}
              <GSIcon name="chevron" size={15} className={`transition-transform ${openId === menu.id ? 'rotate-180' : ''}`} />
            </button>
            {openId === menu.id && (
              <ul className="absolute left-0 top-[calc(100%+6px)] min-w-[230px] p-[8px] bg-gs-panel rounded-[20px] shadow-[var(--gs-shadow)] animate-[gs-appear_.15s_ease]">
                {menu.children.map(child => (
                  <li key={child.to}>
                    <NavLink
                      to={child.to}
                      end={!child.matchChildren}
                      onClick={go}
                      className="block px-[14px] py-[10px] rounded-[14px] hover:bg-gs-hover"
                    >
                      <strong className="block text-[14px]">{child.label}</strong>
                      <small className="text-[12px] text-gs-muted">{child.description}</small>
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <NavLink key={menu.id} to={menu.to} className={({ isActive }) => itemClass(isActive)} onClick={go}>
            {menu.label}
          </NavLink>
        )
      )}
    </nav>
  )
}
