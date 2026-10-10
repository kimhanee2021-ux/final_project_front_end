import GSIcon from '../../components/discover/GSIcon'
import { activityAppearance } from '../../mocks/playerMock'

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

export default function ActivityTimeline({ activities }) {
  if (!activities.length) return <p className="mp-empty-records">아직 이 종류의 기록이 없어요.</p>
  return (
    <ol className="mp-timeline">
      {activities.map(item => {
        const appearance = activityAppearance[item.type] || activityAppearance.profile
        return (
          <li key={item.id}>
            <span className={`mp-event-icon mp-${appearance.tone}`}>
              <GSIcon name={appearance.icon} size={18} />
            </span>
            <div className="mp-event-description">
              <strong>{item.title}</strong>
              <p>{item.description}</p>
            </div>
            <time dateTime={item.date}>
              <span>{dateFormat.format(new Date(item.date))}</span>
              <small>{timeFormat.format(new Date(item.date))}</small>
            </time>
          </li>
        )
      })}
    </ol>
  )
}
