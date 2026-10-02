export default function Card({ title, subtitle, action, className = '', children }) {
  return <section className={'card ' + className}><div className="card-header"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action}</div>{children}</section>
}
