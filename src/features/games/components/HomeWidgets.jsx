import { useState } from 'react'
import { Link } from 'react-router-dom'
import { discoverGames, recentActivity, recommendedIds } from '../mocks/discoverMock'
import { useGameSense } from '../../../contexts/GameSenseContext'
import GSIcon from '../../../components/common/GSIcon'

export function Recommendations() {
  const [offset, setOffset] = useState(0)
  const { setSelectedGame } = useGameSense()
  const games = Array.from({ length: 4 }, (_, index) =>
    discoverGames.find(game => game.id === recommendedIds[(offset + index) % recommendedIds.length])
  )
  return (
    <section
      className="min-w-0 rounded-[12px] border border-gs-border bg-[linear-gradient(130deg,#65829704,transparent),var(--gs-panel)] p-[15px_16px] pt-[13px] pb-[11px] min-[1600px]:p-[16px_18px] max-[1350px]:p-[13px] max-[1120px]:p-[18px] max-[600px]:p-[16px]"
      aria-labelledby="gs-recommend-title"
    >
      <div className="flex items-center gap-[12px] mb-[10px] max-[1350px]:gap-[8px]">
        <span className="flex shrink-0 self-start pt-[1px] text-[#a273f5] [&_svg]:fill-[#a273f5] [&_svg]:stroke-1">
          <GSIcon name="spark" size={28} />
        </span>
        <div>
          <h2 className="text-[15px] font-[660] tracking-[-0.3px] leading-[1.3] min-[1600px]:text-[17px] max-[1350px]:text-[13px] max-[1120px]:text-[17px] max-[600px]:text-[15px]" id="gs-recommend-title">
            AI 추천{' '}
            <span className="inline-block align-middle text-[7px] font-semibold tracking-[0.8px] text-gs-muted border border-gs-border p-[2px_4px] rounded-[4px] ml-[5px]">PREVIEW</span>
          </h2>
          <p className="text-[10px] text-gs-muted mt-[3px] leading-[1.4] min-[1600px]:text-[11px] max-[1120px]:text-[11px] max-[600px]:text-[9px]">당신의 플레이 스타일을 닮은 새로운 발견</p>
        </div>
        <Link to="/recommendations" className="ml-auto inline-flex items-center gap-[8px] text-gs-muted whitespace-nowrap text-[10px] shrink-0 bg-transparent p-0 hover:text-gs-mint max-[600px]:text-[9px] max-[600px]:gap-[4px]">
          더보기
          <GSIcon name="arrow" size={16} />
        </Link>
      </div>
      <div className="flex items-center gap-[9px]">
        <div className="grid grid-cols-4 flex-1 min-w-0 gap-[12px] max-[1350px]:gap-[8px] max-[600px]:grid-cols-2 max-[600px]:gap-[15px_11px]">
          {games.map(game => (
            <button
              className="p-0 bg-transparent min-w-0 text-left group [&_img]:w-full [&_img]:aspect-[1.83] [&_img]:object-cover [&_img]:rounded-[7px] [&_img]:block [&_img]:border [&_img]:border-[#526c7b44] [&_img]:transition-[filter] [&_img]:duration-200 hover:[&_img]:brightness-[1.17] [&_strong]:text-[9px] [&_strong]:font-[550] [&_strong]:block [&_strong]:whitespace-nowrap [&_strong]:overflow-hidden [&_strong]:text-ellipsis [&_strong]:mt-[5px] [&_span]:block [&_span]:text-[9px] [&_span]:text-gs-muted [&_span]:mt-[2px] min-[1600px]:[&_strong]:text-[10px] min-[1600px]:[&_span]:text-[10px] max-[1120px]:[&_strong]:text-[11px] max-[1120px]:[&_span]:text-[11px] max-[600px]:[&_strong]:text-[10px] max-[600px]:[&_span]:text-[9px]"
              key={game.id}
              onClick={() => setSelectedGame(game)}
            >
              <img src={game.banner} alt="" loading="lazy" />
              <strong>{game.name}</strong>
              <span>{game.genres[0]}</span>
            </button>
          ))}
        </div>
        <button
          className="shrink-0 grid place-items-center w-[29px] h-[29px] border border-gs-border rounded-full bg-gs-raised p-0 hover:bg-gs-hover hover:text-gs-mint"
          aria-label="다음 추천 게임"
          onClick={() => setOffset((offset + 1) % recommendedIds.length)}
        >
          <GSIcon name="arrow" size={19} />
        </button>
      </div>
    </section>
  )
}

