export default function ErrorState({ onRetry }) {
  return (
    <div className="empty-state" role="alert">
      <strong>데이터를 불러오지 못했어요</strong>
      <p>잠시 후 다시 시도해 주세요.</p>
      <button className="primary-button" onClick={onRetry}>
        다시 시도
      </button>
    </div>
  )
}
