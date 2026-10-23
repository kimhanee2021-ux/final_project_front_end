import { GSIcon } from '@/shared/ui'

// 혜택 한 줄 (아이콘 + 설명)
export default function Benefit({ icon, children }) {
  return (
    <li className="flex items-start gap-[12px] text-[13px] leading-[1.7] text-[#c8d4cc]">
      <GSIcon name={icon} size={18} className="text-[#b9dcc8] mt-[3px] shrink-0" />
      <span>{children}</span>
    </li>
  )
}
