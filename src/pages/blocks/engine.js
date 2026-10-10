const shape = (label, color, matrix) => ({ label, color, matrix })
export const SHAPES = [
  shape('ㄱ','#28e6bf',[[1,1,1],[0,0,1],[0,0,1]]),
  shape('ㄴ','#54baff',[[1,0,0],[1,0,0],[1,1,1]]),
  shape('ㄷ','#ffa254',[[1,1,1],[1,0,0],[1,1,1]]),
  shape('ㅁ','#ae82ff',[[1,1,1],[1,0,1],[1,1,1]]),
  shape('ㅏ','#f5d45c',[[1,0,0],[1,1,0],[1,0,0]]),
  shape('ㅓ','#f5d45c',[[0,0,1],[0,1,1],[0,0,1]]),
  shape('ㅗ','#ff83bd',[[0,1,0],[1,1,1],[0,0,0]]),
  shape('ㅜ','#ff83bd',[[0,0,0],[1,1,1],[0,1,0]]),
  shape('ㅡ','#b4e965',[[0,0,0],[1,1,1],[0,0,0]]),
  shape('ㅣ','#b4e965',[[0,1,0],[0,1,0],[0,1,0]]),
]
// 직접 구성한 시작 배치. 각 숫자는 해당 줄의 두 칸짜리 빈 공간 시작 위치다.
export const TEMPLATES = [[0,0,0,0],[8,8,8,8],[4,4,4,4],[0,2,4,6],[6,4,2,0],[2,3,4,5],[5,4,3,2],[1,1,6,6],[7,7,2,2],[3,5,3,5]]
export function stageTarget(stage) {
  if (!Number.isInteger(stage)||stage<1||stage>50) throw new RangeError('단계는 1~50입니다')
  return 10+3*(stage-1)
}
export const dropInterval = stage => { stageTarget(stage); return 900-70*Math.floor((stage-1)/5) }
export const cells = p => p.matrix.flatMap((row,y)=>row.flatMap((v,x)=>v?[[p.x+x,p.y+y]]:[]))
export const rotate = p => ({...p,matrix:p.matrix[0].map((_,x)=>p.matrix.map(row=>row[x]).reverse())})
const randomShape = rng => SHAPES[Math.min(9,Math.floor(rng()*10))]
const spawn = s => ({...s,x:3,y:0})
export const fits = (board,p) => cells(p).every(([x,y])=>x>=0&&x<10&&y>=0&&y<20&&!board[y][x])
export function makeGame(stage=1,rng=Math.random) {
  stageTarget(stage)
  const template=Math.min(9,Math.floor(rng()*10))
  const board=Array.from({length:20},(_,y)=>Array.from({length:10},(_,x)=>y<16||x===TEMPLATES[template][y-16]||x===TEMPLATES[template][y-16]+1?null:'#526878'))
  return {stage,template,board,piece:spawn(randomShape(rng)),next:Array.from({length:3},()=>randomShape(rng)),status:'playing',lines:0,score:0,placed:0,fall:0,ground:0,items:[],itemProgress:0,freezeMs:0}
}
export function ghost(s) {
  let p=s.piece
  while(fits(s.board,{...p,y:p.y+1}))p={...p,y:p.y+1}
  return p
}
function lock(s,rng) {
  if(!fits(s.board,s.piece))return {...s,status:'over'}
  let board=s.board.map(row=>[...row])
  if(s.piece.bomb) {
    const {x,y}=s.piece
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(board[y+dy]&&x+dx>=0&&x+dx<10)board[y+dy][x+dx]=null
    return {...s,board,piece:s.bombOriginal,bombOriginal:undefined,ground:0,fall:0}
  }
  for(const [x,y] of cells(s.piece))board[y][x]=s.piece.color
  const remaining=board.filter(row=>!row.every(Boolean)), cleared=20-remaining.length
  board=[...Array.from({length:cleared},()=>Array(10).fill(null)),...remaining]
  const piece=spawn(s.next[0]), lines=s.lines+cleared
  const status=lines>=stageTarget(s.stage)?(s.stage===50?'complete':'stage-clear'):fits(board,piece)?'playing':'over'
  const items=[...s.items], progress=s.itemProgress+cleared
  for(let i=0;i<Math.floor(progress/5);i++)if(items.length<3)items.push(['bomb','freeze','swap'][Math.min(2,Math.floor(rng()*3))])
  return {...s,board,piece,next:[...s.next.slice(1),randomShape(rng)],lines,status,placed:s.placed+1,score:s.score+cleared*cleared*100*s.stage,ground:0,fall:0,items,itemProgress:progress%5}
}
export function activateItem(s,type) {
  const index=s.items.indexOf(type)
  if(s.status!=='playing'||index<0||s.piece.bomb)return s
  let n
  if(type==='bomb')n={...s,bombOriginal:s.piece,piece:{matrix:[[1]],color:'#ff6262',label:'💣',bomb:true,x:s.piece.x+1,y:s.piece.y}}
  else if(type==='freeze') { if(s.freezeMs>0)return s;n={...s,freezeMs:5000} }
  else if(type==='swap') {
    const p={...s.next[0],x:s.piece.x,y:s.piece.y}
    if(!fits(s.board,p))return s
    n={...s,piece:p,next:[{label:s.piece.label,color:s.piece.color,matrix:s.piece.matrix},...s.next.slice(1)],ground:0,fall:0}
  } else return s
  if(!fits(n.board,n.piece))return s
  return {...n,items:s.items.filter((_,i)=>i!==index)}
}
export function act(s,action,rng=Math.random) {
  if(s.status!=='playing')return s
  if(action==='hard') { const p=ghost(s);return lock({...s,piece:p,score:s.score+(s.piece.bomb?0:Math.max(0,p.y-s.piece.y)*2)},rng) }
  if(action==='lock')return fits(s.board,{...s.piece,y:s.piece.y+1})?s:lock(s,rng)
  let p=s.piece
  if(action==='left'||action==='right')p={...p,x:p.x+(action==='left'?-1:1)}
  else if(action==='down')p={...p,y:p.y+1}
  else if(action==='rotate') {
    const rotated=rotate(p)
    for(const dx of [0,-1,1,-2,2]) {
      const candidate={...rotated,x:rotated.x+dx}
      if(fits(s.board,candidate))return {...s,piece:candidate}
    }
    return s
  } else return s
  return fits(s.board,p)?{...s,piece:p}:s
}
export function advance(s,ms,soft=false,rng=Math.random) {
  if(s.status!=='playing')return s
  if(s.freezeMs>0) {
    const frozen=Math.min(ms,s.freezeMs)
    s={...s,freezeMs:s.freezeMs-frozen};ms-=frozen
    if(ms===0)return s
  }
  let n={...s,fall:s.fall+ms}
  const interval=soft?55:dropInterval(s.stage)
  while(n.fall>=interval) { n={...act(n,'down',rng),fall:n.fall-interval} }
  n={...n,ground:fits(n.board,{...n.piece,y:n.piece.y+1})?0:n.ground+ms}
  return n.ground>=350?lock(n,rng):n
}
export const seoulDate = (date=new Date()) => new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(date)
export function readRecords(raw) {
  try { const a=JSON.parse(raw);return Array.isArray(a)?a.filter(r=>Number.isInteger(r.stage)&&r.stage>=1&&r.stage<=50&&Number.isFinite(r.score)&&r.score>=0&&['challenge','daily'].includes(r.mode)&&/^\d{4}-\d{2}-\d{2}$/.test(r.date)).slice(-100):[] } catch { return [] }
}
