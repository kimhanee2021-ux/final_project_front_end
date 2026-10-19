export default function PcFpsEvidence({evidence}){
 if(!evidence)return null
 if(evidence.status==='NO_DATA')return <p className="pc-form-hint">FPS 근거 부족 · 이 조건의 수치는 아직 예측하지 않아요.</p>
 return <div className="pc-upgrade-guidance"><h4>FPS 참고 예상과 측정 근거</h4>
  {evidence.projection&&<><p><strong>참고 예상 약 {evidence.projection.averageFps} FPS</strong> · 신뢰도 낮음</p><p>{evidence.projection.preset} · 동일 CPU·GPU 측정 PC {evidence.projection.testSystems}대 기준</p><small>과거 실측값을 반올림한 임시 추정이며 현재 PC 실측이나 정확도 검증된 예측은 아니에요.</small></>}
  {evidence.samples.map(sample=><div key={sample.id}><p><strong>{sample.averageFps} FPS</strong> · 평균 · {sample.preset}</p><small>{sample.cpu} / {sample.gpu} / {sample.ramGB?`${sample.ramGB}GB`:'RAM 구성 미확인'} · {sample.ramDetails}</small><p>{sample.testRig} · {sample.measuredAt}</p><small>{sample.gameBuild} · {sample.renderingMode}</small><p><a href={sample.sourceUrl} target="_blank" rel="noreferrer">측정 원문 ↗</a></p></div>)}
  <ul>{evidence.notes.map(note=><li key={note}>{note}</li>)}</ul>
 </div>
}

