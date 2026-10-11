export function demoRound(catalog, {rounds, groups, history}) {
  const byId=new Map(catalog.games.map(g=>[g.appId,g]))
  const positive=history.flatMap(c=>c.verdict==='both'?[c.leftId,c.rightId]:c.verdict==='left'?[c.leftId]:c.verdict==='right'?[c.rightId]:[])
  const favorites=[...new Set(positive)].map(id=>byId.get(id)).filter(Boolean)
  const tags=new Map()
  for(const game of favorites)for(const tag of game.tags)tags.set(tag,(tags.get(tag)||0)+1)
  const traits=[...tags].sort((a,b)=>b[1]-a[1]).slice(0,4).map(([tag])=>tag)
  if(history.length===rounds)return {complete:true,pair:[],explanation:'',summary:favorites.length?`샘플 결과: 이번에 좋아한 게임에서 ${traits.join(' · ')} 특징이 보였어요. 실제 AI에서는 선택 이유와 게임 정보를 함께 해석해 더 자세한 취향을 보여줘요.`:'샘플 결과: 아직 선호한 게임이 없어 취향을 정하기 어려워요. 다른 게임으로 다시 체험해보세요.',traits,evidence:history.filter(c=>['left','right','both'].includes(c.verdict)).slice(0,6).map(c=>`${(c.verdict==='both'?[c.leftId,c.rightId]:[c.verdict==='left'?c.leftId:c.rightId]).map(id=>byId.get(id).name).join(' / ')} 선호 선택${c.reasons.length?` · 이유: ${c.reasons.join(', ')}`:''}${c.note?` · ${c.note}`:''}`),uncertainty:'데모의 샘플 분석입니다. Gemini를 호출하지 않으며 기록은 저장되지 않아요.',favorites:favorites.slice(0,3)}
  const seen=new Set(history.flatMap(c=>[c.leftId,c.rightId]))
  const pool=catalog.games.filter(g=>!seen.has(g.appId)&&(!groups.length||g.groupIds.some(id=>groups.includes(id))))
  pool.sort((a,b)=>b.tags.reduce((n,t)=>n+(tags.get(t)||0),0)-a.tags.reduce((n,t)=>n+(tags.get(t)||0),0))
  return {complete:false,pair:pool.slice(0,2),explanation:history.length?'샘플 대결: 이전에 좋아한 게임의 특징을 참고해서 다음 게임을 골랐어요.':'샘플 대결: 두 게임을 비교하고 선택 방법을 체험해보세요.',summary:'',traits:[],evidence:[],uncertainty:'',favorites:[]}
}
export async function loadDemoCatalog(){const [games,groups]=await Promise.all([import('./demoGames.json'),import('./demoGroups.json')]);return {games:games.default,groups:groups.default,count:games.default.length}}
