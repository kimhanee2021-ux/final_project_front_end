const samplePrices=new Map([[1145360,2700000],[367520,1650000],[1868140,2400000]])

export function managerDemoProduct(game,now=new Date().toISOString()){
 return {appId:game.appId,name:game.name,type:'game',parentAppId:null,currency:'KRW',minorPrice:samplePrices.get(game.appId)??2000000,imageUrl:game.imageUrl,dlcIds:[],checkedAt:now}
}

export function createManagerDemo(games,now=new Date().toISOString()){
 const byId=new Map(games.map(g=>[g.appId,g]))
 const owned=[105600,620,413150,526870,646570,292030].map((id,index)=>({appId:id,name:byId.get(id).name,minutes:[3600,720,2400,1800,540,1200][index],source:'데모 샘플 · 플레이 시간 예시'}))
 const collection=(id,name,explanation,appIds)=>({id,kind:'collection',data:{name,explanation,appIds}})
 const watch=(id,appId,targetWon,label,error='')=>{const p=managerDemoProduct(byId.get(appId),now);return {id,kind:'watch',data:{appIds:[appId],targetWon,label,enabled:true,lastChecked:now,matched:!error&&p.minorPrice<=targetWon*100,error,prices:[p],totalMinor:p.minorPrice}}}
 const earlier=new Date(new Date(now).getTime()-86400000).toISOString()
 return {catalog:games,owned,checkIntervalMinutes:60,records:[
  collection(101,'샘플 · 탐험하고 싶은 날','탐험 요소를 기준으로 모아 둔 컬렉션 예시예요. 실제 AI 분석 결과가 아니에요.',[105600,292030]),
  collection(102,'샘플 · 퍼즐과 전략','퍼즐과 전략 게임을 구분해서 정리한 예시예요. 원하는 이름과 구성을 바꿔볼 수 있어요.',[620,646570]),
  watch(201,1145360,20000,'샘플 · Hades 할인 기다리기'),
  watch(202,367520,20000,'샘플 · Hollow Knight 구매 조건 충족'),
  watch(203,1868140,15000,'샘플 · DAVE THE DIVER 가격 확인','샘플 조회 실패: 가격을 가져오지 못했어요. ‘샘플 다시 확인’을 눌러 재시도 화면을 체험하세요.'),
  {id:301,kind:'notification',data:{watchId:202,title:'샘플 · Hollow Knight 구매 조건 충족',message:'샘플 알림: 예시 가격 16,500원이 목표 20,000원 이하예요. 실제 할인이나 현재 상점 가격을 의미하지 않아요.',read:false,createdAt:now}},
  {id:302,kind:'notification',data:{watchId:201,title:'샘플 · 이전 Hades 할인 알림',message:'샘플 알림: 이전 예시 가격 18,000원이 목표 20,000원 이하였던 상황이에요. 지금 대기 카드의 샘플 가격은 27,000원이에요.',read:true,createdAt:earlier}},
 ]}
}

export function applyManagerDemoAction(state,id,type,now=new Date().toISOString()){
 const record=state.records.find(r=>r.id===id)
 if(!record)return state
 if(type==='delete')return {...state,records:state.records.filter(r=>r.id!==id)}
 let data={...record.data},notification=null
 if(type==='read')data.read=true
 if(type==='pause'){data.enabled=!data.enabled;if(data.enabled){data.matched=false;data.lastChecked=''}}
 if(type==='check'&&data.enabled){
  const matched=data.totalMinor!=null&&data.totalMinor<=data.targetWon*100
  if(matched&&!data.matched)notification={id:Math.max(1000,...state.records.map(r=>r.id))+1,kind:'notification',data:{watchId:id,title:data.label,message:'샘플 알림: 예시 가격이 목표 금액을 충족했어요. 실제 가격 조회나 서버 감시는 하지 않아요.',read:false,createdAt:now}}
  data={...data,lastChecked:now,matched,error:''}
 }
 return {...state,records:[...(notification?[notification]:[]),...state.records.map(r=>r.id===id?{...r,data}:r)]}
}
