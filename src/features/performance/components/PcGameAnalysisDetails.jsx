import PcPerformanceTarget from './PcPerformanceTarget'
import PcFpsEvidence from './PcFpsEvidence'

export default function PcGameAnalysisDetails({ result }) {
  return (
    <div className="pcd-live-explanation">
      <h3>{result.gameName}</h3>
      {result.aiProvider && <small className="pcd-source-date">분석 AI: {result.aiProvider}</small>}
      {result.explanationStatus === 'RATE_LIMITED' && (
        <p role="status" className="pcd-result-limitation">
          AI 서비스 이용 한도 도달 · 공식 사양 비교 결과를 표시해요.
        </p>
      )}
      {result.explanationStatus === 'UNAVAILABLE' && (
        <p role="status" className="pcd-result-limitation">
          공식 사양 비교 완료 · AI 해설은 잠시 후 다시 비교해 주세요.
        </p>
      )}
      <p>{result.summary}</p>
      <details className="pcd-check-details">
        <summary>공식 사양 비교 항목 보기</summary>
        <ul>
          {result.checks.map((text, i) => (
            <li key={i}>{text}</li>
          ))}
        </ul>
      </details>
      <div className="pcd-resolution-grid">
        {result.resolutions.map(item => (
          <div className="pcd-resolution-explanation" key={item.name}>
            <h4>{item.name}</h4>
            <PcPerformanceTarget result={result} resolution={item.name} />
            <p>{item.explanation}</p>
            {(item.fps?.status !== 'NO_DATA' || item.fps?.publisherTargets?.length > 0) && (
              <details className="pcd-evidence-details">
                <summary>실측·게임사 목표 사양 보기</summary>
                <PcFpsEvidence evidence={item.fps} />
              </details>
            )}
          </div>
        ))}
      </div>
      <h4>설정 확인</h4>
      <ul>
        {result.settings.map((text, i) => (
          <li key={i}>{text}</li>
        ))}
      </ul>
      <p className="pcd-result-limitation">{result.limitation}</p>
      <a href={result.requirements.source} target="_blank" rel="noreferrer">
        {result.requirements.source.includes('cc=us') ? '공식 요구 사양 원문 · 미국 상점 ↗' : '공식 요구 사양 원문 ↗'}
      </a>
      <small className="pcd-source-date">확인: {new Date(result.requirements.checkedAt).toLocaleString('ko-KR')}</small>
      <details>
        <summary>수집한 요구 사양 보기</summary>
        <h4>최소 사양</h4>
        <p>{result.requirements.minimum || '공식 자료 없음'}</p>
        <h4>권장 사양</h4>
        <p>{result.requirements.recommended || '공식 자료 없음'}</p>
      </details>
    </div>
  )
}
