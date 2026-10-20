// 게임 목록을 불러오는 동안 GameListCard 모양(커버 · 제목 · 가격)을 회색 블록으로 보여주는 자리표시.
// GameListCard의 구조를 바꾸면 SkeletonCard도 같이 고칠 것.
function SkeletonCard({ view }) {
  const list = view === 'list'
  return (
    <div
      className={`flex min-w-0 animate-pulse ${list ? 'flex-row items-center gap-[16px] py-[14px] border-b border-border' : 'flex-col gap-[12px]'}`}
      aria-hidden="true"
    >
      <div className={`bg-bg rounded-[16px] ${list ? 'shrink-0 w-[160px] aspect-[460/215]' : 'aspect-[460/215]'}`} />
      <div className="flex flex-col gap-[8px] min-w-0 flex-1">
        <div className="h-[14px] w-[70%] rounded-[4px] bg-bg" />
        <div className="h-[12px] w-[28%] rounded-[4px] bg-bg" />
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
