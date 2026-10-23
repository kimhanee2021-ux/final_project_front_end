// 큰 숫자는 왼쪽, 그 숫자를 설명하는 막대는 오른쪽에 나란히 둔다.
// 숫자만 던지지 않고 패널 제목 문장이 해석을 같이 준다.
export default function NumberWithBars({ number, children }) {
  return (
    <div className="grid grid-cols-[1fr_1.6fr] gap-[48px] items-end max-[900px]:grid-cols-1 max-[900px]:gap-[28px]">
      <p className="text-[clamp(44px,6vw,72px)] font-[800] tracking-[-3px] leading-none text-text">{number}</p>
      {children}
    </div>
  )
}
