import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { AnalysisPanel, EmptyState, FilterChips, GameImage, GSIcon, PageHeading, Panel } from '@/shared/ui'
import { br, hl } from '@/shared/utils/headline'
import { MAX_CARD_TAGS, tagLabel } from '@/shared/utils/gameTags'
import { WishlistButton } from '@/features/wishlist'
import { useAiDiagnosed } from '../hooks/useAiDiagnosed'
import { useAiRecommendations } from '../hooks/useAiRecommendations'
import { genreShares, matchLevel, reasonFor, tasteGenres, topPlayedGames } from '../model/recommendation'
import { MEDALS } from '../model/medals'
import RankBadge from './RankBadge'

const TOP_COUNT = 3
// 더 많은 추천은 12위까지 (4~12위 = 3열 × 3줄)
const LIST_END = 12
// 더 많은 추천 옆 태그: 내 취향 태그 수와 태그마다 보여줄 게임 수 (3열 × 4줄). ALL_TAG는 4~12위를 그대로 보여준다.
const TAG_COUNT = 5
const TAG_PICK_COUNT = 12
const ALL_TAG = 'all'
const GRID3 = 'list-none m-0 p-0 grid grid-cols-3 gap-[28px_20px] max-[760px]:grid-cols-2 max-[420px]:grid-cols-1'
// AI가 추천을 만드는 순서. 추천받기 전 안내와 불러오는 동안의 진행 표시가 같이 쓴다.
const STEPS = ['플레이 기록 읽기', '취향 계산하기', '어울리는 게임 고르기']

const noticeClass =
  'flex flex-wrap items-center justify-between gap-[14px] py-[8px] text-muted text-[14px] max-[700px]:flex-col max-[700px]:items-start'

// AI 분석 화면(AiAnalysisSection)과 같은 각진 그라데이션 라벨 + 반짝이는 별로 "AI가 만든 결과"임을 표시한다.
function AiBadge() {
  return (
    <span className="ai-badge relative inline-flex items-center gap-[6px] mb-[20px] px-[11px] py-[4px] rounded-[6px] text-[12px] font-[800] tracking-[0.4px] text-[#14131c] overflow-hidden">
      <GSIcon name="spark" size={14} className="ai-badge-spark" />
      AI추천
    </span>
  )
}

// 단계 목록. active가 없으면 순서 안내로, 있으면 그 단계까지 진행 중인 모습으로 그린다.
function Steps({ active }) {
  return (
    <ol className="list-none m-0 p-0 flex flex-wrap gap-[10px]">
      {STEPS.map((step, index) => {
        const done = active !== undefined && index < active
        const current = index === active
        return (
          <li
            key={step}
            className={`inline-flex items-center gap-[8px] h-[36px] px-[14px] rounded-full text-[13px] font-[600] transition-colors ${
              current ? 'bg-primary text-on-primary' : done ? 'bg-primary-soft text-primary-text' : 'bg-surface text-muted'
            }`}
          >
            {done ? <GSIcon name="check" size={14} /> : <span className="tabular-nums">{index + 1}</span>}
            {step}
            {current && <span className="w-[6px] h-[6px] rounded-full bg-current animate-pulse" aria-hidden="true" />}
          </li>
        )
      })}
    </ol>
  )
}

// 추천을 불러오는 동안: 단계가 차례로 넘어가고 마지막 단계에서 응답을 기다린다.
function Analyzing() {
  const [active, setActive] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setActive(step => Math.min(step + 1, STEPS.length - 1)), 1600)
    return () => clearInterval(timer)
  }, [])
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-[16px]">
      <Steps active={active} />
      <p className="text-[13px] text-muted">AI가 내 플레이 기록으로 취향을 분석하고 있어요...</p>
    </div>
  )
}

// 잘 맞는 정도: 막대 3칸 + 문구. %가 아니라 목록 안의 순위 구간이다.
function MatchMeter({ match, className = 'text-primary-text' }) {
  return (
    <span className={`inline-flex items-center gap-[6px] text-[12px] font-[700] ${className}`}>
      <span className="flex gap-[2px]" aria-hidden="true">
        {[1, 2, 3].map(step => (
          <i key={step} className={`block w-[10px] h-[4px] rounded-full ${step <= match.level ? 'bg-current' : 'bg-current opacity-25'}`} />
        ))}
      </span>
      {match.label}
    </span>
  )
}

