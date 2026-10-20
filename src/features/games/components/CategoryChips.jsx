import { FilterChips } from '@/shared/ui'

// 트렌드 카테고리를 고르는 가로 스크롤 칩 목록.
export default function CategoryChips({ categories, activeKey, onSelect }) {
  const options = categories.map(category => ({ key: category.key, label: category.name }))
  return <FilterChips label="카테고리" options={options} activeKey={activeKey} onSelect={onSelect} className="mb-[28px]" />
}
