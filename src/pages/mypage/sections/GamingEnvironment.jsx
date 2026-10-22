import { Link } from 'react-router-dom'
import { hardwareFromSpecs, hasSpecs, usePcSpecs } from '@/features/performance'
import PanelTitle from './PanelTitle'

export default function GamingEnvironment() {
  const { specs } = usePcSpecs()
  const parts = hardwareFromSpecs(specs)
  const entered = hasSpecs(specs)
  return (
    <section>
      <PanelTitle title="내 게임 환경" to="/pc-check" linkLabel="AI PC 진단 보기" />
      {entered ? (
        <dl className="grid grid-cols-2 gap-[12px] max-[600px]:grid-cols-1">
          {parts.map(part => (
            <div key={part.id} className="p-[16px] rounded-[16px] bg-bg min-w-0">
              <dt className="text-[13px] text-muted">{part.name}</dt>
              <dd className={`mt-[4px] text-[14px] font-[500] [overflow-wrap:anywhere] ${part.model ? '' : 'text-faint'}`}>
                {part.model || '아직 입력하지 않았어요'}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-[14px] text-muted">
          아직 입력한 PC 사양이 없어요. <Link className="text-primary-text underline" to="/pc-check">PC 사양 입력하고 AI 진단받기</Link>
        </p>
      )}
    </section>
  )
}
