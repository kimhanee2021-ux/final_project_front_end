// 스팀 라이선스 획득 방법 -> 화면 문구
export const METHOD_LABELS = {
  STORE: '스팀 상점',
  GIFT: '선물로 받음',
  COMPLIMENTARY: '무료로 받음',
  KEY: '제품 키 등록',
  OTHER: '기타',
}

// 구매 기록이 없는 게임에 보여줄 이유. 스팀 상점에서 얻었는데 결제 기록이 없으면(옛 패키지 이름 등) 그대로 "구매 기록 없음"
export const noRecordLabel = method =>
  method && method !== 'STORE' && method !== 'OTHER' ? METHOD_LABELS[method] : '구매 기록 없음'
