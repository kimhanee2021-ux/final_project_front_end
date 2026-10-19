export function fpsReferenceLabel(evidence){
 if(evidence?.status==='REFERENCE_PROJECTION'&&Number.isFinite(evidence.projection?.averageFps)&&evidence.projection.averageFps>0)return `참고 예상 약 ${evidence.projection.averageFps} FPS · 낮은 신뢰`
 const samples=(evidence?.samples??[]).filter(sample=>Number.isFinite(sample.averageFps)&&sample.averageFps>0)
 if(evidence?.status!=='REFERENCE_ONLY'||!samples.length)return 'FPS 근거 부족'
 if(samples.length===1)return `참고 실측 ${samples[0].averageFps} FPS`
 return `참고 실측 ${samples.length}건 · 옵션별 확인`
}

