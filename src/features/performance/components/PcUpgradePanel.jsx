import { useEffect,useRef,useState } from 'react'
import GSIcon from '../../../components/common/GSIcon'
import PanelHeading from './PanelHeading'
import { loadPcParts } from '../api/pcApi'
import { partPriceLabel } from '../model/pcParts'

export default function PcUpgradePanel({result}){
 const [offers,setOffers]=useState([]),[busy,setBusy]=useState(false),[error,setError]=useState(''),[category,setCategory]=useState('전체')
 const request=useRef(null),sequence=useRef(0)
 useEffect(()=>()=>{sequence.current++;request.current?.abort()},[])
 async function load(){request.current?.abort();const id=++sequence.current,controller=new AbortController();request.current=controller;setBusy(true);setError('');const timeout=setTimeout(()=>controller.abort(),100000);try{const data=await loadPcParts(controller.signal);if(sequence.current===id)setOffers(data)}catch(e){if(sequence.current===id)setError(e.name==='AbortError'?'가격 조회를 취소했거나 시간이 초과됐어요.':e.message)}finally{clearTimeout(timeout);if(sequence.current===id)setBusy(false)}}
 return <section className="pc-panel pc-upgrade-diagnosis"><PanelHeading icon="bulb" title="추천 업그레이드" subtitle="진단에서 필요한 개선점을 찾은 뒤, 나에게 맞는 부품을 비교해요."/>{result?<>
  <div className="pc-upgrade-guidance"><h3>교체 전 확인할 사항</h3><ul>{result.upgradeChecks.map((text,i)=><li key={i}>{text}</li>)}</ul></div>
  <div className="pc-parts-entry"><div><h3>8가지 부품을 함께 확인해요</h3><p>아래는 조사한 비교 후보예요. 구매 필요성이나 내 PC 장착 가능 여부가 확정된 구성은 아니에요.</p></div><button className="pc-outline-action" disabled={busy} onClick={load}>{busy?'판매가 확인 중…':offers.length?'수집 가격 확인':'부품·판매가 확인'}<GSIcon name="arrow" size={17}/></button></div>
  {busy&&<button className="pc-inline-action" onClick={()=>{sequence.current++;request.current?.abort();setBusy(false)}}>조회 취소</button>}
  {error&&<p className="pc-photo-error" role="alert">{error}</p>}
  {offers.length>0&&<><div className="pc-parts-filters" aria-label="부품 분류">{['전체',...new Set(offers.map(o=>o.part.category))].map(name=><button key={name} aria-pressed={category===name} onClick={()=>setCategory(name)}>{name}</button>)}</div><div className="pc-parts-grid">{offers.filter(o=>category==='전체'||o.part.category===category).map(offer=><article key={offer.part.productCode} className="pc-part-card"><span className="pc-part-category">{offer.part.category} · 호환 확인 필요</span><h3>{offer.part.name}</h3><strong className="pc-part-price">{partPriceLabel(offer)}</strong>{offer.observedDropPercent&&<p className="pc-part-drop">이전 수집가 대비 {offer.observedDropPercent}% 하락 <small>공식 할인율이 아니에요 · 이전 {offer.previousPriceKrw.toLocaleString('ko-KR')}원 ({new Date(offer.previousCheckedAt).toLocaleString('ko-KR')})</small></p>}<p>{offer.note}</p><ul>{offer.part.compatibilityChecks.map(text=><li key={text}>{text}</li>)}</ul><div className="pc-part-links"><a href={`https://prod.danawa.com/info/?pcode=${offer.part.productCode}`} target="_blank" rel="noreferrer">가격 출처 ↗</a><a href={offer.part.manufacturerSource} target="_blank" rel="noreferrer">호환 확인 자료 ↗</a></div><small>확인 {new Date(offer.checkedAt).toLocaleString('ko-KR')}</small></article>)}</div><p className="pc-form-hint">가격은 6시간 동안 수집값을 사용해요. 배송비·재고·쿠폰·카드·적립 조건은 판매처에서 확인해 주세요. 확인된 할인 근거가 없으면 특가나 할인율을 붙이지 않아요.</p></>}
 </>:<div className="pc-upgrade-empty"><GSIcon name="cpu" size={30}/><div><h3>먼저 내 PC와 게임을 확인해 주세요.</h3><p>CPU · GPU · RAM · SSD · 메인보드 · 파워 · 케이스 · 쿨러까지 함께 검토해요.</p></div><span>진단 후 확인</span></div>}</section>
}
