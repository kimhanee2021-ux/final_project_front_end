import GSIcon from '../../../components/common/GSIcon'

export default function PanelHeading({ icon, title, subtitle, action, gold = false }) {
  return (
    <div className="pc-panel-heading">
      <GSIcon name={icon} className={gold ? 'pc-gold' : ''} size={23} />
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
