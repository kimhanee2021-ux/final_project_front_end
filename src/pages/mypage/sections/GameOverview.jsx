import { Link } from 'react-router-dom'
import { GameImage } from '@/shared/ui'
import { useGameSense } from '@/shared/state'
import { hoursText, useMySpendingContext } from '@/features/spending'
import PanelTitle from './PanelTitle'

// 최근 2주 안에 플레이한 게임 = 현재 플레이 중. 많이 한 순서대로 앞에서 3개만 보여준다.
const PLAYING_PREVIEW = 3

const formatDate = date => (date ? date.replaceAll('-', '.') : '기록 없음')

// 내 게임 현황: 나의 분석 > AI 분석과 같은 스팀 보유 게임 데이터(useMySpendingContext)를 쓴다.
export default function GameOverview() {
  const { wishlist, setQuery } = useGameSense()
  const { data, loading, notLinked } = useMySpendingContext()
  const games = data?.games ?? []
  const playing = games.filter(game => game.recentHours > 0).sort((a, b) => b.recentHours - a.recentHours)
  const maxRecent = playing[0]?.recentHours || 1
  const totalHours = games.reduce((sum, game) => sum + (game.hours ?? 0), 0)
  const stats = [
    { label: '보유 게임', value: games.length.toLocaleString('ko-KR'), unit: '개', to: '/library' },
    { label: '플레이 중', value: playing.length.toLocaleString('ko-KR'), unit: '개', to: '/library' },
    { label: '총 플레이 시간', value: Math.round(totalHours).toLocaleString('ko-KR'), unit: '시간', to: '/analysis' },
    { label: '위시리스트', value: wishlist.length.toLocaleString('ko-KR'), unit: '개', to: '/wishlist' },
  ]
  return (
    <section>
      <PanelTitle title="내 게임 현황" to="/library" linkLabel="모든 게임 보기" onLinkClick={() => setQuery('')} />
      <div className="grid grid-cols-4 gap-[24px] pb-[32px] border-b border-border max-[600px]:grid-cols-2">
        {stats.map(stat => (
          <Link key={stat.label} to={stat.to} onClick={() => setQuery('')} className="block hover:opacity-80">
            <small className="block text-[13px] text-muted">{stat.label}</small>
            <strong className="block mt-[6px] text-[32px] font-[750] tracking-[-1px] tabular-nums">
              {loading ? '-' : stat.value}
              <small className="ml-[3px] text-[16px] font-[500] text-muted">{stat.unit}</small>
            </strong>
          </Link>
        ))}
      </div>
      <div className="flex items-center justify-between mt-[32px] mb-[8px]">
        <h3 className="text-[16px] font-[650]">
          현재 플레이 중
          <span className="ml-[8px] text-[14px] font-[500] text-faint">{playing.length}</span>
          <span className="ml-[8px] text-[12px] font-[500] text-faint">최근 2주 기준</span>
        </h3>
        <Link className="text-[13px] text-muted hover:text-text" to="/library" onClick={() => setQuery('')}>
          모두 보기
        </Link>
      </div>
      <div>
        {playing.slice(0, PLAYING_PREVIEW).map(game => (
          <article key={game.appId} className="flex items-center gap-[16px] py-[16px] border-b border-border last:border-0 max-[600px]:flex-wrap">
            <a
              className="group shrink-0 w-[120px] h-[56px] rounded-[12px] overflow-hidden bg-bg"
              href={`https://store.steampowered.com/app/${game.appId}`}
              target="_blank"
              rel="noreferrer"
              aria-label={`${game.name} 스팀 상점 보기`}
            >
              <GameImage className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" src={game.thumbnailUrl} />
            </a>
            <div className="min-w-0 flex-1">
              <strong className="block text-[15px] font-[600] [overflow-wrap:anywhere]">{game.name}</strong>
              <p className="mt-[4px] text-[12px] text-faint">
                {[...game.genres.slice(0, 3), `총 ${hoursText(game.hours)}`].join(' · ')}
              </p>
              <div className="flex items-center gap-[10px] mt-[10px] max-w-[320px]">
                <div
                  className="flex-1 h-[6px] rounded-full bg-bg overflow-hidden"
                  role="meter"
                  aria-label={`${game.name} 최근 2주 플레이 시간`}
                  aria-valuemin={0}
                  aria-valuemax={maxRecent}
                  aria-valuenow={game.recentHours}
                >
                  <span className="block h-full rounded-full bg-primary" style={{ width: `${(game.recentHours / maxRecent) * 100}%` }} />
                </div>
                <b className="text-[12px] font-[600] tabular-nums whitespace-nowrap">최근 2주 {hoursText(game.recentHours)}</b>
              </div>
            </div>
            <span className="shrink-0 text-[13px] text-muted">마지막 플레이 {formatDate(game.lastPlayedAt)}</span>
          </article>
        ))}
      </div>
      {!playing.length && (
        <div className="py-[48px] text-center text-muted">
          {loading ? (
            <p className="text-[13px]">스팀 플레이 기록을 불러오는 중이에요...</p>
          ) : notLinked ? (
            <>
              <strong className="block text-text text-[15px]">스팀 계정을 연동해 주세요.</strong>
              <p className="mt-[6px] text-[13px]">연동하면 실제 플레이 기록으로 지금 하고 있는 게임을 보여드려요.</p>
            </>
          ) : (
            <>
              <strong className="block text-text text-[15px]">최근 2주 동안 플레이한 게임이 없어요.</strong>
              <p className="mt-[6px] text-[13px]">다음 모험을 시작해보세요.</p>
            </>
          )}
        </div>
      )}
    </section>
  )
}
