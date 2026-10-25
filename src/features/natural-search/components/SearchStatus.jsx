import { GSIcon } from '@/shared/ui'
import { RESULT_GRID_CLASS } from './ResultList'

// 목록 대신 보여주는 안내(처음 · 결과 없음 · 오류). 제목 하나와 설명 한 줄만 둔다.
export function SearchMessage({ icon, title, description, role }) {
  return (
    <div className="flex flex-col items-center gap-[10px] px-[20px] py-[56px] text-center" role={role}>
      <GSIcon name={icon} size={32} className="text-faint" />
      <h3 className="text-[18px] font-[700] mt-[8px]">{title}</h3>
      {description && <p className="text-muted text-[14px]">{description}</p>}
    </div>
  )
}

// 검색하는 동안 결과 격자 모양을 미리 보여준다.
export function SearchSkeleton() {
  return (
    <div className={RESULT_GRID_CLASS} role="status" aria-label="검색 중">
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="grid gap-[10px]">
          <div className="aspect-[460/215] w-full rounded-[16px] bg-bg animate-[pulse_1.4s_infinite_alternate]" />
          <div className="h-[16px] w-[70%] rounded-[6px] bg-bg animate-[pulse_1.4s_infinite_alternate]" />
        </div>
      ))}
    </div>
  )
}
