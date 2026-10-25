import { tagLabel } from '@/shared/utils/gameTags'

function TagRow({ label, tags, tone }) {
  if (!tags.length) return null
  return (
    <div className="flex flex-wrap items-center gap-[6px]">
      <span className="text-[12px] text-faint mr-[2px]">{label}</span>
      {tags.map(tag => (
        <span key={tag} className={`px-[10px] py-[3px] rounded-full text-[12px] ${tone}`}>
          {tagLabel(tag)}
        </span>
      ))}
    </div>
  )
}

// AI가 검색어를 어떻게 이해했는지("이렇게 이해했어요")를 보여준다.
export default function UnderstandingSummary({ understanding }) {
  const { analyzed, tags, excludeTags, description, similarTo } = understanding
  return (
    <section className="grid gap-[10px] mb-[28px] p-[18px] rounded-[16px] bg-bg" aria-label="AI가 이해한 검색 조건">
      <strong className="text-[14px] font-[650]">AI가 이렇게 이해했어요</strong>
      {analyzed ? (
        <>
          <TagRow label="포함" tags={tags} tone="bg-primary-soft text-primary-text" />
          <TagRow label="제외" tags={excludeTags} tone="bg-surface-soft text-muted line-through" />
          {similarTo && <p className="text-[13px] text-muted">비슷한 게임: {similarTo}</p>}
          {description && <p className="text-[13px] text-muted leading-[1.6]">{description}</p>}
        </>
      ) : (
        <p className="text-[13px] text-muted leading-[1.6]">
          AI가 검색어를 분석하지 못해 입력한 문장 그대로 검색했어요. 결과가 정확하지 않을 수 있어요.
        </p>
      )}
    </section>
  )
}
