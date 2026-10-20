import {useState} from 'react'
import PcHardware from '../src/features/performance/components/PcHardware'
import PcOverallPanel from '../src/features/performance/components/PcOverallPanel'
import PcGameAnalysisDetails from '../src/features/performance/components/PcGameAnalysisDetails'
// 브라우저 구조 검증용 가상 결과. 실제 AI 호출, 로그인, 사진 전송, 저장이 없다.
const result={gameName:'검증용 게임',explanationStatus:'READY',summary:'검증용 분석 문장입니다.',checks:['공식 비교 항목 표시 확인'],settings:['그림자 품질 조절 안내 표시 확인'],limitation:'가상 결과이며 실제 성능 판정이 아닙니다.',requirements:{source:'https://store.steampowered.com/',checkedAt:'2026-10-20T00:00:00Z',minimum:'검증용 최소 사양',recommended:'검증용 권장 사양'},summaryGames:['검증용 게임'],summaryBatch:1,overallExplanation:['부품의 강점과 게임별 부담을 설명하는 문장이 왼쪽 등급 영역과 균형 있게 표시되는지 확인해요.','높은 해상도에서 그래픽 처리 부담이 커질 수 있다는 설명의 줄바꿈을 확인해요.','그림자와 효과 품질 조절 안내를 짧고 명확하게 표시하는지 확인해요.','현재 구성을 유지하거나 규격 확인 후 교체를 검토하는 안내를 확인해요.'],upgradeChecks:['기기 규격 확인 안내'],recommendations:[],resolutions:['FHD','QHD','4K'].map((name,i)=>({name,explanation:'검증용 해상도 설명',target:{grade:['A','C','UNKNOWN'][i],reasonCode:i===2?'RESOLUTION_GAP':'ESTIMATE',method:'AI_TARGET_BAND_V1',preset:'낮음 옵션',confidence:i===2?'NONE':'LOW',reason:'검증용 조건부 설명'}})),componentAdvice:['CPU','GPU','RAM','SSD'].map(category=>({category,status:'KEEP',reason:'기기별 분석 결과가 해당 카드 안에서 펼쳐져요.',compatibilityNote:'실제 모델과 슬롯 규격 확인이 필요해요.',offer:null}))}
export default function PcLayoutFixture(){
 const [laptop,setLaptop]=useState(true)
 const specs={cpuModel:'검증용 CPU',gpuModel:laptop?'검증용 Laptop GPU':'검증용 Desktop GPU',ramGB:32,ramSpeed:'검증용 메모리 속도',storageTotalGB:1000,storageFreeGB:500,deviceType:laptop?'LAPTOP':'DESKTOP'}
 return <main className="pc-page pc-diagnosis"><p>검증용 가상 자료 · AI 호출 없음 · 실제 사진 및 계정 정보 없음</p><button onClick={()=>setLaptop(!laptop)}>검증 사양 전환: {laptop?'노트북':'데스크톱'}</button><PcHardware key={specs.deviceType} specs={specs} result={result}/><PcOverallPanel results={{one:result}} result={result}/><details className="pc-panel"><summary>게임 표에서 펼치는 상세 구조 확인</summary><PcGameAnalysisDetails result={result}/></details></main>
}
