export default function Card({ title, subtitle, action, className = '', children }) {
  return (
    <section className={`bg-surface border border-border rounded-[15px] p-[24px] shadow-[var(--shadow)] min-w-0 min-[1600px]:p-[28px] max-[1000px]:p-[20px] ${className}`}>
      <div className="flex justify-between gap-[12px] items-start">
        <div>
          <h2 className="text-[15px] font-bold tracking-[-0.4px]">{title}</h2>
          {subtitle && <p className="text-muted text-[10px] mt-[5px]">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}
