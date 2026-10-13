import { useState } from 'react';
export default function GameCard({
  game,
  onChoose,
  disabled,
  compact = false
}) {
  const [broken, setBroken] = useState(false);
  return <article className={`wc-game ${compact ? 'wc-compact' : ''}`}>
    <div className="wc-cover">{broken ? <span>이미지를 불러오지 못했어요<br />{game.name}</span> : <img src={game.imageUrl} alt={game.name} onError={() => setBroken(true)} loading={compact ? 'lazy' : 'eager'} />}</div>
    <div className="wc-game-body"><div className="wc-tags">{game.tags.slice(0, 4).map(t => <span key={t}>{t}</span>)}</div>
      <h2>{game.name}</h2><p className="wc-description">{game.description}</p>
      {!compact && <button className="wc-primary" disabled={disabled} onClick={onChoose}>이 게임이 더 좋아요</button>}
      <details><summary>게임 정보와 출처</summary><p>출시: {game.releasedAt}<br />리뷰 {game.reviewCount.toLocaleString()}개 · 수집 당시 동시접속 {game.currentPlayers?.toLocaleString() ?? '확인 불가'}명</p><p>리뷰 작성자 {game.sampleSize}명 표본의 플레이 시간 중앙값 {game.sampleMedianHours}시간. 전체 이용자의 기록이나 나의 플레이 시간이 아닙니다.</p><a href={game.source} target="_blank" rel="noreferrer">Steam에서 확인 ↗</a></details>
    </div>
  </article>;
}
