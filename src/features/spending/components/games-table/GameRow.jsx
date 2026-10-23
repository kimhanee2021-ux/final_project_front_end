import { dateLabel } from '@/shared/utils/formatters'
import GameIdentity from '../GameIdentity'
import PlaytimeCell from './PlaytimeCell'
import { amountText } from '../../model/amountText'
import { hourlyText, hourlyTone } from '../../model/spendingMetrics'

const BADGE = 'inline-block ml-[6px] px-[8px] py-[2px] rounded-full bg-bg text-[11px] font-medium text-muted align-middle'
// 시간당 비용 알약 색: 쌀수록 초록, 비쌀수록 복숭아색 (AI 분석 '게임 가성비' 구간과 같은 기준)
const HOURLY_TONES = {
  great: 'bg-mint-bg text-mint-text',
  good: 'bg-primary-soft text-primary-text',
  fair: 'bg-bg text-text',
  poor: 'bg-peach-bg text-peach-text',
}
// 칸 공통: 넓은 화면은 표 칸, 좁은 화면(580px 이하)은 두 칸짜리 카드 안의 항목
const CELL = 'px-[10px] py-[16px] max-[580px]:border-0 max-[580px]:p-0 max-[580px]:text-[14px]'
// 좁은 화면에서 값 위에 붙는 작은 항목 이름 (이름 자체는 칸마다 content-[...]로 준다)
const CELL_LABEL = 'max-[580px]:before:block max-[580px]:before:text-muted max-[580px]:before:text-[12px] max-[580px]:before:font-normal max-[580px]:before:mb-[3px]'

// 구매 금액 칸: 금액 + 추정·번들·DLC·환불 표시
function AmountCell({ game, needsHistory }) {
  if (needsHistory) return <span className="font-normal text-faint">확인 필요</span>
  return (
    <>
      {amountText(game)}
      {game.amountSource === 'ESTIMATED' && <span className={BADGE}>추정</span>}
      {game.bundleAllocated && <span className={BADGE}>번들 배분</span>}
      {game.dlcCount > 0 && <span className={BADGE}>DLC {game.dlcCount}</span>}
      {game.refund > 0 && <span className={BADGE}>환불 반영</span>}
    </>
  )
}

// 날짜 칸: 구매일(없으면 계정에 추가한 날) 또는 최근 플레이
function dateText(game, hasPurchaseDates) {
  if (hasPurchaseDates) {
    if (game.purchasedAt) return dateLabel(game.purchasedAt)
    return game.acquiredAt ? dateLabel(game.acquiredAt) + ' 획득' : '-'
  }
  return game.lastPlayedAt ? dateLabel(game.lastPlayedAt) : '기록 없음'
}

// 시간당 비용 칸: 계산할 수 있으면 가성비 구간 색 알약, 아니면 흐린 글자
function HourlyCell({ game, needsHistory }) {
  if (needsHistory) return <span className="text-faint">확인 필요</span>
  const tone = hourlyTone(game)
  if (!tone) return <span className="text-muted">{hourlyText(game)}</span>
  return (
    <span className={`inline-block px-[10px] py-[3px] rounded-full text-[13px] font-[650] tabular-nums whitespace-nowrap ${HOURLY_TONES[tone]}`}>
      {hourlyText(game)}
    </span>
  )
}

// 보유 게임 표의 한 줄. last가 아니면 아래 구분선을 긋는다.
export default function GameRow({ game, last, hasPurchaseDates, needsHistory, maxHours, onSelect }) {
  return (
    <tr
      className={`transition-colors [&:hover_td]:bg-surface-soft max-[580px]:grid max-[580px]:grid-cols-2 max-[580px]:gap-[10px] max-[580px]:py-[17px] max-[580px]:border-t max-[580px]:border-border ${last ? '' : '[&_td]:border-b [&_td]:border-border max-[580px]:[&_td]:border-b-0'}`}
    >
      <td className={`${CELL} max-[580px]:[grid-column:1/-1] max-[580px]:mb-[3px]`}>
        <button className="bg-transparent p-0 text-left rounded-[6px]" onClick={() => onSelect(game)}>
          <GameIdentity game={game} />
        </button>
      </td>
      <td className={`${CELL} ${CELL_LABEL} font-[650] tabular-nums max-[580px]:before:content-['구매_금액']`}>
        <AmountCell game={game} needsHistory={needsHistory} />
      </td>
      <td className={`${CELL} ${CELL_LABEL} text-muted ${hasPurchaseDates ? "max-[580px]:before:content-['구매일']" : "max-[580px]:before:content-['최근_플레이']"}`}>
        {dateText(game, hasPurchaseDates)}
      </td>
      <td className={`${CELL} ${CELL_LABEL} max-[580px]:before:content-['플레이_시간']`}>
        <PlaytimeCell hours={game.hours} maxHours={maxHours} />
      </td>
      <td className={`${CELL} ${CELL_LABEL} max-[580px]:before:content-['시간당_비용']`}>
        <HourlyCell game={game} needsHistory={needsHistory} />
      </td>
    </tr>
  )
}
