import { AnalysisPanel, GSIcon } from '@/shared/ui'
import { br, hl } from '@/shared/utils/headline'
import { tagLabel } from '@/shared/utils/gameTags'
import { tasteGenres } from '../../model/recommendation'
import { TOP_COUNT } from '../../model/recommendLayout'
import CoverCard from '../cards/CoverCard'
import AnalysisStats from './AnalysisStats'
import GenreShares from './GenreShares'
import ResultBadge from './ResultBadge'
import SeedGames from './SeedGames'

// 추천 결과: 위쪽 왼쪽에 AI가 읽은 취향, 오른쪽에 그 근거(AI가 참고한 게임). 그 아래 "그래서 추천한" TOP 3를 크게.
export default function RecommendResult({ data, games, cards, seeds, totalHours, loading }) {
  const taste = tasteGenres(games)
  const top = cards.slice(0, TOP_COUNT)
  const tasteText = taste.slice(0, 2).map(tagLabel).join(' · ')
  return (
    <div className={`transition-opacity ${loading ? 'opacity-50' : ''}`}>
      {/* 2칸: 왼쪽은 배지 줄 → 헤드라인 → 장르 비중 카드, 오른쪽은 분석 요약 숫자 → AI가 참고한 게임 카드.
          두 칸의 아래 끝을 맞춰 두 카드의 아래쪽 선이 같다 (카드 크기는 각자 내용만큼). 좁은 화면에서는 위아래로 쌓인다. */}
      <div
        className={`grid gap-x-[32px] gap-y-[20px] -mt-[16px] ${
          seeds.length ? 'grid-cols-[minmax(0,1fr)_minmax(300px,400px)] items-end max-[860px]:grid-cols-1' : ''
        }`}
      >
        <div className="flex flex-col gap-[20px] min-w-0">
          <ResultBadge />
          <div className="[&_h2]:!mb-0">
            <AnalysisPanel
              headline={
                tasteText
                  ? ['플레이한 게임 ', hl(`${data.usedGameCount}개`), '를 분석해 보니', br, hl(tasteText), ' 취향이 가장 짙어요.']
                  : ['플레이한 게임 ', hl(`${data.usedGameCount}개`), '로 취향을 분석했어요.']
              }
            />
          </div>
          {taste.length > 0 && <GenreShares games={games} genres={taste} />}
        </div>
        {seeds.length > 0 && (
          <div className="flex flex-col gap-[10px] min-w-0">
            <AnalysisStats
              stats={[
                { label: '분석한 게임', value: data.usedGameCount.toLocaleString('ko-KR'), unit: '개' },
                { label: '총 플레이', value: totalHours.toLocaleString('ko-KR'), unit: '시간' },
                { label: '추천 후보', value: games.length.toLocaleString('ko-KR'), unit: '개' },
              ]}
            />
            <SeedGames games={seeds} />
          </div>
        )}
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
