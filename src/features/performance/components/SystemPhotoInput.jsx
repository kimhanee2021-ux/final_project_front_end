import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import GSIcon from '../../../components/common/GSIcon'
import { extractPcPhoto } from '../api/pcApi'
import { normalizeSpecs } from '../model/pcDiagnosis'

const fields=[['cpuModel','CPU 모델명'],['cpuDetails','CPU 코어 · 스레드'],['gpuModel','GPU 모델명'],['gpuMemory','그래픽 메모리 표시값'],['ramGB','RAM 용량 (GB)'],['ramSpeed','RAM 속도'],['storageTotalGB','총 저장공간 (GB)'],['storageFreeGB','남은 공간 (GB)'],['os','운영체제']]
export default function SystemPhotoInput({ onApply,signedIn }) {
 const [photo,setPhoto]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[values,setValues]=useState(null),[warnings,setWarnings]=useState([]),[consent,setConsent]=useState(false)
 const inputRef=useRef(null),controller=useRef(null),sequence=useRef(0)
 useEffect(()=>()=>{sequence.current++;controller.current?.abort()},[])
 useEffect(()=>()=>{if(photo?.url)URL.revokeObjectURL(photo.url)},[photo])
 function cancel(){sequence.current++;controller.current?.abort();setBusy(false)}
 function selectPhoto(event){const file=event.target.files?.[0];if(!file)return;event.target.value='';cancel();setValues(null);setError('');setConsent(false)
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>10485760){setError('JPG·PNG·WEBP 사진을 10MB 이하로 선택해 주세요.');return}
  setPhoto({file,name:file.name,url:URL.createObjectURL(file)})
 }
 async function readPhoto(){if(!photo||!consent||!signedIn)return;cancel();const id=++sequence.current;const request=new AbortController();controller.current=request;setBusy(true);setError('');const timer=setTimeout(()=>request.abort(),100000)
  try{const result=await extractPcPhoto(photo.file,request.signal);if(id===sequence.current){setValues(result.specs);setWarnings(result.warnings||[])}}catch(e){if(id===sequence.current)setError(e.name==='AbortError'?'사진 읽기를 취소했거나 시간이 초과됐어요. 다시 시도해 주세요.':e.message)}finally{clearTimeout(timer);if(id===sequence.current)setBusy(false)}
 }
 return <div className="pc-photo-input">
  <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={selectPhoto} hidden />
  {photo?<><img src={photo.url} alt="선택한 시스템 정보 사진" onError={()=>{cancel();setError('사진을 열 수 없어요.');setPhoto(null)}}/><span className="pc-photo-name">{photo.name}</span></>:<div className="pc-photo-empty"><GSIcon name="image" size={34}/><strong>시스템 정보 사진을 넣어주세요</strong><span>Windows 설정 → 시스템 → 정보</span></div>}
  <button className="pc-outline-action" onClick={()=>inputRef.current.click()}><GSIcon name="image" size={17}/>{photo?'사진 변경':'사진 선택'}</button>
  <p className="pc-photo-formats">JPG · PNG · WEBP / 최대 10MB · 2400만 화소</p>
  {!signedIn&&<p className="pc-photo-pending"><Link to="/login?next=%2Fpc-check">로그인</Link> 후 AI로 사양을 읽을 수 있어요.</p>}
  {photo&&signedIn&&!values&&<><p className="pc-photo-pending">장치 ID·제품 ID·사용자 이름은 가리고 사양 부분만 올려주세요. 사진은 서비스 서버에 저장하지 않아요.</p><label className="pc-photo-consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} disabled={busy}/>사진을 Gemini에 전송해 사양을 읽는 데 동의해요.</label><button className="pc-start-button" disabled={!consent||busy} onClick={readPhoto}>{busy?'사진에서 사양 읽는 중…':'AI로 사양 읽기'}</button>{busy&&<button className="pc-inline-action" onClick={cancel}>취소</button>}</>}
  {error&&<p role="alert" className="pc-photo-error">{error}</p>}
  {values&&<form className="pc-spec-review" onSubmit={event=>{event.preventDefault();try{const pc=normalizeSpecs(values);if(!pc.cpuModel&&!pc.gpuModel&&!pc.ramGB)throw new Error('CPU·GPU·RAM 중 확인할 수 있는 사양을 입력해 주세요.');onApply(pc)}catch(e){setError(e.message)}}}>
   <h3>읽은 사양을 확인해 주세요</h3><p>사진에 없거나 불명확한 값은 비워뒀어요. 직접 수정할 수 있어요.</p>
   {warnings.length>0&&<ul>{warnings.map((text,i)=><li key={i}>{text}</li>)}</ul>}
   {fields.map(([key,label])=><label key={key}>{label}<input value={values[key]??''} type={key.endsWith('GB')?'number':'text'} step="any" min="0" maxLength={key==='ramSpeed'?80:160} onChange={e=>setValues(old=>({...old,[key]:e.target.value}))} placeholder="정보 없음" /></label>)}
   <button className="pc-start-button" type="submit">확인한 사양 적용하기<GSIcon name="check" size={17}/></button>
  </form>}
 </div>
}
