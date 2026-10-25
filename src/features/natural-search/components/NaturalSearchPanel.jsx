import { useNaturalSearch } from '../hooks/useNaturalSearch'
import ResultList from './ResultList'
import { SearchMessage, SearchSkeleton } from './SearchStatus'
import SearchForm from './SearchForm'
import UnderstandingSummary from './UnderstandingSummary'

const EXAMPLES = [
  '친구랑 같이 하는 무섭지 않은 협동 서바이벌',
  '힐링되는 잔잔한 농장 경영 게임',
  '스토리가 탄탄한 어두운 분위기의 RPG',
]

// 자연어 검색 화면: 검색창 → (AI가 이해한 내용) → 결과. 상태별 화면 선택만 맡고 세부는 각 컴포넌트가 그린다.
export default function NaturalSearchPanel() {
  const { status, result, error, search } = useNaturalSearch()
  const loading = status === 'loading'

  let body
  if (loading) {
    body = <SearchSkeleton />
  } else if (status === 'error') {
    body = <SearchMessage role="alert" icon="info" title="검색하지 못했어요" description={error} />
  } else if (status === 'idle') {
    body = <SearchMessage icon="spark" title="찾고 싶은 게임을 문장으로 설명해보세요" description="분위기, 함께하는 사람, 싫어하는 요소까지 자유롭게 적어도 돼요." />
  } else if (result.games.length === 0) {
    body = (
      <>
        <UnderstandingSummary understanding={result.understanding} />
        <SearchMessage icon="search" title="조건에 맞는 게임을 찾지 못했어요" description="조금 다르게 표현해서 다시 검색해보세요." />
      </>
    )
  } else {
    body = (
      <>
        <UnderstandingSummary understanding={result.understanding} />
        <ResultList games={result.games} />
      </>
    )
  }

  return (
    <section className="min-w-0" aria-busy={loading}>
      <div className="mb-[28px]">
        <SearchForm onSearch={search} loading={loading} examples={EXAMPLES} />
      </div>
      {body}
    </section>
  )
}