function Reason({ text, className = 'text-muted' }) {
  return (
    <p className={`flex items-center gap-[6px] text-[12px] min-w-0 ${className}`}>
      <GSIcon name="spark" size={12} className="shrink-0" />
      <span className="truncate">{text}</span>
    </p>
  )
}

// TOP 3 카드: 커버 위에 이름 · 잘 맞는 정도 · 이유를 겹쳐 보여준다. 테두리는 금 · 은 · 동, large는 1위용으로 글자를 키운다.
function CoverCard({ game, match, reason, large = false }) {
  return (
    <a
      href={game.storeUrl}
      target="_blank"
      rel="noreferrer"
      className={`group relative block h-full overflow-hidden rounded-[20px] bg-bg ring-2 transition-transform duration-200 hover:-translate-y-[2px] ${
        MEDALS[game.rank]?.ring ?? 'ring-transparent'
      } ${large ? 'row-span-2 max-[860px]:row-span-1 max-[860px]:h-[280px]' : 'max-[860px]:h-[200px]'}`}
      aria-label={`${game.name} 스팀 상점 보기`}
    >
      <GameImage
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[350ms] group-hover:scale-[1.04]"
        src={game.image}
        iconSize={large ? 40 : 28}
      />
      <RankBadge rank={game.rank} isNew={game.isNew} medal size={large ? 'lg' : 'md'} />
      <div
        className={`absolute inset-x-0 bottom-0 flex flex-col bg-[linear-gradient(to_top,#000000e0,#00000080_60%,transparent)] ${
          large ? 'gap-[8px] p-[24px] pt-[72px] pr-[72px]' : 'gap-[4px] p-[16px] pt-[48px] pr-[60px]'
        }`}
      >
        <MatchMeter match={match} className="text-[#7bf5d6]" />
        <strong className={`font-[750] leading-[1.3] text-white truncate ${large ? 'text-[28px] max-[600px]:text-[22px]' : 'text-[17px]'}`}>
          {game.name}
        </strong>
        <Reason text={reason} className="text-[#ffffffcc]" />
      </div>
      <WishlistButton game={game} className={`absolute ${large ? 'right-[20px] bottom-[20px]' : 'right-[14px] bottom-[14px]'}`} />
    </a>
  )
}

// 나머지 추천 한 칸: 커버(순위) → 이름 → 장르 → 잘 맞는 정도 · 이유. rank는 보여줄 순위(태그 안 순위 등)이고, 1~3위면 금 · 은 · 동 배지다.
function RecommendCard({ game, match, reason, rank = game.rank }) {
  return (
    <article className="relative flex flex-col gap-[10px] min-w-0">
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
        <RankBadge rank={rank} isNew={game.isNew} medal={rank <= TOP_COUNT} />
      </a>
      <div className="flex flex-col gap-[6px] min-w-0 pr-[44px]">
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
        <MatchMeter match={match} />
        <Reason text={reason} />
      </div>
      <WishlistButton game={game} className="absolute right-0 bottom-0" />
    </article>
  )
}

