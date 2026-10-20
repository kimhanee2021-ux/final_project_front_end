// 패널 박스 하나 = 기능 하나. 둥근 흰 박스에 제목 → 요약 → 시각화만 담고, 높이는 내용만큼이다.
export default function Panel({ id, className = '', children }) {
  return (
    <section
      id={id}
      className={`scroll-mt-[92px] bg-surface rounded-[24px] shadow-[var(--shadow)] p-[32px] max-[600px]:p-[20px] max-[600px]:rounded-[20px] ${className}`}
    >
      {children}
    </section>
  )
}
