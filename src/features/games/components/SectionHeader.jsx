// 페이지 안의 구역 제목 줄(제목 · 개수 · 설명).
export default function SectionHeader({ id, title, count, description }) {
  return (
    <div className="mb-[24px]">
      <h2 className="text-[22px] font-[700] tracking-[-0.6px] leading-[1.3]" id={id}>
        {title}
        {count != null && <span className="ml-[10px] text-[15px] font-[500] text-faint">{count.toLocaleString()}</span>}
      </h2>
      <p className="text-muted text-[14px] mt-[6px]">{description}</p>
    </div>
  )
}
