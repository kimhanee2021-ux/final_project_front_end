// 한 패널의 내용 틀: 작은 제목(eyebrow) → 굵은 한 줄 요약 → 시각화(children).
// headline은 글자 하나이거나 조각 배열(utils/headline.js)이다. 강조 조각만 포인트 색으로 그려서
// 문장 안에서 가장 보여주고 싶은 값에 시선이 가게 한다.
export default function AnalysisPanel({ eyebrow, headline, children }) {
  const parts = Array.isArray(headline) ? headline : [headline]
  return (
    <div>
      {eyebrow && <p className="mb-[10px] text-[14px] font-[650] text-primary-text">{eyebrow}</p>}
      <h2 className="mb-[28px] text-[clamp(24px,2.8vw,32px)] font-[750] tracking-[-1px] leading-[1.5] text-balance">
        {parts.map((part, index) =>
          typeof part === 'string' ? (
            part
          ) : part.lineBreak ? (
            <br key={index} />
          ) : (
            <mark key={index} className="rounded-[8px] bg-primary-soft px-[6px] text-primary-text whitespace-nowrap">
              {part.highlight}
            </mark>
          )
        )}
      </h2>
      {children}
    </div>
  )
}
