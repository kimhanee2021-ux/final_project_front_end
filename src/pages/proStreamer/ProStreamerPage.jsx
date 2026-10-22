import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { GSIcon, Panel, PanelPage } from '@/shared/ui'
import games from './gameFrequency.json'
import videosByGame from './videos.json'
import VideoList from './VideoList'

const slots = [
  { label: '프로 플레이', description: '선수의 판단과 운영을 살펴볼 플레이 영상', icon: 'trophy' },
  { label: '스트리머 플레이', description: '게임의 분위기와 재미를 알아볼 플레이 영상', icon: 'gamepad' },
  { label: '하이라이트', description: '주요 장면을 짧게 살펴볼 영상', icon: 'spark' },
  { label: '공략·해설', description: '플레이 방법과 전략을 이해할 영상', icon: 'info' },
]

export default function ProStreamerPage() {
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const selected = games.find(game => String(game.appId) === params.get('app')) || games[0]
  const videos = videosByGame[selected.appId] || []
  const filtered = games.filter(game => game.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
  function selectGame(game) {
    setParams(previous => {
      const next = new URLSearchParams(previous)
      next.set('app', String(game.appId))
      return next
    })
  }
  return (
    <PanelPage>
      <Panel>
        <div className="mb-[16px] flex flex-wrap items-center gap-[8px] text-[11px] font-[700] text-primary-text">
          <GSIcon name="gamepad" size={17} /><span>게임 탐색</span>
          <span className="rounded-full bg-primary-soft px-[10px] py-[4px]">플레이 영상</span>
        </div>
        <h1 className="text-[30px] font-[800] tracking-[-1px] max-[700px]:text-[25px]">프로·스트리머 플레이</h1>
        <p className="mt-[10px] max-w-[650px] text-[14px] leading-[1.8] text-muted">랭킹에서 발견한 게임, 플레이 영상으로 더 가까이 만나보세요.</p>
        <div className="mt-[22px] flex flex-wrap gap-[8px] text-[12px]">
          <span className="rounded-[8px] bg-surface-soft px-[12px] py-[8px]">게임 <b>{games.length}종</b></span>
          <span className="rounded-[8px] bg-surface-soft px-[12px] py-[8px]">게임별 영상 <b>4개 구성</b></span>
          <span className="rounded-[8px] bg-surface-soft px-[12px] py-[8px]">12개국 · 수집된 5주 기준</span>
        </div>
        <p className="mt-[14px] text-[11px] leading-[1.8] text-muted">2026.09.08–10.06 시작 주차의 TOP 10 등장 횟수 기준 상위 50개 게임입니다. 동률은 이름순이며, 판매량이나 영상 인기도를 뜻하지 않습니다. 하드웨어·DLC는 제외했습니다.</p>
      </Panel>
      <div className="grid grid-cols-[280px_minmax(0,1fr)] items-start gap-[20px] max-[900px]:grid-cols-1">
        <Panel>
          <div className="mb-[14px] flex items-center justify-between">
            <h2 className="text-[16px] font-[750]">게임 선택</h2>
            <span className="text-[11px] text-muted">등장 빈도순</span>
          </div>
          <label htmlFor="play-game-search" className="mb-[7px] block text-[12px] text-muted">게임명 검색</label>
          <input id="play-game-search" type="search" value={query} onChange={event => setQuery(event.target.value)}
            placeholder="게임명을 입력하세요" className="mb-[14px] min-h-[44px] w-full rounded-[10px] border border-border bg-surface-soft px-[12px] text-[13px] text-text" />
          <p role="status" className="mb-[10px] text-[11px] text-muted">{filtered.length}개 게임</p>
          <div className="max-h-[600px] overflow-y-auto pr-[4px] max-[900px]:max-h-[230px]" role="group" aria-label="등장 빈도순 게임 목록">
            {filtered.length ? filtered.map(game => (
              <button key={game.appId} type="button" aria-pressed={game.appId === selected.appId}
                onClick={() => selectGame(game)}
                className={`mb-[6px] flex w-full items-center gap-[10px] rounded-[10px] border px-[10px] py-[13px] text-left ${game.appId === selected.appId ? 'border-insight-border bg-primary-soft text-primary-text' : 'border-transparent hover:bg-surface-hover'}`}>
                <span className="w-[24px] shrink-0 text-[12px] font-[750] tabular-nums">{game.position}</span>
                <span className="min-w-0 flex-1 break-words text-[13px] font-[650]">{game.name}</span>
                <span className="shrink-0 text-[11px] tabular-nums">{game.frequency}회</span>
              </button>
            )) : <p className="py-[20px] text-[13px] leading-[1.8] text-muted">검색 결과가 없습니다. 다른 게임명을 입력해 주세요.</p>}
          </div>
        </Panel>
        <div className="min-w-0" aria-live="polite">
          <Panel>
            <div className="flex flex-wrap items-start justify-between gap-[14px]">
              <div className="min-w-0">
                <span className="text-[11px] font-[700] text-primary-text">선택한 게임 · 목록 {selected.position}번</span>
                <h2 className="mt-[7px] break-words text-[25px] font-[800] leading-[1.4] max-[700px]:text-[22px]">{selected.name}</h2>
                <p className="mt-[8px] text-[12px] text-muted">TOP 10 등장 {selected.frequency}회 · {selected.countryCount}개국</p>
              </div>
              <span className="rounded-full bg-surface-soft px-[12px] py-[7px] text-[11px] text-muted">등록 영상 {videos.length} / 4</span>
            </div>
            <p className="mt-[18px] border-t border-border pt-[14px] text-[12px] leading-[1.8] text-muted">{videos.length ? '영상을 누르면 이 화면에서 재생됩니다. 게임이나 영상을 바꾸면 이전 재생은 종료됩니다. 재생이 제한되면 ‘유튜브에서 보기’를 이용해 주세요.' : '이 게임의 영상은 아직 선정 중입니다. 등장 빈도 상위 50개 게임에서 실제 플레이와 공략 영상을 먼저 만나보세요.'}</p>
          </Panel>
          <div className="mt-[16px] grid grid-cols-2 gap-[16px] max-[700px]:grid-cols-1" aria-label={`${selected.name} 영상 목록 4개`}>
            {videos.length ? <VideoList key={selected.appId} videos={videos} /> : slots.map((slot, index) => (
              <article key={`${selected.appId}-${slot.label}`} className="min-w-0 overflow-hidden rounded-[16px] border border-border bg-surface">
                <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-primary-soft to-surface-soft">
                  <span className="absolute left-[14px] top-[14px] rounded-full border border-border bg-surface px-[10px] py-[5px] text-[10px] font-[700]">{String(index + 1).padStart(2, '0')} · {slot.label}</span>
                  <div className="flex flex-col items-center gap-[10px] text-primary-text">
                    <span className="flex h-[52px] w-[52px] items-center justify-center rounded-[16px] border border-border bg-surface"><GSIcon name={slot.icon} size={25} /></span>
                    <span className="text-[11px] font-[650]">영상 선정 중</span>
                  </div>
                </div>
                <div className="p-[18px]">
                  <h3 className="text-[16px] font-[750]">{slot.label}</h3>
                  <p className="mt-[6px] break-words text-[12px] font-[650] text-primary-text">{selected.name}</p>
                  <p className="mt-[10px] text-[12px] leading-[1.8] text-muted">{slot.description}</p>
                  <div className="mt-[18px] flex items-center justify-between gap-[8px] border-t border-border pt-[12px] text-[11px] text-muted">
                    <span>채널 · 게시일 확인 예정</span><span>등록 준비 중</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <Link to="/weekly-rankings" className="mt-[20px] inline-flex items-center gap-[8px] text-[13px] font-[650] text-primary-text"><GSIcon name="chart" size={16} />스팀 국가별 주간랭킹 보기</Link>
        </div>
      </div>
    </PanelPage>
  )
}
