// 카드 대신 제목 + 내용만 있는 구역. 구역끼리는 부모의 여백과 구분선으로 나눈다.
export default function Card({ title, subtitle, action, className = '', children }) {
  return (
    <section className={`min-w-0 ${className}`}>
      <div className="flex justify-between gap-[12px] items-start">
        <div>
          <h2 className="text-[20px] font-[700] tracking-[-0.5px]">{title}</h2>
          {subtitle && <p className="text-muted text-[13px] mt-[6px]">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}
