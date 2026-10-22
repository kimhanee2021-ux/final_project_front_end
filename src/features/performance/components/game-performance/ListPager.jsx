// 보유게임 전체 보기의 페이지 넘기기
export default function ListPager({ listing, onPrev, onNext }) {
  return (
    <div className="flex items-center justify-center gap-[12px] mt-[16px] text-[13px] text-muted">
      <button
        type="button"
        className="gs-secondary-button"
        disabled={listing.page === 0}
        onClick={onPrev}
      >
        이전
      </button>
      <span>
        {listing.page + 1} / {listing.pages}
      </span>
      <button
        type="button"
        className="gs-secondary-button"
        disabled={listing.page + 1 === listing.pages}
        onClick={onNext}
      >
        다음
      </button>
    </div>
  )
}
