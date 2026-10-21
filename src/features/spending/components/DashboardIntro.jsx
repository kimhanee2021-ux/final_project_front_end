import { PageHeading } from '@/shared/ui'

const TITLES = {
  analysis: '내 소비를 더 깊이 이해하기',
  library: '나의 게임, 나의 이야기',
  dashboard: '좋아하는 게임, 현명한 소비',
}

// 소비 분석·구매 내역 화면 맨 위. 데이터 출처와 기준일은 제목 아래 한 줄로만 알린다.
export default function DashboardIntro({ view, asOf, badgeLabel = '스팀 데이터' }) {
  const description =
    view === 'library'
      ? '구매한 게임과 함께한 시간을 한눈에 살펴보세요.'
      : '게임에 쓴 돈과 시간을 돌아보고, 나만의 가치를 발견하세요.'
  return (
    <PageHeading
      title={TITLES[view] ?? TITLES.dashboard}
      description={
        <>
          {description}
          <span className="block mt-[4px] text-[12px] text-faint">
            {badgeLabel} · {asOf.replaceAll('-', '.')} 기준
          </span>
        </>
      }
    />
  )
}
