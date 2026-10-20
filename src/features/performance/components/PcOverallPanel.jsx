import GSIcon from '../../../components/common/GSIcon'
import PcGradeSummary from './PcGradeSummary'
import {overallPerformanceExplanation,latestOverallResult} from '../model/pcGrade'
export default function PcOverallPanel({results,result,preparing,error}){
 const overview=result??latestOverallResult(results)
 return <section className="pc-panel pc-ai-explanation" aria-labelledby="pc-ai-heading"><div className="pc-assessment-layout">
  <PcGradeSummary results={results} preparing={preparing} result={result}/>
  <div className="pc-overall-copy">
   <div className="pc-overall-heading"><span className="pc-ai-orbit"><GSIcon name="spark" size={27}/></span><h2 id="pc-ai-heading">AI 종합 설명</h2></div>
   <p className="pc-overall-caption">{overview?.scopeType==='owned'?`내 보유게임 전체 ${overview.scopeGameCount}개 기준 · 페이지 이동으로 바뀌지 않아요.`:overview?.scopeType==='search'?`검색한 ${overview.gameName} 기준의 평가예요.`:'게임을 분석하면 이 영역의 평가도 함께 변경돼요.'}</p>{error&&<p role="alert" className="pc-photo-error">{error}</p>}
   <div className="pc-overall-explanation">{overallPerformanceExplanation(overview?{overview}:{}).map(text=><p key={text}>{text.includes(': ')?<><strong>{text.slice(0,text.indexOf(': '))}</strong><span>{text.slice(text.indexOf(': ')+2)}</span></>:text}</p>)}</div>
  </div>
 </div></section>
}
