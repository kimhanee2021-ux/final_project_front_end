export default function Skeleton() {
  return (
    <div className="grid grid-cols-3 gap-[20px] max-[580px]:grid-cols-1" role="status" aria-label="대시보드를 불러오는 중">
      <div className="h-[180px] bg-bg rounded-[20px] animate-[pulse_1.4s_infinite_alternate] last:[grid-column:1/-1] last:h-[360px]" />
      <div className="h-[180px] bg-bg rounded-[20px] animate-[pulse_1.4s_infinite_alternate] last:[grid-column:1/-1] last:h-[360px]" />
      <div className="h-[180px] bg-bg rounded-[20px] animate-[pulse_1.4s_infinite_alternate] last:[grid-column:1/-1] last:h-[360px]" />
      <div className="h-[180px] bg-bg rounded-[20px] animate-[pulse_1.4s_infinite_alternate] last:[grid-column:1/-1] last:h-[360px]" />
      <span className="sr-only">불러오는 중입니다.</span>
    </div>
  )
}
