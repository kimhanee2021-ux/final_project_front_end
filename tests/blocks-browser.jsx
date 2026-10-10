import ReactDOM from 'react-dom/client'
import {useState} from 'react'
import HangulBlocks from '../src/pages/blocks/HangulBlocks'
import {makeGame,SHAPES} from '../src/pages/blocks/engine'
import '../src/styles/gamesense.css'

// 실제 게임 컴포넌트에 고정 보드와 지급 순서만 주입한다. 보관함은 비어 있다.
// 일반 배포의 index.html에서는 참조하지 않는 별도 검증 진입점이다.
let call=0
const rolls=[.95,0,.95,0,.4,.95,.8,.95]
const random=()=>rolls[call++]??.95
function gameFactory() {
  call=0
  const game=makeGame(40,()=>.95)
  game.board=Array.from({length:20},(_,y)=>Array.from({length:10},(_,x)=>y>=4&&x!==4?'#526878':null))
  game.piece={...SHAPES[9],x:3,y:0}
  game.next=[SHAPES[9],SHAPES[9],SHAPES[9]]
  return game
}
export default function BrowserCheck() {
  const [key,setKey]=useState('입력 대기')
  return <main className="gs-shell" style={{padding:24}} onKeyDownCapture={e=>setKey(`${e.key} / ${e.code} / ${e.location}`)}><p role="note">브라우저 검증용 고정 보드 · 아이템은 줄 제거로 획득 · 일반 게임과 별도</p><output aria-label="검증 키 입력">{key}</output><HangulBlocks gameFactory={gameFactory} random={random}/></main>
}
ReactDOM.createRoot(document.getElementById('root')).render(<BrowserCheck/> )
