import { Panel } from '@/shared/ui'

// 설정 항목 하나가 패널 하나: 큰 제목 → 설명 한 줄 → 조작(children).
export default function SettingSection({ id, title, description, children }) {
  return (
    <Panel id={id}>
      <h2 className="text-[clamp(24px,2.8vw,32px)] font-[750] tracking-[-1px] leading-[1.3]">{title}</h2>
      {description && <p className="mt-[12px] text-[16px] text-muted leading-[1.7]">{description}</p>}
      <div className="mt-[28px]">{children}</div>
    </Panel>
  )
}
