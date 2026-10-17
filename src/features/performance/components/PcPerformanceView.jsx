import { useEffect, useRef, useState } from 'react'
import GSIcon from '../../../components/common/GSIcon'
import PanelHeading from './PanelHeading'

const hardware = [
  { id: 'cpu', label: 'CPU', name: '프로세서', icon: 'cpu', tone: 'blue' },
  { id: 'gpu', label: 'GPU', name: '그래픽 카드', icon: 'gpu', tone: 'mint' },
  { id: 'ram', label: 'RAM', name: '메모리', icon: 'ram', tone: 'purple' },
  { id: 'ssd', label: 'SSD', name: '저장장치', icon: 'drive', tone: 'gold' },
]
const resolutions = [ ['FHD', '1920 × 1080'], ['QHD', '2560 × 1440'], ['4K', '3840 × 2160'] ]

function DiagnoseButton({ again = false, onClick }) {
  return <button className="pc-start-button" onClick={onClick}>
    <GSIcon name={again ? 'refresh' : 'monitor'} size={17} />
    {again ? '다시 진단하기' : '지금 진단하기'}
    <GSIcon name="arrow" size={17} />
  </button>
}

function GradeSummary({ onDiagnose }) {
  return <section className="pc-grade-summary" aria-labelledby="pc-grade-heading">
    <h2 id="pc-grade-heading"><GSIcon name="shield" size={19} />종합 성능 등급</h2>
    <div className="pc-grade-ring" role="img" aria-label="종합 성능 등급 미판정, 정보 없음">
      <svg viewBox="0 0 180 180" aria-hidden="true"><circle cx="90" cy="90" r="73" /><circle className="pc-ring-inner" cx="90" cy="90" r="62" /></svg>
      <div><strong>—</strong><span>진단 전</span></div>
    </div>
    <span className="pc-grade-state">정보 없음</span>
    <DiagnoseButton again onClick={onDiagnose} />
    <div className="pc-grade-key" aria-label="등급 기준"><span>A · B · C · D</span><span>O 합격</span><span>X 평가 불가</span></div>
  </section>
}