export function RecentActivity({ expanded = false }) {
  const { setSelectedGame } = useGameSense()
  return (
    <section
      className={`min-w-0 rounded-[12px] border border-gs-border bg-[linear-gradient(130deg,#65829704,transparent),var(--gs-panel)] pt-[13px] pb-[13px] ${expanded ? 'p-[25px] max-[600px]:p-[18px]' : 'p-[15px_16px] min-[1600px]:p-[16px_18px] max-[1350px]:p-[13px] max-[1120px]:p-[18px] max-[600px]:p-[16px]'}`}
      aria-labelledby="gs-recent-title"
    >
      <div className="flex items-center gap-[10px] mb-[12px] max-[1350px]:gap-[8px]">
        <span className="flex shrink-0 self-start pt-[1px]">
          <GSIcon name="clock" size={23} />
        </span>
        <div>
          <h2 className="text-[14px] font-[660] tracking-[-0.3px] leading-[1.3]" id="gs-recent-title">최근 활동</h2>
        </div>
        <p className="m-0 text-[9px] text-gs-muted max-[1350px]:hidden">다시 이어갈 당신의 모험</p>
        {!expanded && (
          <Link to="/activity" className="ml-auto inline-flex items-center gap-[8px] text-gs-muted whitespace-nowrap text-[10px] shrink-0 bg-transparent p-0 hover:text-gs-mint max-[600px]:text-[9px] max-[600px]:gap-[4px]">
            더보기
            <GSIcon name="arrow" size={16} />
          </Link>
        )}
      </div>
      <div
        className={
          expanded
            ? 'grid grid-cols-1 gap-0'
            : 'grid grid-cols-4 gap-[11px] max-[1350px]:gap-[8px] max-[600px]:grid-cols-2 max-[600px]:gap-[16px_12px]'
        }
      >
        {recentActivity.map(activity => {
          const game = discoverGames.find(item => item.id === activity.gameId)
          return (
            <button
              key={game.id}
              className={`group bg-transparent p-0 flex items-center text-left min-w-0 [&_img]:rounded-[6px] [&_img]:shrink-0 [&_img]:object-cover ${expanded ? 'gap-[20px] p-[20px_0] border-t border-gs-border [&_img]:w-[65px] [&_img]:h-[82px] [&>span]:flex-1' : 'gap-[9px] [&_img]:w-[38px] [&_img]:h-[45px] min-[1600px]:[&_img]:w-[42px] min-[1600px]:[&_img]:h-[50px] max-[1350px]:gap-[6px] max-[1350px]:[&_img]:w-[31px] max-[1350px]:[&_img]:h-[42px] max-[1120px]:[&_img]:w-[40px] max-[1120px]:[&_img]:h-[49px] max-[600px]:gap-[10px] max-[600px]:[&_img]:w-[41px] max-[600px]:[&_img]:h-[50px]'}`}
              onClick={() => setSelectedGame(game)}
            >
              <img src={game.image} alt="" loading="lazy" />
              <span className="flex flex-col gap-[6px] min-w-0">
                <strong
                  className={`overflow-hidden text-ellipsis whitespace-nowrap font-medium group-hover:text-gs-mint ${expanded ? 'text-[16px]' : 'text-[8px] min-[1600px]:text-[9px] max-[1120px]:text-[10px] max-[600px]:text-[10px]'}`}
                >
                  {game.shortName || game.name}
                </strong>
                <small className={`text-gs-muted ${expanded ? 'text-[10px]' : 'text-[8px] min-[1600px]:text-[9px] max-[1120px]:text-[10px] max-[600px]:text-[9px]'}`}>{activity.when}</small>
                {expanded && (
                  <>
                    <span className="text-[11px] text-gs-muted">{activity.duration} 플레이</span>
                    <span className="flex items-center gap-[6px] [&_svg]:text-[#e5b553]">
                      <GSIcon name="trophy" size={14} />
                      {activity.achievement}
                    </span>
                  </>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
