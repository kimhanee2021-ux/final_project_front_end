import { useState } from 'react'
import { TEXT_BUTTON } from '@/shared/ui'
import { useMySpendingContext } from '@/features/spending'
import { PurchaseImportDialog } from '@/features/purchase-import'
import { PURCHASE_HISTORY_HINT, defaultTopic } from '../../model/insightModel'
import { useInsightOverview } from '../../hooks/useInsightOverview'
import ProfileCard from '../ProfileCard'
import TopicTags from '../TopicTags'
import TopicResult, { Failure } from '../TopicResult'
import VisualSkeleton from '../VisualSkeleton'
import Heading from './Heading'
import ProfileLoading from './ProfileLoading'

// 위쪽: 왼쪽에 제목 · 소비 유형 · 태그, 오른쪽에 고른 태그에 맞는 시각 데이터(불러오는 동안은 스켈레톤). 왼쪽은 글 내용만큼만 차지하고, 오른쪽 카드가 나머지 폭과 왼쪽 높이를 모두 채워 빈 공간이 남지 않는다.
// 아래쪽: 고른 태그의 AI 결과 카드 (전체 폭).
export default function Analysis({ title, description, renderVisual, ask }) {
  const { status, overview, error, retry } = useInsightOverview()
  const { reload } = useMySpendingContext()
  const [importOpen, setImportOpen] = useState(false)
  const [picked, setPicked] = useState(null)
  const ready = status === 'ready'
  // 고르기 전에는 서버가 알려 준 첫 번째 태그를 보여준다
  const selected = ready ? picked ?? defaultTopic(overview.topics) : null
  return (
    <>
      {/* 오른쪽 최소 폭 440px: 도넛과 범례를 옆으로 나란히 둘 수 있는 폭 */}
      <div className="grid grid-cols-[minmax(0,max-content)_minmax(440px,1fr)] gap-[32px] items-stretch max-[860px]:grid-cols-1">
        <div className="min-w-0">
          <Heading title={title} description={description} />
          {status === 'loading' && <ProfileLoading />}
          {status === 'error' && <Failure message={error} onRetry={retry} />}
          {ready && (
            <>
              <ProfileCard profile={overview.profile} />
              <TopicTags topics={overview.topics} selected={selected} onSelect={setPicked} />
              {!overview.hasPurchaseHistory && (
                <p className="mt-[12px] text-[13px] text-muted">
                  {PURCHASE_HISTORY_HINT}{' '}
                  <button type="button" className={TEXT_BUTTON + ' !py-0 align-baseline'} onClick={() => setImportOpen(true)}>
                    구매내역 가져오는 법 →
                  </button>
                </p>
              )}
            </>
          )}
        </div>
        {status === 'loading' && <VisualSkeleton />}
        {ready && selected && renderVisual?.(selected)}
      </div>
      {ready && selected && (
        <div className="mt-[24px]">
          <TopicResult key={selected} topic={selected} />
        </div>
      )}
      {ready && ask}
      {/* 가져오기가 끝나면 소비 분석을 다시 받아 오므로(화면이 새로 그려진다) 로딩 상태와 상관없이 항상 이 자리에 둔다. */}
      <PurchaseImportDialog open={importOpen} hasHistory={Boolean(overview?.hasPurchaseHistory)} onClose={() => setImportOpen(false)} onImported={reload} />
    </>
  )
}
