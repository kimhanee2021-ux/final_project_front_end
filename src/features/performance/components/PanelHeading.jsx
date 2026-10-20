import { GSIcon } from '@/shared/ui'

export default function PanelHeading({ icon, title, subtitle, action, gold = false }) {
  return (
    <div className="pcd-panel-heading">
      <GSIcon name={icon} className={gold ? 'pcd-gold' : ''} size={23} />
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
