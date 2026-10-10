import GSIcon from '../../../components/common/GSIcon'

export default function HardwareCard({ item }) {
  return (
    <article
      className={`pc-hardware-card pc-hardware-${item.id}`}
      aria-label={`${item.name} 예시 사양`}
    >
      <div className="pc-hardware-title">
        <span className={`pc-icon-tile ${item.id === 'cpu' ? 'pc-blue' : ''}`}>
          <GSIcon name={item.id} size={26} />
        </span>
        <div>
          <h3>{item.name}</h3>
          <p>{item.model}</p>
        </div>
      </div>
      <div className="pc-usage-label">
        <strong>
          {item.usage}
          <span>%</span>
        </strong>
        <span>사용률 · 예시</span>
      </div>
      <div
        className="pc-meter"
        role="meter"
        aria-label={`${item.name} 예시 사용률`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={item.usage}
      >
        <span style={{ width: `${item.usage}%` }} />
      </div>
      <ul className="pc-hardware-facts">
        {item.facts.map(([icon, text]) => (
          <li key={text}>
            <GSIcon name={icon} size={16} className={icon === 'check' ? 'pc-mint' : ''} />
            {text}
          </li>
        ))}
      </ul>
    </article>
  )
}
