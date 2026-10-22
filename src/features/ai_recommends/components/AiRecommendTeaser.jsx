import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { GameImage, Panel } from '@/shared/ui'
import { useAiDiagnosed } from '../hooks/useAiDiagnosed'
import { useAiRecommendations } from '../hooks/useAiRecommendations'

const TEASER_COUNT = 3

// Fisher-Yates 셔플로 원본을 건드리지 않고 count개를 뽑는다.
function pickRandom(list, count) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, count)
}

// 다른 화면(내 라이브러리)에 덧붙이는 AI 추천 안내.
// 추천받기 전에는 AI 추천 탭으로 가는 바로가기, 받은 뒤에는 추천 게임 3개를 보여준다.
export default function AiRecommendTeaser() {
  const { user } = useAuth()
  const [diagnosed] = useAiDiagnosed(user?.id)
  const { data, loading, error, noPlayed } = useAiRecommendations(user?.id, { enabled: diagnosed })
  // 추천 목록에서 무작위로 고른다. 리렌더마다 바뀌지 않게 추천 결과가 바뀔 때만 다시 뽑는다.
  const games = useMemo(() => pickRandom(data?.games ?? [], TEASER_COUNT), [data])

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
        <Link className="text-[13px] text-primary-text underline" to="/ai-recommends">
          더 보기
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
                className="flex items-center gap-[12px] p-[12px] rounded-[16px] bg-bg transition-[transform,box-shadow] duration-200 hover:-translate-y-[2px] hover:shadow-[var(--shadow)]"
                aria-label={`${game.name} 스팀 상점 보기`}
              >
                <GameImage className="w-[96px] aspect-[460/215] rounded-[10px] object-cover shrink-0" src={game.image} iconSize={22} />
                <strong className="flex-1 min-w-0 text-[14px] font-[600] leading-[1.4] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
                  {game.name}
                </strong>
              </a>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}
