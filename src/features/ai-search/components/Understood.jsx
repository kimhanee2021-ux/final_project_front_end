import { tagLabel } from '@/shared/utils/gameTags'

function Chip({ children, tone = 'default' }) {
  const color = tone === 'exclude' ? 'bg-bg text-muted line-through' : 'bg-primary/10 text-primary-text'
  return <li className={`px-[12px] py-[4px] rounded-full text-[13px] font-[600] ${color}`}>{children}</li>
}

// AI가 문장을 어떻게 이해했는지: 찾은 태그 · 뺀 태그 · 기준 게임. 결과가 마음에 안 들면 문장을 고칠 단서가 된다.
export default function Understood({ result }) {
  const tags = result.tags.filter(tag => !result.ignoredTags.includes(tag))
  if (!tags.length && !result.excludeTags.length && !result.similarTo) return null
  return (
    <div className="flex flex-wrap items-center gap-[8px]">
      <span className="text-[13px] font-[650] text-muted mr-[4px]">AI가 이렇게 찾았어요</span>
      <ul className="list-none m-0 p-0 flex flex-wrap gap-[6px]">
        {result.similarTo && <Chip>{result.similarTo} 같은 게임</Chip>}
        {tags.map(tag => <Chip key={tag}>{tagLabel(tag)}</Chip>)}
        {result.excludeTags.map(tag => <Chip key={tag} tone="exclude">{tagLabel(tag)}</Chip>)}
      </ul>
    </div>
  )
}
