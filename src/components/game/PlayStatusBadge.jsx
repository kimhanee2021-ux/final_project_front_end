export default function PlayStatusBadge({ hours }) {
  return <span className={'status-badge ' + (hours === 0 ? 'unplayed' : '')}>{hours == null ? '시간 미확인' : hours === 0 ? '미플레이' : '플레이 기록 있음'}</span>
}
