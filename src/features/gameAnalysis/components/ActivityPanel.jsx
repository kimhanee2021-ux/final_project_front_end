import { AnalysisPanel, GSIcon } from '@/shared/ui'
import { activityHeadline } from '../model/gameAnalysisModel'

// 시계열형 데이터 → 타임라인
export default function ActivityPanel({ activities, eyebrow }) {
  return (
    <AnalysisPanel eyebrow={eyebrow} headline={activityHeadline(activities)}>
      <ul>
        {activities.map(item => (
          <li key={item.id} className="flex items-center gap-[16px] py-[16px] border-b border-border last:border-0">
            <span className="grid place-items-center w-[40px] h-[40px] rounded-full bg-bg text-muted shrink-0">
              <GSIcon name={item.type === 'play' ? 'play' : 'bag'} size={18} />
            </span>
            <p className="text-[15px]">{item.text}</p>
            <span className="ml-auto text-[13px] text-faint shrink-0">{item.when}</span>
          </li>
        ))}
      </ul>
    </AnalysisPanel>
  )
}
