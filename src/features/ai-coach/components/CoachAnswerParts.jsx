import { GSIcon } from '@/shared/ui'
import { barPercent, buildEvidenceBlocks } from '../coachModel'

// 답변에서 AI가 권하는 내 보유 게임 카드
export function GameCards({ games }) {
  if (!games?.length) return null
  return (
    <ul className="list-none m-0 mt-[10px] p-0 grid gap-[8px]" aria-label="코치가 추천한 내 게임">
      {games.map(game => (
        <li key={game.appId} className="flex items-center gap-[12px] p-[8px] rounded-[10px] bg-surface border border-border">
          {game.thumbnailUrl ? (
            <img src={game.thumbnailUrl} alt="" className="w-[92px] h-[43px] rounded-[6px] object-cover shrink-0" />
          ) : (
            <span className="w-[92px] h-[43px] rounded-[6px] bg-surface-soft shrink-0" />
          )}
          <div className="min-w-0">
            <strong className="block text-[12px] truncate">{game.name}</strong>
            <span className="block text-[11px] text-muted leading-[1.5]">{game.reason}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}

// 답변에 쓰인 숫자의 원래 값. AI가 숫자를 지어내지 않고 소비 분석 데이터를 그대로 썼다는 걸 직접 확인할 수 있게 한다
function BarRow({ item, percent }) {
  return (
    <div>
      <div className="flex justify-between gap-[16px]">
        <span>{item.label}</span>
        <span className="font-[650] text-text tabular-nums whitespace-nowrap">{item.value}</span>
      </div>
      <div className="mt-[3px] h-[6px] rounded-full bg-surface-soft overflow-hidden" role="img" aria-label={`${item.label} ${item.value}`}>
        <div className="h-full rounded-full bg-primary" style={{ width: percent + '%' }} />
      </div>
    </div>
  )
}

// 답변에 쓰인 숫자의 근거("근거 보기"): 같은 종류끼리는 막대로 비교한다
export function Evidence({ items }) {
  if (!items?.length) return null
  const blocks = buildEvidenceBlocks(items)
  return (
    <details className="mt-[8px] text-[11px] text-muted group">
      <summary className="cursor-pointer select-none inline-flex items-center gap-[4px] hover:text-text">
        <GSIcon name="info" size={13} />근거 보기 ({items.length})
      </summary>
      <div className="mt-[8px] grid gap-[10px] rounded-[10px] border border-border bg-surface px-[12px] py-[10px]">
        {blocks.map((block, index) => {
          if (block.type === 'chart') {
            return (
              <div key={index} className="grid gap-[8px]">
                {block.items.map(item => (
                  <BarRow key={item.label} item={item} percent={barPercent(item.amount, block.unit, block.items)} />
                ))}
              </div>
            )
          }
          if (block.type === 'bar') {
            return <BarRow key={index} item={block.item} percent={barPercent(block.item.amount, '%')} />
          }
          return (
            <div key={index} className="flex justify-between gap-[16px]">
              <span>{block.item.label}</span>
              <span className="font-[650] text-text tabular-nums whitespace-nowrap">{block.item.value}</span>
            </div>
          )
        })}
      </div>
    </details>
  )
}
