

// 넓은 화면 왼쪽 안내 (단계 이름 · 큰 제목 · 설명)
export default function Intro({ eyebrow, title, children }) {
  return (
    <section className="auth-enter-copy max-[900px]:hidden" aria-label="안내">
      <p className="text-[#b9d5c5] text-[11px] font-[600] tracking-[3px]">{eyebrow}</p>
      <h2 className="mt-[22px] text-[clamp(34px,4vw,60px)] font-[400] leading-[1.35] tracking-[-2.6px] break-keep text-[#e8ece6] [text-shadow:0_2px_22px_#10171b55]">{title}</h2>
      <div className="mt-[24px] text-[14px] font-[300] leading-[2] text-[#d5ded6] break-keep">{children}</div>
    </section>
  )
}
