import { RecentActivity } from '../../features/games/components/HomeWidgets'
import PageHeading from '../../components/common/PageHeading'

export default function ActivityPage() {
  return (
    <>
      <PageHeading
        title="Recently Played"
        description="당신의 모험이 남긴 작은 기록들. 데모 플레이 기록을 확인해보세요."
      />
      <RecentActivity expanded />
    </>
  )
}
