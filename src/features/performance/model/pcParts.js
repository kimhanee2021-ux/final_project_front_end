export function partPriceLabel(offer){
 if(offer.status==='UNAVAILABLE')return '판매가 없음'
 return offer.status==='OBSERVED'&&Number.isFinite(offer.priceKrw)&&offer.priceKrw>0?`${offer.priceKrw.toLocaleString('ko-KR')}원`:'가격 확인 불가'
}
