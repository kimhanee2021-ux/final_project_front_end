export default function ErrorState({ onRetry }) {
  return (
    <div className="flex items-center justify-center flex-col gap-[12px] px-[20px] py-[42px] text-muted text-center" role="alert">
      <strong className="text-text text-[14px]">데이터를 불러오지 못했어요</strong>
      <p className="text-[12px]">잠시 후 다시 시도해 주세요.</p>
      <button className="px-[16px] py-[10px] bg-primary text-bg rounded-[7px]" onClick={onRetry}>
        다시 시도
      </button>
    </div>
  )
}
