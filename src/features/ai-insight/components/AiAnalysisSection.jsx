import { useState } from 'react'
import { GSIcon, PageHeading } from '@/shared/ui'
import { TEXT_BUTTON, useMySpendingContext } from '@/features/spending'
import { PurchaseImportDialog } from '@/features/purchaseImport'
import { PURCHASE_HISTORY_HINT, defaultTopic } from '../insightModel'
import { useInsightOverview } from '../hooks/useInsightOverview'
import ProfileCard from './ProfileCard'
import TopicTags from './TopicTags'
import TopicResult, { Failure } from './TopicResult'
import VisualSkeleton from './VisualSkeleton'

// 분석 주제 태그(둥근 알약)와 헷갈리지 않도록 모서리가 각진 그라데이션 라벨 + 반짝이는 별로 "AI가 만든 결과"임을 따로 표시한다.
const BADGE = 'ai-badge relative inline-flex items-center gap-[6px] px-[11px] py-[4px] rounded-[6px] text-[12px] font-[800] tracking-[0.4px] text-[#14131c] overflow-hidden'

// 영역 제목 + AI 분석 배지. 스팀 연동 전과 후가 같은 모양을 쓴다.
function Heading({ title, description }) {
  return (
    <>
      <PageHeading title={title} description={description} />
      <span className={BADGE + ' mb-[16px]'}>
        <GSIcon name="spark" size={14} className="ai-badge-spark" />
        AI분석
      </span>
    </>
  )
}

// 스팀 연동 전: 다른 화면의 연동 안내(EmptyState)와 같은 문구와 버튼을 쓴다.
function SteamLock({ onLinkSteam }) {
  return (
    <div>
      <strong className="block text-[18px]">스팀 계정을 연동해 주세요</strong>
      <p className="mt-[8px] text-[14px] text-muted leading-[1.6]">보유 게임과 플레이 시간을 불러오면 AI가 내 게임 소비를 분석해서 알려 드려요.</p>
      <button type="button" className={TEXT_BUTTON + ' mt-[8px]'} onClick={onLinkSteam}>Steam 계정 연동하기</button>
    </div>
  )
}

function ProfileLoading() {
  return (
    <div role="status" aria-live="polite">
      <div className="h-[56px] w-[60%] rounded-[12px] bg-surface animate-[pulse_1.4s_infinite_alternate]" aria-hidden="true" />
      <p className="mt-[16px] text-[13px] text-muted">내 게임 소비 유형을 계산하고 있어요...</p>
    </div>
  )
}

// 위쪽: 왼쪽에 제목 · 소비 유형 · 태그, 오른쪽에 고른 태그에 맞는 시각 데이터(불러오는 동안은 스켈레톤). 왼쪽은 글 내용만큼만 차지하고, 오른쪽 카드가 나머지 폭과 왼쪽 높이를 모두 채워 빈 공간이 남지 않는다.
// 아래쪽: 고른 태그의 AI 결과 카드 (전체 폭).
function Analysis({ title, description, renderVisual, ask }) {
  const { status, overview, error, retry } = useInsightOverview()
  const { reload } = useMySpendingContext()
  const [importOpen, setImportOpen] = useState(false)
  const [picked, setPicked] = useState(null)
  const ready = status === 'ready'
  // 고르기 전에는 서버가 알려 준 첫 번째 태그를 보여준다
  const selected = ready ? picked ?? defaultTopic(overview.topics) : null
  return (
    <>
      <div className="grid grid-cols-[minmax(0,max-content)_minmax(340px,1fr)] gap-[32px] items-stretch max-[860px]:grid-cols-1">
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

// 분석 화면 맨 위의 AI 분석 영역: 제목 → 소비 유형 → 분석 태그 → 시각 데이터 → 고른 태그의 AI 결과 카드. 그 아래에 데이터 패널이 이어진다.
// renderVisual(topic)은 태그에 맞는 시각 데이터 카드를 그려 주는 함수다 (어떤 데이터를 보여줄지는 호출하는 쪽이 정한다).
// ask는 결과 카드 아래에 이어 붙일 직접 질문 영역이다 (무엇을 보여줄지는 호출하는 쪽이 정한다).
// onLinkSteam을 주면 스팀 연동 전 안내를 보여주고 AI는 부르지 않는다.
export default function AiAnalysisSection({ title, description, renderVisual, ask, onLinkSteam }) {
  return (
    <section
      id="ai-insight"
      className="scroll-mt-[92px] rounded-[24px] border border-insight-border bg-insight-bg shadow-[var(--shadow)] p-[32px] max-[600px]:p-[20px] max-[600px]:rounded-[20px]"
    >
      {onLinkSteam ? (
        <>
          <Heading title={title} description={description} />
          <SteamLock onLinkSteam={onLinkSteam} />
        </>
      ) : (
        <Analysis title={title} description={description} renderVisual={renderVisual} ask={ask} />
      )}
    </section>
  )
}
