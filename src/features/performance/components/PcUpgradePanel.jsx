import {upgradePresentation} from '../model/pcUpgradePresentation'
import { partPriceLabel } from '../model/pcParts'

// 사양 카드 안에서 해당 부품에 관한 분석만 펼친다. 별도 업그레이드 영역은 만들지 않는다.
export default function PcUpgradePanel({result,category,specs,partOffers=[],partsLoading=false}){
 const ready=result?.explanationStatus==='READY'
 const advice=ready?result.componentAdvice?.find(item=>item.category===category):null
 const recommendations=ready?(result.recommendations??[]).filter(item=>item.offer?.part?.category===category):[]
 const hydrate=item=>({...item,offer:partOffers.find(offer=>offer.part.productCode===item.offer?.part?.productCode&&offer.status==='OBSERVED'&&offer.priceKrw>0)??item.offer})
 const pricedAdvice=advice?.offer?{...advice,offer:hydrate({offer:advice.offer}).offer}:advice
 const {offers,sources,compatibilityNote:note}=upgradePresentation(pricedAdvice,recommendations.map(hydrate),specs,category)
 return <div className="pc-hardware-upgrade">
  <h3>AI가 분석한 {category} 개선 방향</h3>
  {!ready?<p>{result?.explanationStatus==='RATE_LIMITED'?'AI 이용 한도로 분석이 중단됐어요.':'PC 사양을 적용하고 AI 분석을 완료하면 확인할 수 있어요.'}</p>:<>
   {advice?<><strong className="pc-hardware-verdict">{({KEEP:'현재 구성 유지 가능',UPGRADE:'교체 검토',CHECK:'추가 확인 필요'})[advice.status]??'추가 확인 필요'}</strong><p>{advice.reason}</p>{note&&<p className="pc-hardware-compatibility">{note}</p>}{advice.status==='UPGRADE'&&offers.length===0&&<p>현재 비교 후보에서 적절한 제품을 선정하지 못했어요.</p>}</>:<p>이 부품의 개선 방향은 AI가 제공하지 않았어요.</p>}
   {offers.map(({offer,reason,compatibilityNote})=><article className="pc-hardware-offer" key={offer.part.productCode}>
    <small>검토할 제품 후보 · 장착 호환 확인 필요</small><h4>{offer.part.name}</h4><strong>{partsLoading&&offer.status!=='OBSERVED'?'가격 확인 중…':partPriceLabel(offer)}</strong>
    {reason&&reason!==advice?.reason&&<p>{reason}</p>}
    {compatibilityNote&&compatibilityNote!==advice?.compatibilityNote&&<p>{compatibilityNote}</p>}
    {offer.part.compatibilityChecks?.length>0&&<ul>{offer.part.compatibilityChecks.map(text=><li key={text}>{text}</li>)}</ul>}
    {offer.note&&<p>{offer.note}</p>}
    {offer.priceSourceUrl&&<a href={offer.priceSourceUrl} target="_blank" rel="noreferrer">가격·판매처 확인 ↗</a>}
    {offer.checkedAt&&<small>가격 확인: {new Date(offer.checkedAt).toLocaleString('ko-KR')} · 배송비·재고·혜택은 판매처 확인</small>}
   </article>)}
  </>}
  {ready&&sources.length>0&&<div className="pc-hardware-source">{sources.map(source=><a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a>)}<small>일반 규격 확인 자료 · 정확한 기기 모델의 호환 확인이 필요해요.</small></div>}
 </div>
}
