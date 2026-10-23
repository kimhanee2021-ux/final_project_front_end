import { pageNumbers } from '../model/newsQuery'

export default function NewsPagination({ page, totalPages, onChange }) {
  if (totalPages < 2 && page === 0) return null
  return <nav className="news-pagination" aria-label="소식 페이지">
    <button type="button" disabled={page === 0} onClick={() => onChange(0)} aria-label="첫 페이지">처음</button>
    <button type="button" disabled={page === 0} onClick={() => onChange(Math.min(page - 1, Math.max(0, totalPages - 1)))} aria-label="이전 페이지">이전</button>
    {pageNumbers(page, totalPages).map(number => <button type="button" key={number} aria-label={`${number + 1}페이지`} aria-current={number === page ? 'page' : undefined} onClick={() => onChange(number)}>{number + 1}</button>)}
    <button type="button" disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)} aria-label="다음 페이지">다음</button>
    <button type="button" disabled={page >= totalPages - 1} onClick={() => onChange(totalPages - 1)} aria-label="마지막 페이지">끝</button>
  </nav>
}
