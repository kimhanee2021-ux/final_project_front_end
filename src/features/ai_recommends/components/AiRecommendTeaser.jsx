import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { WishlistButton } from '@/features/wishlist'
import { GameImage, GSIcon, Panel } from '@/shared/ui'
import { useAiDiagnosed } from '../hooks/useAiDiagnosed'
import { useAiRecommendations } from '../hooks/useAiRecommendations'
import { MEDALS } from '../model/medals'
import RankBadge from './RankBadge'

const TEASER_COUNT = 3

// 다른 화면(내 라이브러리)에 덧붙이는 AI 추천 안내.
// 추천받기 전에는 AI 추천 탭으로 가는 바로가기, 받은 뒤에는 AI 게임 추천의 1~3위를 금 · 은 · 동으로 보여준다.
export default function AiRecommendTeaser() {
  const { user } = useAuth()
  const [diagnosed] = useAiDiagnosed(user?.id)
  const { data, loading, error, noPlayed } = useAiRecommendations(user?.id, { enabled: diagnosed })
  const games = (data?.games ?? []).slice(0, TEASER_COUNT)

  if (!diagnosed) {
    return (
      <Panel className="!p-[24px]">
        <div className="flex flex-wrap items-center justify-between gap-[14px] max-[700px]:flex-col max-[700px]:items-start">
          <div>
            <h2 className="text-[16px] font-[700]">AI 게임 추천</h2>
            <p className="mt-[4px] text-[13px] text-muted">
              내 플레이 기록으로 취향을 분석해 새 게임을 추천받아 보세요.
            </p>
          </div>
          <Link className="gs-primary-button" to="/ai-recommends">
            추천받으러 가기
          </Link>
        </div>
      </Panel>
    )
  }

  // 오류·플레이 기록 없음은 라이브러리 화면을 어지럽히지 않게 숨긴다. 자세한 안내는 AI 추천 탭에서 한다.
  if (error || noPlayed) return null

  return (
    <Panel className="!p-[24px] min-w-0">
      <div className="flex items-center justify-between gap-[12px] mb-[16px]">
        <h2 className="text-[16px] font-[700]">내 취향 추천 게임</h2>
        <Link className="inline-flex items-center gap-[4px] text-[13px] font-[650] text-primary-text hover:underline" to="/ai-recommends">
          더 많은 추천 게임 보기
          <GSIcon name="arrow" size={14} />
        </Link>
      </div>
      {loading && !games.length ? (
        <p className="text-[13px] text-muted">AI가 취향을 분석하는 중이에요...</p>
      ) : (
        <ul className="list-none m-0 p-0 grid grid-cols-3 gap-[16px] max-[700px]:grid-cols-1">
          {games.map(game => (
            <li key={game.appId} className="min-w-0">
              <a
                href={game.storeUrl}
                target="_blank"
                rel="noreferrer"
                className={`relative flex items-center gap-[12px] p-[12px] pr-[52px] rounded-[16px] bg-bg ring-2 transition-transform duration-200 hover:-translate-y-[2px] ${
                  MEDALS[game.rank]?.ring ?? 'ring-transparent'
                }`}
                aria-label={`${game.name} 스팀 상점 보기`}
              >
                <span className="relative block w-[96px] shrink-0 overflow-hidden rounded-[10px]">
                  <GameImage className="block w-full aspect-[460/215] object-cover" src={game.image} iconSize={22} />
                  <RankBadge rank={game.rank} medal size="sm" />
                </span>
                <strong className="flex-1 min-w-0 text-[14px] font-[600] leading-[1.4] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
                  {game.name}
                </strong>
                <WishlistButton game={game} className="absolute right-[10px] bottom-[10px] !w-[32px] !h-[32px]" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}
