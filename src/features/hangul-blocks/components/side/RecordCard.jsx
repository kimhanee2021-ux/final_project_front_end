// 이 모드의 최고 점수 (일일 챌린지면 오늘 기록만)
export default function RecordCard({ mode, best, saveError }) {
  return (
    <div className="hb-card"><h2>{mode === 'daily' ? '오늘의' : '나의'} 최고 점수</h2><strong className="hb-record">{best.toLocaleString()}</strong><p>이 브라우저에 저장되는 개인 기록입니다.</p>{saveError && <p role="alert">브라우저 저장 공간을 사용할 수 없어 기록을 저장하지 못했어요.</p>}</div>
  )
}
