import { GSIcon } from '@/shared/ui'
import { STEAM_TOP_GAMES_CHECKED_AT } from '../../model/steamTopGames'

// 표 위 한 줄: 검색 모드면 검색 결과 수(또는 판매 순위 안내), 보유게임이면 정렬 기준·개수와 전체 보기 버튼
export default function ListingSummary({ gameList }) {
  const { games, listing, showSearch, expanded, searched } = gameList
  return (
    <>
      {showSearch && games.length > 0 && (
        <p className="mb-[12px] text-[13px] text-muted">
          {searched.length
            ? `검색한 게임 · ${searched.length}개`
            : `스팀 전체 판매 순위 상위 ${games.length}개 (${STEAM_TOP_GAMES_CHECKED_AT} 기준) · 게임 이름을 검색해서 다른 게임도 분석할 수 있어요`}
        </p>
      )}
      {!showSearch && listing.total > 0 && (
        <div className="flex items-center justify-between gap-[12px] mb-[12px] text-[13px] text-muted">
          <span>
            {listing.hasPlaytime ? '플레이시간 상위 순' : '플레이시간 기록 없음 · 이름순'} · {listing.total}개
          </span>
          {listing.total > 5 && (
            <button
              type="button"
              className="inline-flex items-center gap-[6px] bg-transparent text-muted hover:text-text"
              aria-expanded={expanded}
              onClick={gameList.toggleExpanded}
            >
              {expanded ? '접기' : '전체 보기'}
              <GSIcon name="arrow" size={15} />
            </button>
          )}
        </div>
      )}
    </>
  )
}
