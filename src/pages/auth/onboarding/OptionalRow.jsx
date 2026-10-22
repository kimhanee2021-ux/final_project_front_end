import { GSIcon } from '@/shared/ui'

// 선택 항목 한 줄. 끝낸 항목은 체크 표시로 바뀐다.
export default function OptionalRow({ icon, title, text, done, children }) {
  return (
    <div className="flex items-center gap-[14px] p-[16px] rounded-[14px] border border-[#ffffff1f] bg-[#ffffff08] max-[520px]:flex-wrap">
      <span className={`grid place-items-center w-[42px] h-[42px] rounded-[12px] shrink-0 ${done ? 'bg-auth-mint text-[#062c23]' : 'bg-[#ffffff12] text-[#b9dcc8]'}`}>
        <GSIcon name={done ? 'check' : icon} size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-[650]">{title}</p>
        <p className="text-[12px] text-auth-muted leading-[1.6] mt-[3px] break-keep">{text}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}
