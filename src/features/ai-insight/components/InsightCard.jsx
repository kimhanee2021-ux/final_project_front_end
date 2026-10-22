import { insightRows } from '../insightModel'

// 다음 행동에서 AI가 권하는 내 보유 게임
function RecommendedGames({ games }) {
  if (!games?.length) return null
  return (
    <ul className="list-none m-0 mt-[12px] p-0 grid gap-[8px]" aria-label="AI가 권하는 내 보유 게임">
      {games.map(game => (
        <li key={game.appId} className="flex items-center gap-[12px] p-[8px] rounded-[10px] bg-bg">
          {game.thumbnailUrl ? (
            <img src={game.thumbnailUrl} alt="" className="w-[92px] h-[43px] rounded-[6px] object-cover shrink-0" />
          ) : (
            <span className="w-[92px] h-[43px] rounded-[6px] bg-surface-soft shrink-0" />
          )}
          <div className="min-w-0">
            <strong className="block text-[13px] truncate">{game.name}</strong>
            <span className="block text-[12px] text-muted leading-[1.5]">{game.reason}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}

// AI 결과 카드: 판단을 가장 크게, 그 아래에 이유 · 비교 · 다음 행동, 마지막에 문장에 쓰인 숫자의 근거 칩.
export default function InsightCard({ insight }) {
  return (
    <article className="rounded-[20px] bg-surface p-[24px] max-[600px]:p-[18px]">
      <p className="text-[12px] font-[700] text-primary-text">판단</p>
      <p className="mt-[4px] text-[clamp(20px,2.4vw,26px)] font-[750] tracking-[-0.6px] leading-[1.5] text-balance">{insight.verdict}</p>
      <dl className="grid gap-[14px] mt-[20px]">
        {insightRows(insight).map(row => (
          <div key={row.id} className="grid grid-cols-[72px_1fr] gap-[12px] max-[600px]:grid-cols-1 max-[600px]:gap-[2px]">
            <dt className="text-[12px] font-[700] text-primary-text pt-[3px]">{row.label}</dt>
            <dd className="m-0 text-[14px] leading-[1.7]">
              {row.text}
              {row.id === 'action' && <RecommendedGames games={insight.games} />}
            </dd>
          </div>
        ))}
      </dl>
      {insight.evidence?.length > 0 && (
        <ul className="list-none m-0 mt-[20px] p-0 flex flex-wrap gap-[8px]" aria-label="AI 분석에 쓰인 숫자">
          {insight.evidence.map(item => (
            <li key={item.label} className="inline-flex items-baseline gap-[8px] px-[14px] py-[6px] rounded-full bg-bg text-[13px]">
              <span className="text-muted">{item.label}</span>
              <strong className="tabular-nums">{item.value}</strong>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
