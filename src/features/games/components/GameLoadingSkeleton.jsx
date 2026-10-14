// 게임 목록을 불러오는 동안 GameListCard 모양(커버 · 제목 · 평점 · 태그 · 가격)을 회색 블록으로 보여주는 자리표시.
// 카드 크기 클래스를 GameListCard와 맞춰 둬서 데이터가 들어와도 레이아웃이 튀지 않는다.
// GameListCard의 크기·구조를 바꾸면 SkeletonCard도 같이 고칠 것.
function SkeletonCard({ view }) {
  const list = view === 'list'
  return (
    <div
      className={`flex min-w-0 bg-gs-panel border border-gs-border rounded-[10px] overflow-hidden animate-pulse ${list ? 'flex-row min-h-[112px]' : 'flex-col min-h-[133px] max-[600px]:min-h-[140px]'}`}
      aria-hidden="true"
    >
      <div className={`bg-gs-raised rounded-[8px] m-[2px] ${list ? 'shrink-0 basis-[34%] w-[34%] self-stretch' : 'aspect-[460/215]'}`} />
      <div className="flex flex-col gap-[9px] min-w-0 flex-1 p-[11px_8px_9px_11px]">
        <div className="h-[12px] w-[70%] rounded-[4px] bg-gs-raised" />
        <div className="h-[10px] w-[38%] rounded-[4px] bg-gs-raised" />
        <div className="flex gap-[5px]">
          <div className="h-[15px] w-[44px] rounded-[5px] bg-gs-raised" />
          <div className="h-[15px] w-[52px] rounded-[5px] bg-gs-raised" />
        </div>
        <div className="h-[12px] w-[28%] rounded-[4px] bg-gs-raised mt-auto" />
      </div>
    </div>
  )
}

// className에는 실제 목록과 같은 격자 클래스를 넘긴다.
export default function GameLoadingSkeleton({ count = 8, view = 'grid', className = '', label = '게임을 불러오는 중이에요' }) {
  return (
    // 웹 접근성(시각장애인을 위한) 코드
    <div role="status">
      <span className="sr-only">{label}</span>
      <div className={className}>
        {Array.from({ length: count }, (_, index) => (
          <SkeletonCard key={index} view={view} />
        ))}
      </div>
    </div>
  )
}
