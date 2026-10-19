import { resolutionTarget } from '../model/pcGrade'
export default function PcPerformanceTarget({result,resolution}){
 const target=resolutionTarget(result,resolution)
 return <div className="pc-target-summary"><strong>{target.grade?`${target.grade} · ${target.label}`:target.label}</strong><p>{target.grade?`${target.preset} · AI 추정 · 신뢰도 낮음`:'판단 이유'}</p><p>{target.reason}</p>{target.grade&&<small>목표 프레임 구간의 추정이며 평균·최저 FPS 실측이나 프레임 유지 보장이 아니에요.</small>}</div>
}
