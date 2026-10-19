import { useEffect,useRef,useState } from 'react'
import GSIcon from '../../../components/common/GSIcon'
import PcUpgradePanel from './PcUpgradePanel'
import SystemPhotoInput from './SystemPhotoInput'
import PcGameComparison from './PcGameComparison'
import PcHardware from './PcHardware'
import PcGradeSummary from './PcGradeSummary'
import { useAuth } from '../../auth/context/AuthContext'
import { usePcDiagnosis } from '../hooks/usePcDiagnosis'

function PhotoDialog({onClose,onApply,signedIn}){
 const dialogRef=useRef(null)
 useEffect(()=>{const previous=document.activeElement,overflow=document.body.style.overflow;document.body.style.overflow='hidden';dialogRef.current?.querySelector('button')?.focus();return()=>{document.body.style.overflow=overflow;previous?.focus()}},[])
 function keys(event){if(event.key==='Escape')onClose();if(event.key!=='Tab')return;const items=[...dialogRef.current.querySelectorAll('button:not([disabled]),input:not([disabled]):not([type="file"]),a[href]')];const first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}
 return <div className="pc-dialog-backdrop" onClick={onClose}><section ref={dialogRef} className="pc-setup-dialog" role="dialog" aria-modal="true" aria-labelledby="pc-dialog-heading" onClick={e=>e.stopPropagation()} onKeyDown={keys}><div className="pc-dialog-heading"><GSIcon name="monitor" size={24}/><h2 id="pc-dialog-heading">시스템 정보 사진</h2><button aria-label="닫기" onClick={onClose}><GSIcon name="close" size={19}/></button></div><p>사진에서 읽은 사양을 확인·수정한 뒤 적용해요.</p><SystemPhotoInput onApply={onApply} signedIn={signedIn}/></section></div>
}

// 계정이 바뀌면 진행중 요청과 PC 사양을 함께 폐기한다. PC 정보는 DB/로컬스토리지에 저장하지 않는다.
export default function PcPerformanceView(){const {user,isAuthenticated}=useAuth();return <PcPerformanceSession key={user?.id??user?.email??'guest'} signedIn={isAuthenticated}/>}
function PcPerformanceSession({signedIn}){
 const diagnosis=usePcDiagnosis(),result=diagnosis.results[diagnosis.selected]
 const [dialog,setDialog]=useState(false),[preparing,setPreparing]=useState(false)
 const timer=useRef(null)
 useEffect(()=>()=>window.clearTimeout(timer.current),[])
 function preparePhoto(){if(preparing)return;setPreparing(true);timer.current=window.setTimeout(()=>{setPreparing(false);setDialog(true)},1500)}
 return <div className="pc-page pc-diagnosis">
  <section className="pc-hero pc-diagnosis-hero" aria-labelledby="pc-page-title"><div className="pc-hero-background"/><div className="pc-hero-copy"><p className="pc-eyebrow">MY PC. MY PLAY.</p><h1 id="pc-page-title">내 PC 성능 체크<span>.</span></h1><p className="pc-hero-description">내 컴퓨터를 알고,<br/>나에게 맞는 플레이를 시작하세요.</p></div><div className="pc-hero-entry"><button className="pc-start-button" onClick={preparePhoto} disabled={preparing}><GSIcon name="monitor" size={17}/>{diagnosis.specs?'사양 사진 변경':'지금 진단하기'}<GSIcon name="arrow" size={17}/></button><span className="pc-hero-footnote"><GSIcon name="shield" size={13}/>시스템 정보 사진으로 PC 사양을 확인해요</span><span className="pc-photo-preparing" role="status">{preparing?'사진 업로드를 준비하고 있어요…':''}</span></div></section>
  <PcHardware specs={diagnosis.specs}/>
  <PcGameComparison diagnosis={diagnosis} signedIn={signedIn}/>
  <section className="pc-panel pc-ai-explanation" aria-labelledby="pc-ai-heading"><div className="pc-ai-assessment"><PcGradeSummary preparing={preparing||diagnosis.busy!==null} result={result}/><div className="pc-ai-empty"><span className="pc-ai-orbit"><GSIcon name="spark" size={27}/></span><div><h2 id="pc-ai-heading" className="pc-ai-title">AI 종합 설명</h2><p className="pc-ai-subtitle">종합 성능 등급과 판단 이유, 설정에 따른 차이까지 한곳에서.</p>{result?<div className="pc-live-explanation"><h3>{result.gameName}</h3><p>{result.summary}</p><ul>{result.checks.map((text,i)=><li key={i}>{text}</li>)}</ul>{result.resolutions.map(item=><div className="pc-resolution-explanation" key={item.name}><h4>{item.name}</h4><p>{item.explanation}</p></div>)}<h4>설정 확인</h4><ul>{result.settings.map((text,i)=><li key={i}>{text}</li>)}</ul><p className="pc-result-limitation">{result.limitation}</p><a href={result.requirements.source} target="_blank" rel="noreferrer">공식 요구 사양 원문 ↗</a><small className="pc-source-date">확인: {new Date(result.requirements.checkedAt).toLocaleString('ko-KR')}</small><details><summary>수집한 요구 사양 보기</summary><h4>최소 사양</h4><p>{result.requirements.minimum||'공식 자료 없음'}</p><h4>권장 사양</h4><p>{result.requirements.recommended||'공식 자료 없음'}</p></details></div>:<><p>PC와 게임을 알면, AI가 설명해 드려요.<br/>FHD · QHD · 4K에 따른 차이와<br/>조절하면 좋은 설정을 함께 알려드려요.</p><span className="pc-waiting-label"><i/>진단 대기</span></>}</div></div></div></section>
  <PcUpgradePanel key={diagnosis.specs?JSON.stringify(diagnosis.specs):'empty'} result={result}/>
  {dialog&&<PhotoDialog signedIn={signedIn} onClose={()=>setDialog(false)} onApply={pc=>{diagnosis.applySpecs(pc);setDialog(false)}}/>}
 </div>
}
