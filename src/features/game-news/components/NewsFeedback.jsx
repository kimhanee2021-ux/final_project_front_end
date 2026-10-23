import { GSIcon } from '@/shared/ui'

export default function NewsFeedback({ loading, error, onRetry, title }) {
  if (loading) return <div className="news-feedback" role="status"><GSIcon name="clock" size={24} /><p>브리핑을 불러오고 있어요.</p></div>
  return <div className="news-feedback" role="alert">
    <GSIcon name="info" size={24} /><strong>{title || '소식을 불러오지 못했어요'}</strong><p>{error}</p>
    {onRetry && <button type="button" className="news-button" onClick={onRetry}>다시 시도</button>}
  </div>
}
