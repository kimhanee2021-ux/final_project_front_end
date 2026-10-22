import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { EmptyState, PageHeading } from '@/shared/ui'
import { useAiDiagnosed } from '../hooks/useAiDiagnosed'
import { useAiRecommendations } from '../hooks/useAiRecommendations'
import { matchLevel, reasonFor, tasteGenres, topPlayedGames, totalPlayHours } from '../model/recommendation'
import { TAG_COUNT, TOP_COUNT } from '../model/recommendLayout'
import AiBadge from './parts/AiBadge'
import Analyzing from './parts/Analyzing'
import Steps from './parts/Steps'
import RecommendResult from './result/RecommendResult'
import MoreRecommends from './MoreRecommends'
import Reanalyze from './Reanalyze'

const noticeClass =
  'flex flex-wrap items-center justify-between gap-[14px] py-[8px] text-muted text-[14px] max-[700px]:flex-col max-[700px]:items-start'

// 화면 상태(view)마다 보여줄 본문. 결과 화면은 이미 그려 둔 result를 받아 그대로 놓는다.
function RecommendsBody({ view, error, loading, onDiagnose, onReload, result }) {
  if (view === 'intro')
    return (
      <div className="flex flex-col gap-[20px]">
        <div>
          <strong className="block text-[18px]">AI가 내 취향에 맞는 게임을 골라 드려요</strong>
          <p className="mt-[8px] text-[14px] text-muted leading-[1.6]">플레이한 게임과 플레이시간으로 취향을 계산해, 아직 보유하지 않은 게임 중에서 추천해요.</p>
        </div>
        <Steps />
        <div>
          <button type="button" className="gs-primary-button" onClick={onDiagnose}>
            추천받기
          </button>
        </div>
      </div>
    )
  if (view === 'error')
    return (
      <div className={noticeClass} role="alert">
        <p>{error}</p>
        <button type="button" className="gs-primary-button" onClick={onReload} disabled={loading}>
          다시 시도
        </button>
      </div>
    )
  if (view === 'noPlayed')
    return (
      <EmptyState
        title="추천에 쓸 플레이 기록이 없어요"
        description="스팀 라이브러리를 동기화하면 플레이한 게임을 바탕으로 추천해 드려요."
        action={
          <Link className="gs-primary-button" to="/library">
            내 스팀 라이브러리 보기
          </Link>
        }
      />
    )
  if (view === 'loading') return <Analyzing />
  if (view === 'empty') return <EmptyState title="추천할 게임이 없어요" description="잠시 후 다시 추천받아 보세요." />
  return result || null
}

// AI 추천 화면: 내 스팀 라이브러리의 플레이 기록으로 취향을 계산해 아직 없는 게임을 추천한다.
// 다른 AI 화면처럼 "내 데이터 → AI가 읽은 취향 → 결과" 순서로 보여준다. 로그인은 라우터의 RequireAuth가 확인한다.
// libraryGames는 취향을 만든 게임(플레이시간 상위)을 보여주는 데 쓴다. 없으면 그 칸만 빠진다.
export default function AiRecommendsPanel({ libraryGames }) {
  const { user } = useAuth()
  const [diagnosed, diagnose] = useAiDiagnosed(user?.id)
  const { data, loading, error, noPlayed, reload } = useAiRecommendations(user?.id, {
    enabled: diagnosed,
  })
  const games = useMemo(() => data?.games ?? [], [data])
  const seeds = useMemo(() => topPlayedGames(libraryGames), [libraryGames])
  const totalHours = useMemo(() => totalPlayHours(libraryGames), [libraryGames])
  // 카드마다 잘 맞는 정도와 이유를 붙인다
  const cards = useMemo(() => {
    const taste = tasteGenres(games)
    return games.map((game, index) => ({ game, match: matchLevel(index, games.length), reason: reasonFor(game, taste) }))
  }, [games])
  const tags = useMemo(() => tasteGenres(games, TAG_COUNT), [games])
  const showLists = diagnosed && !error && !noPlayed && cards.length > TOP_COUNT

  // 지금 보여줄 화면 상태: 추천받기 전 / 오류 / 플레이 기록 없음 / 분석 중 / 추천 없음 / 결과
  const view = !diagnosed ? 'intro' : error ? 'error' : noPlayed ? 'noPlayed' : loading && !data ? 'loading' : data && !games.length ? 'empty' : data ? 'result' : null
  const showResult = view === 'result'

  return (
    <>
      <section className="rounded-[24px] border border-insight-border bg-insight-bg shadow-[var(--shadow)] p-[32px] max-[600px]:p-[20px] max-[600px]:rounded-[20px] min-w-0">
        <PageHeading
          title="AI 게임 추천"
          description="내가 플레이한 게임의 취향을 분석해, 아직 보유하지 않은 게임을 추천해 드려요."
          action={showResult ? <Reanalyze loading={loading} onReload={reload} /> : undefined}
        />
        {/* 추천 결과가 있으면 배지 줄은 결과 영역 왼쪽 칸 맨 위에 둔다(Result). 그 밖의 상태는 여기서 제목 쪽으로 당겨 둔다 */}
        {!showResult && (
          <div className="-mt-[16px] mb-[14px]">
            <AiBadge />
          </div>
        )}
        <RecommendsBody
          view={view}
          error={error}
          loading={loading}
          onDiagnose={diagnose}
          onReload={reload}
          result={showResult && <RecommendResult data={data} games={games} cards={cards} seeds={seeds} totalHours={totalHours} loading={loading} />}
        />
      </section>

      {showLists && <MoreRecommends cards={cards} tags={tags} loading={loading} />}
    </>
  )
}
