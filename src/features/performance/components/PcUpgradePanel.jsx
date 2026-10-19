import GSIcon from '../../../components/common/GSIcon'
import PanelHeading from './PanelHeading'
import { partPriceLabel } from '../model/pcParts'

export default function PcUpgradePanel({result}){
 const ready=result?.explanationStatus==='READY'
 const recommendations=ready?(result.recommendations??[]):[]
 return <section className="pc-panel pc-upgrade-diagnosis">
  <PanelHeading icon="bulb" title="AI 추천 업그레이드" subtitle="내 PC와 게임의 분석 결과를 바탕으로, 필요한 개선 방향을 찾아요."/>
  {!ready?<div className="pc-upgrade-empty"><GSIcon name="cpu" size={30}/><div><h3>{result?'AI 분석을 완료하면 추천을 확인할 수 있어요.':'사양을 확인하면 AI가 업그레이드를 분석해요.'}</h3><p>{result?'공식 비교 결과만으로 AI 추천을 대신하지 않아요.':'CPU · GPU · RAM · 저장공간과 부품 호환 조건을 함께 검토해요.'}</p></div><span>{result?.explanationStatus==='RATE_LIMITED'?'AI 이용 한도 도달':'AI 분석 대기'}</span></div>:<>
   <div className="pc-upgrade-guidance"><h3>AI가 분석한 개선 방향</h3><ul>{result.upgradeChecks.map((text,i)=><li key={i}>{text}</li>)}</ul></div>
   {recommendations.length===0?<p className="pc-form-hint">현재 근거와 조사한 후보에서는 AI가 추천할 교체 부품을 선택하지 않았어요. 위 분석에서 추가로 확인할 정보를 살펴보세요.</p>:<>
    <p className="pc-form-hint">AI가 조사된 후보 중 검토할 부품을 골랐어요. 장착 호환성과 성능 향상은 아래 조건을 확인해야 해요.</p>
    <div className="pc-parts-grid">{recommendations.map(({offer,reason,compatibilityNote})=><article key={offer.part.productCode} className="pc-part-card">
     <span className="pc-part-category">{offer.part.category} · AI 선택 후보</span><h3>{offer.part.name}</h3>
     <strong className="pc-part-price">{partPriceLabel(offer)}</strong>
     <div className="pc-upgrade-guidance"><h3>추천 이유</h3><p>{reason}</p><h3>장착 전 확인</h3><p>{compatibilityNote}</p></div>
     {offer.observedDropPercent&&<p className="pc-part-drop">이전 수집가 대비 {offer.observedDropPercent}% 하락 <small>공식 할인율이 아니에요 · 이전 {offer.previousPriceKrw.toLocaleString('ko-KR')}원 ({new Date(offer.previousCheckedAt).toLocaleString('ko-KR')})</small></p>}
     <p>{offer.note}</p><ul>{offer.part.compatibilityChecks.map(text=><li key={text}>{text}</li>)}</ul>
     {(offer.retailQuotes??[]).filter(quote=>quote.url!==offer.priceSourceUrl&&quote.status==='OBSERVED'&&Number.isFinite(quote.priceKrw)&&quote.priceKrw>0).map(quote=><div key={quote.url} className="pc-upgrade-guidance"><h3>다른 판매처 가격</h3><p><a href={quote.url} target="_blank" rel="noreferrer">{quote.retailer} ↗</a> · {quote.priceKrw.toLocaleString('ko-KR')}원</p><p>{quote.note}</p><small>조회 {new Date(quote.checkedAt).toLocaleString('ko-KR')}</small></div>)}
     <div className="pc-part-links"><a href={offer.priceSourceUrl??`https://prod.danawa.com/info/?pcode=${offer.part.productCode}`} target="_blank" rel="noreferrer">{offer.priceSourceName??'다나와'} 가격 ↗</a><a href={offer.part.manufacturerSource} target="_blank" rel="noreferrer">호환 확인 자료 ↗</a></div><small>가격 확인 {new Date(offer.checkedAt).toLocaleString('ko-KR')}</small>
    </article>)}</div>
    <p className="pc-form-hint">가격은 최대 6시간 내 수집값이에요. 배송비·재고·쿠폰·카드 조건은 판매처에서 확인해 주세요. 확인된 근거가 없으면 특가나 할인율을 붙이지 않아요.</p>
   </>}
  </>}
 </section>
}
