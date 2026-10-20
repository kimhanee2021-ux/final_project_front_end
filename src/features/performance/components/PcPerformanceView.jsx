// @refresh reset
import { useEffect } from 'react'
import { PageHeading, PanelPage } from '@/shared/ui'
import PcSpecButton from './PcSpecButton'
import PcGameComparison from './PcGameComparison'
import PcHardware from './PcHardware'
import PcOverallPanel from './PcOverallPanel'
import { useAuth } from '@/features/auth'
import { usePcDiagnosis } from '../hooks/usePcDiagnosis'
import { usePcSpecs } from '../hooks/usePcSpecs'
import { toDiagnosisSpecs } from '../model/pcSpecs'

// 계정이 바뀌면 진행중 요청과 분석 결과를 함께 폐기한다. 사양 자체는 사양 입력 창(PcSpecProvider)이 브라우저에 저장한다.
export default function PcPerformanceView(){const {user,isAuthenticated}=useAuth();return <PcPerformanceSession key={`${user?.id??user?.email??'guest'}:pc-eight-v2`} signedIn={isAuthenticated}/>}
function PcPerformanceSession({signedIn}){
 const diagnosis=usePcDiagnosis(),result=diagnosis.overviewResult,overview=result?{overview:result}:{}
 const {specs,detail,aiConsent,hasSavedSpecs}=usePcSpecs()
 // 사양 입력 창에서 저장한 사양을, 로그인했고 AI 분석에 동의했을 때만 진단에 넘긴다. 사양이 바뀌면 다시 넘긴다.
 const specsKey=JSON.stringify([specs,detail])
 useEffect(()=>{if(signedIn&&aiConsent&&hasSavedSpecs)diagnosis.applySpecs(toDiagnosisSpecs(specs,detail))},[specsKey,signedIn,aiConsent,hasSavedSpecs]) // eslint-disable-line react-hooks/exhaustive-deps
 return <PanelPage><div className="pcd-page pcd-diagnosis">
  <PageHeading id="pcd-page-title" title="PC 성능 진단" description="사양을 입력하고, 게임별 예상 성능과 업그레이드 후보를 살펴보세요." action={<PcSpecButton/>}/>
  {hasSavedSpecs&&!diagnosis.specs&&<p className="pcd-form-hint">{signedIn?'AI 분석에 쓰려면 “사양 입력 완료!” 버튼을 눌러 AI 분석 동의를 켜주세요.':'AI 분석을 하려면 로그인한 뒤 사양 입력 창에서 AI 분석 동의를 켜주세요.'}</p>}
  <PcHardware key={`hardware:${diagnosis.specs?JSON.stringify(diagnosis.specs):'empty'}`} specs={diagnosis.specs} result={result} partOffers={diagnosis.partOffers} partsLoading={diagnosis.partsLoading}/>
  <PcGameComparison key={`games:${diagnosis.specs?JSON.stringify(diagnosis.specs):'empty'}`} diagnosis={diagnosis} signedIn={signedIn}/>
  <PcOverallPanel results={overview} result={result} preparing={!result&&diagnosis.busy!==null} error={diagnosis.viewMode==='owned'?diagnosis.overviewError:''}/>

 </div></PanelPage>
}
