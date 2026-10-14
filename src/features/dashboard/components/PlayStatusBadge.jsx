export default function PlayStatusBadge({ hours }) {
  const unplayed = hours === 0
  return (
    <span className={`text-[9px] rounded-[5px] px-[7px] py-[4px] ${unplayed ? 'text-peach-text bg-peach-bg' : 'text-mint-text bg-mint-bg'}`}>
      {hours == null ? '시간 미확인' : unplayed ? '미플레이' : '플레이 기록 있음'}
    </span>
  )
}
