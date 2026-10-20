// 모든 페이지 맨 위 제목. 제목 하나, 설명 한 줄, 오른쪽에는 이 화면의 도구(action)만 둔다.
export default function PageHeading({ title, description, action, id }) {
  return (
    <div className="flex items-end justify-between gap-[16px] mb-[36px] max-[600px]:flex-col max-[600px]:items-start">
      <div className="min-w-0">
        <h1 id={id} className="!m-0 text-[30px] font-[750] tracking-[-1px] leading-[1.3] max-[600px]:text-[26px]">{title}</h1>
        {description && <p className="mt-[8px] text-[14px] text-muted leading-[1.6]">{description}</p>}
      </div>
      {action}
    </div>
  )
}
