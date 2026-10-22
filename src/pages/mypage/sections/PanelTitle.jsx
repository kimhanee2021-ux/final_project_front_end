import { Link } from 'react-router-dom'
import { GSIcon } from '@/shared/ui'

// 패널 맨 위 한 줄 요약(제목 + 오른쪽 이동 링크)
export default function PanelTitle({ title, to, linkLabel, onLinkClick }) {
  return (
    <div className="flex items-center justify-between gap-[12px] mb-[32px]">
      <h2 className="text-[clamp(26px,3.4vw,40px)] font-[750] tracking-[-1.2px]">{title}</h2>
      {to && (
        <Link className="inline-flex items-center gap-[6px] text-[13px] text-muted hover:text-text" to={to} onClick={onLinkClick}>
          {linkLabel}
          <GSIcon name="arrow" size={15} />
        </Link>
      )}
    </div>
  )
}