function HardwareStrip() {
  return <section className="pc-spec-strip" aria-label="내 PC 하드웨어">
    {hardware.map(item => <article key={item.id} className={`pc-spec-item pc-${item.tone}`}>
      <div className="pc-spec-heading"><span className="pc-spec-icon"><GSIcon name={item.icon} size={24} /></span><div><h2>{item.label}</h2><span>{item.name}</span></div><strong>0<small>%</small></strong></div>
      <div className="pc-spec-meter" role="meter" aria-label={`${item.label} 진단 전`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={0}><i /></div>
      <div className="pc-spec-empty"><span>정보 없음</span><span>진단 대기</span></div>
    </article>)}
  </section>
}

function SetupDialog({ mode, onClose }) {
  const dialogRef = useRef(null)
  useEffect(() => {
    const previous = document.activeElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.querySelector('button')?.focus()
    return () => { document.body.style.overflow = overflow; previous?.focus() }
  }, [])
  function handleKeys(event) {
    if (event.key === 'Escape') onClose()
    if (event.key !== 'Tab') return
    const items = [...dialogRef.current.querySelectorAll('button:not([disabled]),input:not([disabled])')]
    const first = items[0], last = items.at(-1)
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
  }
  const [query, setQuery] = useState('')
  // UI 검토 단계에는 실제 결과를 생성하지 않는다. 사양/카탈로그 연결 후 이 진입점을 사용한다.
  const [message, setMessage] = useState('')
  return <div className="pc-dialog-backdrop" onClick={onClose}>
    <section ref={dialogRef} className="pc-setup-dialog" role="dialog" aria-modal="true" aria-labelledby="pc-dialog-heading" onClick={event => event.stopPropagation()} onKeyDown={handleKeys}>
      <div className="pc-dialog-heading"><GSIcon name={mode === 'diagnose' ? 'monitor' : 'gamepad'} size={24} /><h2 id="pc-dialog-heading">{mode === 'diagnose' ? '내 PC 진단 준비' : '어떤 게임을 확인할까요?'}</h2><button aria-label="닫기" onClick={onClose}><GSIcon name="close" size={19} /></button></div>
      {mode === 'diagnose' ? <><p>내 PC의 실제 사양을 가져온 뒤 진단을 시작해요.</p><div className="pc-dialog-steps"><span><b>1</b>PC 사양 가져오기</span><span><b>2</b>게임 선택하기</span><span><b>3</b>AI 진단 확인하기</span></div><div className="pc-dialog-note"><GSIcon name="info" size={18} /><p>아직 가져온 PC 정보가 없어요. 실제 사양 연결 전에는 등급과 성능 결과를 표시하지 않아요.</p></div></>
        : <><p>내 보유 게임을 확인하거나, 다른 게임을 검색해 내 PC와 비교해 보세요.</p><button className="pc-owned-option" onClick={() => setMessage('보유 게임과 PC 사양을 연결한 뒤 목록을 불러올 수 있어요.')}><GSIcon name="library" size={20} /><span>내 보유 게임 확인하기</span><GSIcon name="arrow" size={18} /></button><form onSubmit={event => { event.preventDefault(); setMessage(query.trim() ? `‘${query.trim()}’의 실제 게임 정보를 연결한 뒤 비교할 수 있어요.` : '확인할 게임 이름을 입력해 주세요.') }}><label htmlFor="pc-game-search">다른 게임 알아보기</label><div className="pc-game-query"><GSIcon name="search" size={18} /><input id="pc-game-search" value={query} onChange={event => setQuery(event.target.value)} maxLength={100} placeholder="어떤 게임이 궁금하세요?" /><button type="submit" aria-label="게임 검색"><GSIcon name="arrow" size={20} /></button></div></form><p className="pc-dialog-feedback" role="status">{message}</p></>}
    </section>
  </div>
}

export default function PcPerformanceView() {
  const [dialog, setDialog] = useState(null)
  return <div className="pc-page pc-diagnosis">
    <section className="pc-hero pc-diagnosis-hero" aria-labelledby="pc-page-title">
      <div className="pc-hero-background" />
      <div className="pc-hero-copy"><p className="pc-eyebrow">MY PC. MY PLAY.</p><h1 id="pc-page-title">내 PC 성능 체크<span>.</span></h1><p className="pc-hero-description">내 컴퓨터를 알고,<br />나에게 맞는 플레이를 시작하세요.</p><div className="pc-hero-actions"><DiagnoseButton onClick={() => setDialog('diagnose')} /></div><span className="pc-hero-footnote"><GSIcon name="shield" size={13} />실제 PC 사양을 바탕으로 진단해요</span></div>
      <GradeSummary onDiagnose={() => setDialog('diagnose')} />
    </section>
    <HardwareStrip />
    <section className="pc-panel pc-game-diagnosis" aria-labelledby="pc-games-heading">
      <div className="pc-section-top"><PanelHeading icon="gamepad" title="게임별 예상 성능" subtitle="내 PC에서 어떤 플레이가 가능한지 비교해 보세요." /><button className="pc-outline-action" onClick={() => setDialog('games')}><GSIcon name="library" size={16} />내 보유 게임 적용하기<GSIcon name="arrow" size={16} /></button></div>
      <div className="pc-resolution-table" role="table" aria-label="게임별 해상도 성능 비교"><div className="pc-resolution-head" role="row"><span role="columnheader">게임</span>{resolutions.map(([name, size]) => <div key={name} role="columnheader"><strong>{name}</strong><small>{size}</small></div>)}</div><div className="pc-games-empty"><span className="pc-empty-symbol"><GSIcon name="gamepad" size={30} /></span><h3>어떤 게임을 플레이하고 싶으세요?</h3><p>보유 게임을 가져오거나, 궁금한 게임을 찾아보세요.</p><button className="pc-inline-action" onClick={() => setDialog('games')}>다른 게임 알아보기<GSIcon name="arrow" size={17} /></button></div></div>
    </section>
    <section className="pc-panel pc-ai-explanation"><PanelHeading icon="spark" title="AI 종합 설명" subtitle="진단 결과의 이유부터 설정에 따른 차이까지, 한곳에서." /><div className="pc-ai-empty"><span className="pc-ai-orbit"><GSIcon name="spark" size={27} /></span><div><h3>PC와 게임을 알면, AI가 설명해 드려요.</h3><p>FHD · QHD · 4K의 차이와 성능을 제한하는 항목,<br className="pc-desktop-break" />조절하면 좋은 설정을 함께 알려드려요.</p></div><span className="pc-waiting-label"><i />진단 대기</span></div></section>
    <section className="pc-panel pc-upgrade-diagnosis"><PanelHeading icon="bulb" title="추천 업그레이드" subtitle="진단에서 필요한 개선점을 찾은 뒤, 나에게 맞는 부품을 비교해요." /><div className="pc-upgrade-empty"><GSIcon name="cpu" size={30} /><div><h3>먼저 내 PC를 확인해 주세요.</h3><p>호환되는 부품의 모델·가격·할인 정보를 비교하고, 추천 이유를 함께 보여드려요.</p></div><span>진단 후 확인</span></div></section>
    {dialog && <SetupDialog key={dialog} mode={dialog} onClose={() => setDialog(null)} />}
  </div>
}

