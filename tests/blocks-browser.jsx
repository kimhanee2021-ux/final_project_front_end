import ReactDOM from 'react-dom/client'
import {useState} from 'react'
import HangulBlocks from '../src/features/hangul-blocks/components/HangulBlocks'
import {makeGame,SHAPES} from '../src/features/hangul-blocks/model/engine'
import '../src/shared/styles/gamesense.css'

// 실제 게임 컴포넌트에 고정 보드와 지급 순서만 주입한다. 보관함은 비어 있다.
// 일반 배포의 index.html에서는 참조하지 않는 별도 검증 진입점이다.
let call=0
const rolls=[.95,0,.95,0,.4,.95,.8,.95]
const random=()=>rolls[call++]??.95
function gameFactory(stage) {
  call=0
  if(stage===6)return makeGame(6,()=>.95)
  const game=makeGame(5,()=>.95)
  game.lines=7
  game.board=Array.from({length:20},(_,y)=>Array.from({length:10},(_,x)=>y>=4&&x!==4?'#526878':null))
  game.piece={...SHAPES[9],x:3,y:0}
  game.next=[SHAPES[9],SHAPES[9],SHAPES[9]]
  return game
}
export default function BrowserCheck() {
  const [key,setKey]=useState('입력 대기')
  return <main className="gs-shell" style={{padding:24}} onKeyDownCapture={e=>setKey(`${e.key} / ${e.code} / ${e.location}`)}><p role="note">고정 보드 검증 · 5단계 7줄 제거 상태부터 시작 · 15줄을 직접 제거 후 보상 선택 · 일반 게임과 별도</p><output aria-label="검증 키 입력">{key}</output><HangulBlocks gameFactory={gameFactory} random={random} recordKey="gamesense-hangul-browser-check-v1"/></main>
}
ReactDOM.createRoot(document.getElementById('root')).render(<BrowserCheck/> )
