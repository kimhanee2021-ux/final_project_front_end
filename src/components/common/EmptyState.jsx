import Icon from './Icon'
export default function EmptyState({ title = '아직 기록이 없어요', description = '다른 조회 기간을 선택해 보세요.', action }) { return <div className="empty-state"><Icon name="library" size={28} /><strong>{title}</strong><p>{description}</p>{action}</div> }
