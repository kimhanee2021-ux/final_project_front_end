import GSIcon from './GSIcon'
export default function StatCard({ label, value, icon, tone, note, tag }) {
  return (
    <section className="stat-card">
      <div className="stat-top">
        <span className={'stat-icon ' + tone}>
          <GSIcon name={icon} size={21} />
        </span>
        <span className="stat-tag">{tag}</span>
      </div>
      <p className="stat-label">{label}</p>
      <strong className="stat-value">{value}</strong>
      <p className="stat-note">{note}</p>
    </section>
  )
}
