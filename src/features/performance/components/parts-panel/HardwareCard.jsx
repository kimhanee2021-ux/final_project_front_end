import { GSIcon } from '@/shared/ui'

// 부품 하나를 타일로: 아이콘 · 부품 이름 · 입력한 모델. 입력하지 않았으면 안내 문구를 보여준다.
// 브라우저는 사용률 같은 값을 실제로 측정할 수 없어서 입력한 사양만 보여준다.
export default function HardwareCard({ item }) {
  const entered = item.model !== ''
  return (
    <article className="flex items-center gap-[14px] p-[24px] rounded-[20px] bg-bg min-w-0" aria-label={`${item.name} 사양`}>
      <span className="grid place-items-center w-[44px] h-[44px] rounded-full bg-surface text-muted shrink-0">
        <GSIcon name={item.id} size={22} />
      </span>
      <div className="min-w-0">
        <h3 className="text-[13px] text-muted">{item.name}</h3>
        <p className={`mt-[2px] text-[16px] font-[600] leading-[1.4] text-pretty ${entered ? '' : 'text-faint'}`}>
          {entered ? item.model : '아직 입력하지 않았어요'}
        </p>
      </div>
    </article>
  )
}
