// @refresh reset
import { useEffect,useRef,useState } from 'react'
import GSIcon from '../../../components/common/GSIcon'
import SystemPhotoInput from './SystemPhotoInput'
import PcGameComparison from './PcGameComparison'
import PcHardware from './PcHardware'
import PcOverallPanel from './PcOverallPanel'
import { useAuth } from '../../auth/context/AuthContext'
import { usePcDiagnosis } from '../hooks/usePcDiagnosis'

function PhotoDialog({onClose,onApply,signedIn}){
 const dialogRef=useRef(null)
 useEffect(()=>{const previous=document.activeElement,overflow=document.body.style.overflow;document.body.style.overflow='hidden';dialogRef.current?.querySelector('button')?.focus();return()=>{document.body.style.overflow=overflow;previous?.focus()}},[])
 function keys(event){if(event.key==='Escape')onClose();if(event.key!=='Tab')return;const items=[...dialogRef.current.querySelectorAll('button:not([disabled]),input:not([disabled]):not([type="file"]),a[href]')];const first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}
 return <div className="pc-dialog-backdrop" onClick={onClose}><section ref={dialogRef} className="pc-setup-dialog" role="dialog" aria-modal="true" aria-labelledby="pc-dialog-heading" onClick={e=>e.stopPropagation()} onKeyDown={keys}><div className="pc-dialog-heading"><GSIcon name="monitor" size={24}/><h2 id="pc-dialog-heading">시스템 정보 사진</h2><button aria-label="닫기" onClick={onClose}><GSIcon name="close" size={19}/></button></div><p>사진에서 사양을 읽거나 직접 입력한 뒤 적용해요.</p><SystemPhotoInput onApply={onApply} signedIn={signedIn}/></section></div>
}

// 계정이 바뀌면 진행중 요청과 PC 사양을 함께 폐기한다. PC 정보는 DB/로컬스토리지에 저장하지 않는다.
export default function PcPerformanceView(){const {user,isAuthenticated}=useAuth();return <PcPerformanceSession key={`${user?.id??user?.email??'guest'}:pc-eight-v2`} signedIn={isAuthenticated}/>}
function PcPerformanceSession({signedIn}){
 const diagnosis=usePcDiagnosis(),result=diagnosis.overviewResult,overview=result?{overview:result}:{}
 const [dialog,setDialog]=useState(false),[preparing,setPreparing]=useState(false)
 const timer=useRef(null)
 useEffect(()=>()=>window.clearTimeout(timer.current),[])
 function preparePhoto(){if(preparing)return;setPreparing(true);timer.current=window.setTimeout(()=>{setPreparing(false);setDialog(true)},1500)}
 return <div className="pc-page pc-diagnosis">
  <section className="pc-hero pc-diagnosis-hero" aria-labelledby="pc-page-title"><div className="pc-hero-background"/><div className="pc-hero-copy"><p className="pc-eyebrow">MY PC. MY PLAY.</p><h1 id="pc-page-title">내 PC 성능 체크<span>.</span></h1><p className="pc-hero-description">내 컴퓨터를 알고,<br/>나에게 맞는 플레이를 시작하세요.</p></div><div className="pc-hero-entry"><button className="pc-start-button" onClick={preparePhoto} disabled={preparing}><GSIcon name="monitor" size={17}/>{diagnosis.specs?'사양 변경':'지금 진단하기'}<GSIcon name="arrow" size={17}/></button><span className="pc-hero-footnote"><GSIcon name="shield" size={13}/>사진 또는 직접 입력으로 PC 사양을 확인해요</span><span className="pc-photo-preparing" role="status">{preparing?'사진 업로드를 준비하고 있어요…':''}</span></div></section>
  <PcHardware key={`hardware:${diagnosis.specs?JSON.stringify(diagnosis.specs):'empty'}`} specs={diagnosis.specs} result={result} partOffers={diagnosis.partOffers} partsLoading={diagnosis.partsLoading}/>
  <PcGameComparison key={`games:${diagnosis.specs?JSON.stringify(diagnosis.specs):'empty'}`} diagnosis={diagnosis} signedIn={signedIn}/>
  <PcOverallPanel results={overview} result={result} preparing={preparing||(!result&&diagnosis.busy!==null)} error={diagnosis.viewMode==='owned'?diagnosis.overviewError:''}/>

  {dialog&&<PhotoDialog signedIn={signedIn} onClose={()=>setDialog(false)} onApply={pc=>{diagnosis.applySpecs(pc);setDialog(false)}}/>}
 </div>
}
