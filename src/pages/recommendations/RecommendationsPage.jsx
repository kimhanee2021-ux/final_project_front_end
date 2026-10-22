import { Link } from 'react-router-dom'
import { EmptyState, PageHeading, Skeleton } from '@/shared/ui'
import { RecommendationCard, useRecommendations } from '@/features/recommendations'

// AI 게임 추천: 내가 플레이한 보유 게임으로 추천 서버(Two-Tower 모델)가 다음에 할 게임을 골라 준다.
// 이미 가진 게임은 빼고, 학습에 없던 신작 칸은 "신작"으로 표시한다.
export default function RecommendationsPage() {
  const { status, cards, meta, error, retry } = useRecommendations()
  const description =
    status === 'ready' && meta
      ? `플레이한 게임 ${meta.used_game_count}개의 취향으로 골랐어요. 카드를 누르면 스팀 상점으로 가요.`
      : '내가 플레이한 게임의 취향으로 다음에 할 게임을 추천해 드려요.'
  return (
    <section aria-labelledby="gs-recommend-title" aria-busy={status === 'loading'}>
      <PageHeading id="gs-recommend-title" title="AI 게임 추천" description={description} />
      {status === 'loading' && <Skeleton />}
      {status === 'empty' && (
        <EmptyState
          title="아직 추천할 수 없어요"
          description={error}
          action={
            <Link className="gs-primary-button" to="/library">
              내 스팀 라이브러리 보기
            </Link>
          }
        />
      )}
      {status === 'error' && (
        <EmptyState
          title="추천을 불러오지 못했어요"
          description={error}
          action={
            <button type="button" className="gs-primary-button" onClick={retry}>
              다시 시도
            </button>
          }
        />
      )}
      {status === 'ready' &&
        (cards.length ? (
          <>
            <ul className="grid grid-cols-4 gap-[36px_20px] max-[1100px]:grid-cols-3 max-[760px]:grid-cols-2 max-[420px]:grid-cols-1">
              {cards.map(card => (
                <li key={card.appId} className="min-w-0">
                  <RecommendationCard card={card} />
                </li>
              ))}
            </ul>
            <p className="mt-[28px] text-[12px] text-faint leading-[1.7]">
              추천은 내가 플레이한 게임을 바탕으로 한 AI 예측이에요.
              {meta?.unplayed_game_count > 0 && ` 아직 플레이하지 않은 ${meta.unplayed_game_count}개는 취향 계산에서 제외했어요.`}
            </p>
          </>
        ) : (
          <EmptyState title="추천할 게임을 찾지 못했어요" description="나중에 다시 확인해 주세요." />
        ))}
    </section>
  )
}
