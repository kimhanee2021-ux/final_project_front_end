import { GSIcon } from '@/shared/ui'

// 추천 새로 받기: 섹션 제목 줄 오른쪽 끝에 둔다
export default function Reanalyze({ loading, onReload }) {
  return (
    <p className="text-[13px]">
      <button
        type="button"
        className="inline-flex items-center gap-[4px] font-[650] text-primary-text hover:underline disabled:opacity-50 disabled:no-underline"
        onClick={onReload}
        disabled={loading}
      >
        {loading ? 'AI가 다시 분석하는 중...' : '추천 새로 받기'}
        {!loading && <GSIcon name="refresh" size={13} />}
      </button>
    </p>
  )
}
