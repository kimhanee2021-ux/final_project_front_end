export default function Skeleton() {
  return (
    <div className="grid grid-cols-3 gap-[20px] pt-[110px] max-[580px]:grid-cols-1 max-[580px]:pt-0" role="status" aria-label="대시보드를 불러오는 중">
      <div className="h-[180px] bg-border rounded-[15px] animate-[pulse_1.4s_infinite_alternate] last:[grid-column:1/-1] last:h-[360px]" />
      <div className="h-[180px] bg-border rounded-[15px] animate-[pulse_1.4s_infinite_alternate] last:[grid-column:1/-1] last:h-[360px]" />
      <div className="h-[180px] bg-border rounded-[15px] animate-[pulse_1.4s_infinite_alternate] last:[grid-column:1/-1] last:h-[360px]" />
      <div className="h-[180px] bg-border rounded-[15px] animate-[pulse_1.4s_infinite_alternate] last:[grid-column:1/-1] last:h-[360px]" />
      <span className="sr-only">불러오는 중입니다.</span>
    </div>
  )
}
