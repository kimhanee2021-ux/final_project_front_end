export default function PcFpsEvidence({evidence}){
 if(!evidence)return null
 return <div className="pc-upgrade-guidance">{evidence.status==='NO_DATA'?<p className="pc-form-hint">조건에 맞는 외부 실측 자료는 아직 없어요.</p>:<h4>외부 PC 실측 참고</h4>}
  {evidence.projection&&<><p><strong>참고 예상 약 {evidence.projection.averageFps} FPS</strong> · 신뢰도 낮음</p><p>{evidence.projection.preset} · 동일 CPU·GPU 측정 PC {evidence.projection.testSystems}대 기준</p><small>과거 실측값을 반올림한 임시 추정이며 현재 PC 실측이나 정확도 검증된 예측은 아니에요.</small></>}
  {evidence.samples.map(sample=><div key={sample.id}><p><strong>{sample.averageFps} FPS</strong> · 외부 측정 평균 · {sample.preset}</p><small>{sample.cpu} / {sample.gpu} / {sample.ramGB?`${sample.ramGB}GB`:'RAM 구성 미확인'} · {sample.ramDetails}</small><p>{sample.testRig} · {sample.measuredAt}</p><small>{sample.gameBuild} · {sample.renderingMode}</small><p><a href={sample.sourceUrl} target="_blank" rel="noreferrer">측정 원문 ↗</a></p></div>)}
  {evidence.status!=='NO_DATA'&&<ul>{evidence.notes.map(note=><li key={note}>{note}</li>)}</ul>}
  {evidence.publisherTargets?.length>0&&<section><h4>게임사 공식 목표 사양</h4><p>게임사가 제시한 조건이에요. 현재 PC의 실측이나 성능 보장이 아니에요.</p>{evidence.publisherTargets.map((target,index)=><div key={`${target.sourceUrl}-${index}`}><p><strong>목표 {target.fps} FPS</strong> · {target.resolution?.join(' × ')??'해상도 미명시'} · {target.preset??'옵션 미명시'}</p><small>CPU: {target.cpuAlternatives.join(' / ')}<br/>GPU: {target.gpuAlternatives.join(' / ')}{target.ramGB&&<> · RAM {target.ramGB}GB</>}</small><p>{target.rendering}</p><a href={target.sourceUrl} target="_blank" rel="noreferrer">게임사 원문 ↗</a></div>)}</section>}

 </div>
}