// AI가 참고한 게임: 내 라이브러리에서 가장 오래 플레이한 게임. 막대는 1위 게임 대비 플레이시간이다.
function SeedGames({ games }) {
  const max = games[0]?.playtimeForever || 1
  return (
    <aside className="rounded-[20px] bg-surface p-[20px]" aria-label="AI가 참고한 게임">
      <p className="flex items-center gap-[8px] text-[14px] font-[700]">
        <GSIcon name="library" size={16} className="text-primary-text" />
        AI가 참고한 게임
      </p>
      <p className="mt-[4px] mb-[16px] text-[12px] text-muted">가장 오래 플레이한 게임으로 취향을 읽었어요</p>
      <ol className="list-none m-0 p-0 flex flex-col gap-[14px]">
        {games.map(game => (
          <li key={game.appId} className="flex items-center gap-[12px] min-w-0">
            <GameImage
              className="w-[72px] aspect-[460/215] rounded-[8px] object-cover shrink-0"
              src={`https://cdn.akamai.steamstatic.com/steam/apps/${game.appId}/header.jpg`}
              iconSize={16}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-[8px]">
                <strong className="text-[13px] font-[600] truncate">{game.name}</strong>
                <span className="shrink-0 text-[12px] text-muted tabular-nums">
                  {Math.round(game.playtimeForever / 60).toLocaleString('ko-KR')}시간
                </span>
              </div>
              <div className="mt-[6px] h-[4px] rounded-full bg-bg overflow-hidden" aria-hidden="true">
                <div className="h-full rounded-full bg-primary" style={{ width: `${(game.playtimeForever / max) * 100}%` }} />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </aside>
  )
}

// 취향 장르 비중: 추천 게임 중 그 장르가 차지하는 비율을 가로 막대로 보여준다.
function GenreShares({ games, genres }) {
  return (
    <div className="max-w-[520px]">
      <p className="mb-[12px] text-[12px] text-muted">AI 추천 {games.length}개 중 장르 비중</p>
      <ul className="list-none m-0 p-0 flex flex-col gap-[10px]" aria-label="내 취향 장르 비중">
        {genreShares(games, genres).map(({ genre, share }) => (
          <li key={genre} className="grid grid-cols-[88px_minmax(0,1fr)_44px] items-center gap-[12px]">
            <span className="text-[13px] font-[700] text-primary-text truncate">#{tagLabel(genre)}</span>
            <span className="h-[8px] rounded-full bg-surface overflow-hidden" aria-hidden="true">
              <span className="block h-full rounded-full bg-primary" style={{ width: `${share}%` }} />
            </span>
            <span className="text-[13px] font-[700] text-right tabular-nums">{share}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// 추천 결과: 위쪽 왼쪽에 AI가 읽은 취향, 오른쪽에 그 근거(AI가 참고한 게임). 그 아래 "그래서 추천한" TOP 3를 크게.
function Result({ data, games, cards, seeds, loading }) {
  const taste = tasteGenres(games)
  const top = cards.slice(0, TOP_COUNT)
  const tasteText = taste.slice(0, 2).map(tagLabel).join(' · ')
  return (
    <div className={`transition-opacity ${loading ? 'opacity-50' : ''}`}>
      <div className={`grid gap-[32px] items-start ${seeds.length ? 'grid-cols-[minmax(0,1fr)_minmax(280px,360px)] max-[860px]:grid-cols-1' : ''}`}>
        <AnalysisPanel
          eyebrow="AI가 찾은 내 취향"
          headline={
            tasteText
              ? ['플레이한 게임 ', hl(`${data.usedGameCount}개`), '를 분석해 보니', br, hl(tasteText), ' 취향이 가장 짙어요.']
              : ['플레이한 게임 ', hl(`${data.usedGameCount}개`), '로 취향을 분석했어요.']
          }
        >
          {taste.length > 0 && <GenreShares games={games} genres={taste} />}
        </AnalysisPanel>
        {seeds.length > 0 && <SeedGames games={seeds} />}
      </div>

      <div className="mt-[36px] mb-[16px] flex items-center gap-[10px]">
        <span className="grid place-items-center w-[32px] h-[32px] rounded-full bg-primary text-on-primary shrink-0" aria-hidden="true">
          <GSIcon name="arrowDown" size={16} />
        </span>
        <h2 className="text-[20px] font-[750] tracking-[-0.5px]">{seeds.length ? '그래서 AI가 이 게임들을 추천했어요' : 'AI가 고른 추천 게임'}</h2>
        <span className="ml-auto inline-flex items-center gap-[6px] h-[32px] px-[14px] rounded-[10px] bg-primary text-on-primary text-[14px] font-[800] shadow-[0_4px_14px_#a18afa55]">
          <GSIcon name="spark" size={15} />
          TOP {top.length}
        </span>
      </div>
      <div
        className={`grid gap-[16px] h-[400px] max-[860px]:h-auto max-[860px]:grid-cols-1 max-[860px]:grid-rows-none ${
          top.length > 1 ? 'grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] grid-rows-2' : ''
        }`}
      >
        {top.map((card, index) => (
          <CoverCard key={card.game.appId} {...card} large={index === 0 && top.length > 1} />
        ))}
      </div>
    </div>
  )
}

// 더 많은 추천: 제목 옆 태그로 고른다. #전체는 4~12위, 장르 태그는 그 장르 추천을 태그 안 1~12위로 다시 매긴다(TOP 3 게임도 포함).
function MoreRecommends({ cards, tags, loading }) {
  const [picked, setPicked] = useState(ALL_TAG)
  // 다시 받은 추천에 고른 태그가 없으면 #전체로 돌아간다
  const tag = tags.includes(picked) ? picked : ALL_TAG
  const list =
    tag === ALL_TAG
      ? cards.slice(TOP_COUNT, LIST_END)
      : cards.filter(card => card.game.genres.includes(tag)).slice(0, TAG_PICK_COUNT)
  const options = [ALL_TAG, ...tags].map(item => ({ key: item, label: item === ALL_TAG ? '#전체' : `#${tagLabel(item)}` }))
  return (
    <Panel className="!p-[24px] min-w-0">
      <div className="flex items-center justify-between gap-[12px] mb-[20px] max-[760px]:flex-col max-[760px]:items-start">
        <h2 className="shrink-0 text-[16px] font-[700]">
          {tag === ALL_TAG
            ? `더 많은 추천 · ${TOP_COUNT + 1}~${TOP_COUNT + list.length}위`
            : `#${tagLabel(tag)} 잘 맞는 게임 · 1~${list.length}위`}
        </h2>
        <FilterChips label="추천 태그" options={options} activeKey={tag} onSelect={setPicked} className="max-w-full" />
      </div>
      <ul className={`${GRID3} transition-opacity ${loading ? 'opacity-50' : ''}`}>
        {list.map((card, index) => (
          <li key={card.game.appId} className="min-w-0">
            <RecommendCard {...card} rank={tag === ALL_TAG ? card.game.rank : index + 1} />
          </li>
        ))}
      </ul>
      <p className="mt-[24px] text-[12px] text-faint leading-[1.7]">
        추천은 내가 플레이한 게임을 바탕으로 한 AI 예측이에요. 잘 맞는 정도는 이번 추천 목록 안의 순위로 나눴어요.
      </p>
    </Panel>
  )
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
  // 카드마다 잘 맞는 정도와 이유를 붙인다
  const cards = useMemo(() => {
    const taste = tasteGenres(games)
    return games.map((game, index) => ({ game, match: matchLevel(index, games.length), reason: reasonFor(game, taste) }))
  }, [games])
  const tags = useMemo(() => tasteGenres(games, TAG_COUNT), [games])
  const showLists = diagnosed && !error && !noPlayed && cards.length > TOP_COUNT

  let body
  if (!diagnosed) {
    body = (
      <div className="flex flex-col gap-[20px]">
        <div>
          <strong className="block text-[18px]">AI가 내 취향에 맞는 게임을 골라 드려요</strong>
          <p className="mt-[8px] text-[14px] text-muted leading-[1.6]">플레이한 게임과 플레이시간으로 취향을 계산해, 아직 보유하지 않은 게임 중에서 추천해요.</p>
        </div>
        <Steps />
        <div>
          <button type="button" className="gs-primary-button" onClick={diagnose}>
            추천받기
          </button>
        </div>
      </div>
    )
  } else if (error) {
    body = (
      <div className={noticeClass} role="alert">
        <p>{error}</p>
        <button type="button" className="gs-primary-button" onClick={reload} disabled={loading}>
          다시 시도
        </button>
      </div>
    )
  } else if (noPlayed) {
    body = (
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
  } else if (loading && !data) {
    body = <Analyzing />
  } else if (data && !games.length) {
    body = <EmptyState title="추천할 게임이 없어요" description="잠시 후 다시 추천받아 보세요." />
  } else if (data) {
    body = <Result data={data} games={games} cards={cards} seeds={seeds} loading={loading} />
  }

  return (
    <>
      <section className="rounded-[24px] border border-insight-border bg-insight-bg shadow-[var(--shadow)] p-[32px] max-[600px]:p-[20px] max-[600px]:rounded-[20px] min-w-0">
        <PageHeading
          title="AI 게임 추천"
          description="내가 플레이한 게임의 취향을 분석해, 아직 보유하지 않은 게임을 추천해 드려요."
        />
        <AiBadge />
        {body}
      </section>

      {showLists && <MoreRecommends cards={cards} tags={tags} loading={loading} />}
    </>
  )
}
