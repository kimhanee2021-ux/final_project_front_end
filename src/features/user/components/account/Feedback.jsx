

// 동작 결과 한 줄 (오류면 빨간 글자로 읽어 준다)
export default function Feedback({ result }) {
  if (!result) return null
  return (
    <p
      className={`basis-full text-[13px] text-muted ${result.error ? 'text-[#e5484d]' : ''}`}
      role={result.error ? 'alert' : 'status'}
    >
      {result.text}
    </p>
  )
}
