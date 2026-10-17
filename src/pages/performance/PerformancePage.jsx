import PcPerformanceView from '../../features/performance/components/PcPerformanceView'
import '../../styles/performance.css'
import '../../features/performance/styles/pcDiagnosis.css'

// 공통 헤더/인증/테마는 GameSenseLayout에서 유지한다.
export default function PerformancePage() {
  return <PcPerformanceView />
}
