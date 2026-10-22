import { dropInterval, stageTarget } from '../../model/engine'

// 단계 · 목표 줄 수 · 점수 · 낙하 속도 · 시작 배치
export default function StatsCard({ game }) {
  return (
    <div className="hb-card hb-stats"><span>STAGE</span><strong>{game.stage}<small> / 50</small></strong><p>목표 <b>{stageTarget(game.stage)}줄</b> · 제거 <b>{game.lines}줄</b></p><progress max={stageTarget(game.stage)} value={Math.min(game.lines, stageTarget(game.stage))} /><dl><div><dt>점수</dt><dd>{game.score.toLocaleString()}</dd></div><div><dt>낙하 속도</dt><dd>{(dropInterval(game.stage) / 1000).toFixed(2)}초 / 칸</dd></div><div><dt>시작 배치</dt><dd>{game.template + 1} / 10</dd></div></dl></div>
  )
}
