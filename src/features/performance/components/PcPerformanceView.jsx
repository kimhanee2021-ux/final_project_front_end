// @refresh reset
import { useEffect,useRef,useState } from 'react'
import { GSIcon, PageHeading, PanelPage } from '@/shared/ui'
import SystemPhotoInput from './SystemPhotoInput'
import PcGameComparison from './PcGameComparison'
import PcHardware from './PcHardware'
import PcOverallPanel from './PcOverallPanel'
import { useAuth } from '@/features/auth'
import { usePcDiagnosis } from '../hooks/usePcDiagnosis'

function PhotoDialog({onClose,onApply,signedIn}){
 const dialogRef=useRef(null)
 useEffect(()=>{const previous=document.activeElement,overflow=document.body.style.overflow;document.body.style.overflow='hidden';dialogRef.current?.querySelector('button')?.focus();return()=>{document.body.style.overflow=overflow;previous?.focus()}},[])
 function keys(event){if(event.key==='Escape')onClose();if(event.key!=='Tab')return;const items=[...dialogRef.current.querySelectorAll('button:not([disabled]),input:not([disabled]):not([type="file"]),a[href]')];const first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}
 return <div className="pcd-dialog-backdrop" onClick={onClose}><section ref={dialogRef} className="pcd-setup-dialog" role="dialog" aria-modal="true" aria-labelledby="pcd-dialog-heading" onClick={e=>e.stopPropagation()} onKeyDown={keys}><div className="pcd-dialog-heading"><GSIcon name="monitor" size={24}/><h2 id="pcd-dialog-heading">시스템 정보 사진</h2><button aria-label="닫기" onClick={onClose}><GSIcon name="close" size={19}/></button></div><p>사진에서 사양을 읽거나 직접 입력한 뒤 적용해요.</p><SystemPhotoInput onApply={onApply} signedIn={signedIn}/></section></div>
}

// 계정이 바뀌면 진행중 요청과 PC 사양을 함께 폐기한다. PC 정보는 DB/로컬스토리지에 저장하지 않는다.
export default function PcPerformanceView(){const {user,isAuthenticated}=useAuth();return <PcPerformanceSession key={`${user?.id??user?.email??'guest'}:pc-eight-v2`} signedIn={isAuthenticated}/>}
function PcPerformanceSession({signedIn}){
 const diagnosis=usePcDiagnosis(),result=diagnosis.overviewResult,overview=result?{overview:result}:{}
 const [dialog,setDialog]=useState(false),[preparing,setPreparing]=useState(false)
 const timer=useRef(null)
 useEffect(()=>()=>window.clearTimeout(timer.current),[])
 function preparePhoto(){if(preparing)return;setPreparing(true);timer.current=window.setTimeout(()=>{setPreparing(false);setDialog(true)},1500)}
 return <PanelPage><div className="pcd-page pcd-diagnosis">
  <PageHeading id="pcd-page-title" title="PC 성능 진단" description="사진 또는 직접 입력으로 PC 사양을 확인하고, 게임별 예상 성능과 업그레이드 후보를 살펴보세요." action={<div className="pcd-hero-entry"><button className="gs-primary-button" onClick={preparePhoto} disabled={preparing}><GSIcon name="monitor" size={17}/>{diagnosis.specs?'사양 변경':'지금 진단하기'}</button><span className="pcd-photo-preparing" role="status">{preparing?'사진 업로드를 준비하고 있어요…':''}</span></div>}/>
  <PcHardware key={`hardware:${diagnosis.specs?JSON.stringify(diagnosis.specs):'empty'}`} specs={diagnosis.specs} result={result} partOffers={diagnosis.partOffers} partsLoading={diagnosis.partsLoading}/>
  <PcGameComparison key={`games:${diagnosis.specs?JSON.stringify(diagnosis.specs):'empty'}`} diagnosis={diagnosis} signedIn={signedIn}/>
  <PcOverallPanel results={overview} result={result} preparing={preparing||(!result&&diagnosis.busy!==null)} error={diagnosis.viewMode==='owned'?diagnosis.overviewError:''}/>

  {dialog&&<PhotoDialog signedIn={signedIn} onClose={()=>setDialog(false)} onApply={pc=>{diagnosis.applySpecs(pc);setDialog(false)}}/>}
 </div></PanelPage>
}
