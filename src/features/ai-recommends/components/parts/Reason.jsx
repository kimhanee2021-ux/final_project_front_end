import { GSIcon } from '@/shared/ui'

// 추천 이유 한 줄 (반짝이 아이콘 + 말줄임)
export default function Reason({ text, className = 'text-muted' }) {
  return (
    <p className={`flex items-center gap-[6px] text-[12px] min-w-0 ${className}`}>
      <GSIcon name="spark" size={12} className="shrink-0" />
      <span className="truncate">{text}</span>
    </p>
  )
}
