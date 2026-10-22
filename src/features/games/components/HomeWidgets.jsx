import { discoverGames, recentActivity } from '../mocks/discoverMock'
import { useGameSense } from '@/shared/state'
import { GSIcon } from '@/shared/ui'

// 최근 플레이한 게임 목록: 구분선으로 나눈 행 하나에 커버 · 이름 · 시점 · 플레이 시간 · 달성 업적.
export function RecentActivity() {
  const { setSelectedGame } = useGameSense()
  return (
    <section className="min-w-0" aria-labelledby="gs-recent-title">
      <h2 className="sr-only" id="gs-recent-title">최근 활동</h2>
      <div>
        {recentActivity.map(activity => {
          const game = discoverGames.find(item => item.id === activity.gameId)
          return (
            <button
              key={game.id}
              className="group w-full flex items-center gap-[20px] py-[20px] border-b border-border last:border-0 bg-transparent text-left min-w-0"
              onClick={() => setSelectedGame(game)}
            >
              <img className="w-[64px] h-[80px] rounded-[12px] shrink-0 object-cover" src={game.image} alt="" loading="lazy" />
              <span className="flex flex-col gap-[6px] min-w-0 flex-1">
                <strong className="text-[16px] font-[600] overflow-hidden text-ellipsis whitespace-nowrap group-hover:underline">
                  {game.shortName || game.name}
                </strong>
                <small className="text-[13px] text-muted">{activity.when} · {activity.duration} 플레이</small>
                <span className="flex items-center gap-[6px] text-[13px] text-faint">
                  <GSIcon name="trophy" size={14} />
                  {activity.achievement}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
