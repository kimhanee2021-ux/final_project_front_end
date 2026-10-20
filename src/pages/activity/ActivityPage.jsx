import { RecentActivity } from '@/features/games'
import { PageHeading } from '@/shared/ui'

export default function ActivityPage() {
  return (
    <>
      <PageHeading title="최근 활동" description="당신의 모험이 남긴 작은 기록들. 데모 플레이 기록을 확인해보세요." />
      <RecentActivity />
    </>
  )
}
