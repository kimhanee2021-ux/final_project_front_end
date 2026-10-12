import GSIcon from '../../../components/common/GSIcon'
import { activityAppearance } from '../mocks/playerMock'

const dateFormat = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})
const timeFormat = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  hour: 'numeric',
  minute: '2-digit',
})

// size="large"는 HistoryView(전체 기록 다이얼로그)에서 쓴다. 이전엔
// ".mp-history-view .mp-event-description strong" 같은 CSS 컨텍스트 선택자로
// 글자 크기를 바꿨는데, prop으로 직접 받는 쪽이 더 명확하다.
export default function ActivityTimeline({ activities, size = 'default' }) {
  const large = size === 'large'
  if (!activities.length)
    return <p className="text-center text-muted text-[13px] py-[35px] px-[15px]">아직 이 종류의 기록이 없어요.</p>
  return (
    <ol className="list-none pl-[19px] relative max-[480px]:pl-[10px] before:content-[''] before:absolute before:left-[10px] before:top-[19px] before:bottom-[28px] before:w-[1px] before:bg-[linear-gradient(#1ad9bd,#205452)] max-[480px]:before:left-[3px]">
      {activities.map((item, index) => {
        const appearance = activityAppearance[item.type] || activityAppearance.profile
        const isLast = index === activities.length - 1
        return (
          <li
            key={item.id}
            className={`flex items-center gap-[12px] relative py-[12px] pl-[16px] min-w-0 min-[1750px]:py-[13px] max-[1200px]:min-h-[67px] max-[480px]:grid max-[480px]:grid-cols-[30px_minmax(0,1fr)] max-[480px]:gap-[3px_9px] max-[480px]:py-[11px] max-[480px]:pl-[8px] before:content-[''] before:absolute before:w-[7px] before:h-[7px] before:rounded-full before:left-[-12px] before:top-[26px] before:bg-[#34e8c3] before:shadow-[0_0_9px_#30d6b31f] max-[480px]:before:left-[-9px] max-[480px]:before:w-[5px] max-[480px]:before:h-[5px] max-[480px]:before:top-[24px] ${isLast ? '' : "after:content-[''] after:absolute after:left-[60px] after:right-0 after:bottom-0 after:border-b after:border-dashed after:border-border max-[480px]:after:left-[46px]"}`}
          >
            <span className={`mp-${appearance.tone} w-[33px] h-[33px] shrink-0 grid place-items-center border border-[color-mix(in_srgb,var(--mp-tone)_34%,transparent)] bg-[color-mix(in_srgb,var(--mp-tone)_10%,transparent)] text-[var(--mp-tone)] rounded-[10px] max-[480px]:[grid-row:1/3] max-[480px]:w-[30px] max-[480px]:h-[31px] max-[480px]:self-start max-[480px]:rounded-[9px]`}>
              <GSIcon name={appearance.icon} size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <strong
                className={`block font-semibold leading-[1.6] [overflow-wrap:anywhere] ${large ? 'text-[12px]' : 'text-[10px] min-[1750px]:text-[11px] max-[1200px]:text-[12px] max-[700px]:text-[11px]'}`}
              >
                {item.title}
              </strong>
              <p
                className={`text-muted leading-[1.6] mt-[1px] [overflow-wrap:anywhere] ${large ? 'text-[11px]' : 'text-[9px] max-[1200px]:text-[11px] max-[700px]:text-[10px] max-[480px]:leading-[1.7]'}`}
              >
                {item.description}
              </p>
            </div>
            <time
              className="text-muted text-right flex flex-col gap-[3px] shrink-0 text-[8px] max-[1500px]:max-w-[80px] max-[1200px]:max-w-none max-[1200px]:text-[9px] max-[480px]:flex-row max-[480px]:text-left max-[480px]:gap-[6px] max-[480px]:max-w-none max-[480px]:[grid-column:2] max-[480px]:text-[7px] max-[480px]:mt-[3px]"
              dateTime={item.date}
            >
              <span>{dateFormat.format(new Date(item.date))}</span>
              <small className="text-[8px] max-[480px]:text-[7px]">{timeFormat.format(new Date(item.date))}</small>
            </time>
          </li>
        )
      })}
    </ol>
  )
}
