import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { EmptyState, GameImage, PageHeading, Panel } from '@/shared/ui'
import { MAX_CARD_TAGS, tagLabel } from '@/shared/utils/gameTags'
import { MAX_LIMIT } from '../api'
import { useAiDiagnosed } from '../hooks/useAiDiagnosed'
import { useAiRecommendations } from '../hooks/useAiRecommendations'

const LIMIT_OPTIONS = [10, 20, 30, MAX_LIMIT]

const noticeClass =
  'flex flex-wrap items-center justify-between gap-[14px] py-[8px] text-muted text-[14px] max-[700px]:flex-col max-[700px]:items-start'

// 추천 게임 한 칸: 커버(순위) → 이름 → 장르. 누르면 스팀 상점 페이지를 새 탭으로 연다.
function RecommendCard({ game }) {
  return (
    <article className="flex flex-col gap-[12px] min-w-0">
      <a
        href={game.storeUrl}
        target="_blank"
        rel="noreferrer"
        className="group relative block overflow-hidden rounded-[16px] bg-bg"
        aria-label={`${game.name} 스팀 상점 보기`}
      >
        <GameImage
          className="block w-full aspect-[460/215] object-cover transition-transform duration-[350ms] group-hover:scale-[1.04]"
          src={game.image}
          iconSize={34}
        />
        <span className="absolute left-[8px] top-[8px] px-[10px] py-[3px] rounded-full bg-surface text-[12px] font-[700] text-primary-text shadow-[var(--shadow)]">
          {game.rank}위
        </span>
      </a>
      <div className="flex flex-col gap-[6px] min-w-0">
        <strong className="text-[15px] font-[600] leading-[1.4] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
          {game.name}
        </strong>
        {game.genres.length > 0 && (
          <ul className="flex flex-wrap gap-[6px]" aria-label="장르">
            {game.genres.slice(0, MAX_CARD_TAGS).map(genre => (
              <li key={genre} className="px-[10px] py-[3px] rounded-full bg-bg text-[12px] text-muted">
                {tagLabel(genre)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}

// AI 추천 화면: 내 스팀 라이브러리의 플레이 기록으로 취향을 계산해 아직 없는 게임을 추천한다.
// 로그인은 라우터의 RequireAuth가 확인한다.
export default function AiRecommendsPanel() {
  const { user } = useAuth()
  const [diagnosed, diagnose] = useAiDiagnosed(user?.id)
  const { data, loading, error, noPlayed, limit, setLimit, reload } = useAiRecommendations(user?.id, {
    enabled: diagnosed,
  })
  const games = data?.games ?? []

  // 아직 추천을 받아본 적 없는 사용자: 추천받기를 누르면 그때부터 추천을 불러온다.
  if (!diagnosed) {
    return (
      <Panel>
        <PageHeading
          title="AI 게임 추천"
          description="내가 플레이한 게임의 취향을 분석해, 아직 보유하지 않은 게임을 추천해 드려요."
        />
        <EmptyState
          title="아직 추천을 받지 않았어요"
          description="추천받기를 누르면 내 플레이 기록으로 취향을 분석해 게임을 추천해 드려요."
          action={
            <button type="button" className="gs-primary-button" onClick={diagnose}>
              추천받기
            </button>
          }
        />
      </Panel>
    )
  }

  return (
    <>
      <Panel>
        <PageHeading
          title="AI 게임 추천"
          description="내가 플레이한 게임의 취향을 분석해, 아직 보유하지 않은 게임을 추천해 드려요."
          action={
            <div className="flex items-center gap-[10px] flex-wrap">
              <label>
                <span className="sr-only">추천 개수</span>
                <select
                  className="h-[40px] px-[16px] rounded-full bg-bg text-text text-[13px] border-0"
                  value={limit}
                  onChange={event => setLimit(Number(event.target.value))}
                  disabled={loading}
                >
                  {LIMIT_OPTIONS.map(option => (
                    <option key={option} value={option}>
                      {option}개 추천
                    </option>
                  ))}
                </select>
              </label>
            </div>
          }
        />
        {data && (
          <p className="text-[13px] text-muted">
            플레이한 게임 {data.usedGameCount}개를 기준으로 추천했어요.
            {data.unplayedGameCount > 0 && ` 미플레이 ${data.unplayedGameCount}개는 취향 계산에서 제외했어요.`}
          </p>
        )}
      </Panel>

      <Panel className="!p-[24px] min-w-0">
        <h2 className="text-[16px] font-[700] mb-[16px]">추천 게임</h2>
        {error ? (
          <div className={noticeClass} role="alert">
            <p>{error}</p>
            <button type="button" className="gs-primary-button" onClick={reload} disabled={loading}>
              다시 시도
            </button>
          </div>
        ) : noPlayed ? (
          <EmptyState
            title="추천에 쓸 플레이 기록이 없어요"
            description="스팀 라이브러리를 동기화하면 플레이한 게임을 바탕으로 추천해 드려요."
            action={
              <Link className="gs-primary-button" to="/library">
                내 스팀 라이브러리 보기
              </Link>
            }
          />
        ) : loading && !data ? (
          <p className={noticeClass}>AI가 취향을 분석하는 중이에요...</p>
        ) : data && !games.length ? (
          <EmptyState title="추천할 게임이 없어요" description="잠시 후 다시 추천받아 보세요." />
        ) : (
          <ul
            className={`list-none m-0 p-0 grid grid-cols-4 gap-[28px_20px] max-[1100px]:grid-cols-3 max-[760px]:grid-cols-2 max-[420px]:grid-cols-1 transition-opacity ${
              loading ? 'opacity-50' : ''
            }`}
          >
            {games.map(game => (
              <li key={game.appId} className="min-w-0">
                <RecommendCard game={game} />
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  )
}
