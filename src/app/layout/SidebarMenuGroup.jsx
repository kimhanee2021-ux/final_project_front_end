import { GSIcon } from '@/shared/ui'

// 사이드바 메뉴 한 묶음: 제목을 누르면 하위 메뉴가 펼쳐지고 다시 누르면 접힌다.
// 하위 메뉴를 그리는 방법은 Sidebar가 renderLinks로 넘겨준다.
export default function SidebarMenuGroup({ menu, open, onToggle, renderLinks }) {
  return (
    <div>
      <button
        type="button"
        className="w-full flex items-center justify-between min-h-[46px] px-[14px] rounded-[12px] bg-transparent text-text text-[14px] font-[650] hover:bg-surface-hover max-[850px]:min-h-[42px]"
        aria-expanded={open}
        onClick={onToggle}
      >
        {menu.label}
        <GSIcon name="chevron" size={16} className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <nav aria-label={menu.label} className="grid gap-[4px] mt-[4px] pl-[8px]">
          {renderLinks(menu.children)}
        </nav>
      )}
    </div>
  )
}
