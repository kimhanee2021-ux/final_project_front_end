export default function ProfileLoading() {
  return (
    <div role="status" aria-live="polite">
      <div className="h-[56px] w-[60%] rounded-[12px] bg-surface animate-[pulse_1.4s_infinite_alternate]" aria-hidden="true" />
      <p className="mt-[16px] text-[13px] text-muted">내 게임 소비 유형을 계산하고 있어요...</p>
    </div>
  )
}
