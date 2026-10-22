import { GameImage, GSIcon } from '@/shared/ui'

// AI가 참고한 게임: 내 라이브러리에서 가장 오래 플레이한 게임. 막대는 1위 게임 대비 플레이시간이다.
export default function SeedGames({ games }) {
  const max = games[0]?.playtimeForever || 1
  return (
    <aside className="rounded-[20px] bg-surface p-[24px]" aria-label="AI가 참고한 게임">
      <p className="flex items-center gap-[8px] text-[15px] font-[700]">
        <GSIcon name="library" size={17} className="text-primary-text" />
        AI가 참고한 게임
      </p>
      <p className="mt-[4px] mb-[18px] text-[13px] text-muted">가장 오래 플레이한 게임으로 취향을 읽었어요</p>
      <ol className="list-none m-0 p-0 flex flex-col gap-[16px]">
        {games.map(game => (
          <li key={game.appId} className="flex items-center gap-[12px] min-w-0">
            <GameImage
              className="w-[96px] aspect-[460/215] rounded-[10px] object-cover shrink-0"
              src={`https://cdn.akamai.steamstatic.com/steam/apps/${game.appId}/header.jpg`}
              iconSize={16}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-[8px]">
                <strong className="text-[14px] font-[600] truncate">{game.name}</strong>
                <span className="shrink-0 text-[13px] text-muted tabular-nums">
                  {Math.round(game.playtimeForever / 60).toLocaleString('ko-KR')}시간
                </span>
              </div>
              <div className="mt-[8px] h-[6px] rounded-full bg-bg overflow-hidden" aria-hidden="true">
                <div className="h-full rounded-full bg-primary" style={{ width: `${(game.playtimeForever / max) * 100}%` }} />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </aside>
  )
}
