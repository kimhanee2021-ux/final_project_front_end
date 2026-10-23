const PULSE = 'animate-[pulse_1.4s_infinite_alternate]'

// 시각 데이터 카드가 나타나기 전의 자리표시(스켈레톤). 카드와 같은 크기라 나타날 때 화면이 흔들리지 않는다.
export default function VisualSkeleton() {
  return (
    <div className="h-full flex flex-col rounded-[20px] bg-surface p-[22px]" role="status" aria-label="시각 데이터를 불러오는 중">
      <div className={`h-[14px] w-[40%] rounded-[6px] bg-bg ${PULSE}`} aria-hidden="true" />
      <div className="flex-1 mt-[16px] flex items-center gap-[24px] max-[420px]:flex-col max-[420px]:items-stretch" aria-hidden="true">
        <div className={`mx-auto w-[170px] h-[170px] shrink-0 rounded-full bg-bg ${PULSE}`} />
        <div className="flex-1 min-w-0 grid gap-[10px]">
          {[0, 1, 2, 3].map(row => (
            <div key={row} className={`h-[12px] rounded-[6px] bg-bg ${PULSE}`} />
          ))}
        </div>
      </div>
      <div className={`mt-[18px] h-[40px] rounded-full bg-bg ${PULSE}`} aria-hidden="true" />
      <span className="sr-only">불러오는 중입니다.</span>
    </div>
  )
}
