import GSIcon from '../icons/GSIcon'

// 카드 대신 제목 + 내용만 있는 구역. 구역끼리는 부모의 여백과 구분선으로 나눈다. icon을 주면 제목 앞에 보라 아이콘을 붙인다.
export default function Card({ title, subtitle, icon, action, className = '', children }) {
  return (
    <section className={`min-w-0 ${className}`}>
      <div className="flex justify-between gap-[12px] items-start">
        <div>
          <h2 className="flex items-center gap-[8px] text-[20px] font-[700] tracking-[-0.5px]">
            {icon && <GSIcon name={icon} size={20} className="shrink-0 text-primary-text" />}
            {title}
          </h2>
          {subtitle && <p className="text-muted text-[13px] mt-[6px]">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}
