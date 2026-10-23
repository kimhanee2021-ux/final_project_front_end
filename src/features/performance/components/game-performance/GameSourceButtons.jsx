import { GSIcon } from '@/shared/ui'

// 표에 올릴 게임 고르기: 내 보유게임 / 다른 게임 검색
export default function GameSourceButtons({ gameList }) {
  const { showSearch, loading } = gameList
  return (
    <div className="flex flex-wrap items-center justify-between gap-[12px] mb-[16px] text-[13px] text-muted">
      <p className="text-[13px] text-muted">선택한 평가 기준의 등급을 보여줘요.</p>
      <div className="flex flex-wrap items-center gap-[8px]">
        <button
          type="button"
          className="gs-secondary-button"
          aria-pressed={!showSearch}
          disabled={loading}
          onClick={gameList.showOwned}
        >
          <GSIcon name="library" size={15} />
          {loading && !showSearch ? '불러오는 중…' : '내 보유게임 가져오기'}
        </button>
        <button type="button" className="gs-secondary-button" aria-pressed={showSearch} onClick={gameList.openSearch}>
          <GSIcon name="search" size={15} />
          다른 게임도 확인해보기
        </button>
      </div>
    </div>
  )
}
