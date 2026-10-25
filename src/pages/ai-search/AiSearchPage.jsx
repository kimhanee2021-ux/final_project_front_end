import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { GSIcon } from '@/shared/ui'
import { GameAiBriefing, SearchForm, SearchResults, rememberSearch, searchGames, toBriefingCommand, useAiSearch } from '@/features/ai-search'
import { newsView } from '@/features/bbs/model/news'
import BbsWorkspace from '@/features/bbs/components/BbsWorkspace'
import BbsVoiceOrb from '@/features/bbs/components/BbsVoiceOrb'
import BbsVoiceCommandStatus from '@/features/bbs/components/BbsVoiceCommandStatus'
import { useBbsVoiceSearch } from '@/features/bbs/hooks/useBbsVoiceSearch'
import { useBbsResource } from '@/features/bbs/hooks/useBbsResource'
import { BbsAudioFocus, createBbsAudioFocus, useBbsAudioFocus } from '@/features/bbs/hooks/bbsAudioFocus'
import { useVoiceBriefingFlow } from '@/features/bbs/hooks/useVoiceBriefingFlow'
import { VoiceBriefingContext } from '@/features/bbs/hooks/voiceBriefingContext'
import '@/features/bbs/styles/bbs.css'

// 음성 요청과 글 요청을 BBS 브리핑 흐름이 받는 명령으로 바꾼다. 해석은 AI 검색 API 한 번으로 한다 (BBS 별명 테이블을 쓰지 않는다).
// 최신 소식 요청이면 흐름이 주소의 검색 문장을 게임 이름으로 바꾸므로, 그 이름으로도 같은 결과를 보이게 기억해 둔다.
async function resolveRequest(transcript) {
  const data = await searchGames(transcript)
  const command = toBriefingCommand(data)
  if (command.status === 'RESOLVED') rememberSearch(command.game.name, data)
  return command
}

function VoiceSearch({ onTranscript, onStart }) {
  const voice = useBbsVoiceSearch(onTranscript)
  const claim = useBbsAudioFocus('microphone', voice.cancel)
  return <>
    <BbsVoiceOrb phase={voice.phase} message={voice.message} transcript={voice.transcript} onStart={() => { onStart(); claim(); voice.start() }} onCancel={voice.cancel} />
    {voice.phase === 'ERROR' && <div className="bbs-voice-error" role="alert">
      <p>{voice.message}</p><button type="button" className="bbs-text-button" onClick={voice.cancel}>닫기</button>
    </div>}
  </>
}

// AI 게임 검색: 예전 BBS(음성 검색 · 공식 소식 · 한국어 요약 · 낭독)와 AI 게임 브리핑을 합친 화면.
// 위에서 말하거나 적으면 AI가 게임을 찾고, 게임을 고르면 저장된 AI 브리핑과 Steam 공식 소식 · 한국어 요약 · 낭독을 보여준다.
// "OO 최신 소식 들려줘"는 그 게임의 최신 공식 소식을 바로 요약해 읽어 주고, "다음 소식 · 멈춰 · 계속 읽어줘"로 이어서 조작한다.
// 화면 상태(검색 문장 q, 고른 게임 appId, 소식 newsId·분류·쪽)는 주소에 둔다 (브리핑 흐름이 주소로 화면을 움직인다).
export default function AiSearchPage() {
  const [audioFocus] = useState(createBbsAudioFocus)
  const [voiceVersion, setVoiceVersion] = useState(0)
  // 지금 요청이 음성으로 들어왔는지. 진행 안내 상자("음성 요청 · 말씀하신 문장 · 진행 상황")는 음성 요청일 때만 띄운다
  const [spoken, setSpoken] = useState(false)
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const selectedId = params.get('appId') ?? ''
  const validId = /^[1-9]\d{0,9}$/.test(selectedId) && Number(selectedId) <= 4294967295
  const search = useAiSearch(query)
  const selected = useBbsResource(validId ? `/api/games/bbs/${selectedId}` : null)
  const news = useBbsResource(selected.data ? `/api/games/bbs/${selected.data.appId}/news` : null)
  const update = (changes, options) => {
    const next = new URLSearchParams(params)
    Object.entries(changes).forEach(([key, value]) => value ? next.set(key, String(value)) : next.delete(key))
    setParams(next, options)
    return next.toString()
  }
  const command = useVoiceBriefingFlow({ location: params.toString(), navigate: update, audioFocus,
    context: { game: selected.data, articleId: newsView(news.data?.items ?? [], params.get('category'), params.get('page'), params.get('newsId')).selected?.id },
    resolve: resolveRequest })
  const manual = changes => { command.cancel(); setVoiceVersion(version => version + 1); update(changes) }
  const request = text => { setSpoken(false); setVoiceVersion(version => version + 1); command.start(text) }
  const speak = transcript => { setSpoken(true); command.start(transcript) }
  // 글 요청은 안내 상자 없이, 실패나 알릴 내용만 검색창 아래 한 줄로 보여준다
  // (검색 결과로 이어진 요청은 결과가 곧 답이라 따로 알리지 않는다: 주소의 검색 문장이 요청 문장과 같다)
  const { phase, message, transcript } = command.state
  const typedNotice = !spoken && (phase === 'ERROR' || (phase === 'INFO' && transcript.trim() !== query)) ? message : ''
  const selectGame = appId => manual({ appId, newsId: null, category: null, page: null })

  // "GTFO", "스타듀 밸리 찾아줘"처럼 특정 게임을 찾는 문장이면 그 게임의 소식을 바로 연다 (검색 문장마다 한 번만)
  const autoOpened = useRef('')
  const found = search.result?.intent === 'FIND_GAME' ? search.result.matchedGame : null
  useEffect(() => {
    if (!found || selectedId || autoOpened.current === query) return
    autoOpened.current = query
    update({ appId: found.appId, newsId: null, category: null, page: null }, { replace: true })
  })

  return <BbsAudioFocus.Provider value={audioFocus}><VoiceBriefingContext.Provider value={command}><div className="bbs-page">
    <VoiceSearch key={`${voiceVersion}:${query}:${selectedId}`} onTranscript={speak} onStart={command.beginListening} />
    <header className="bbs-page-heading">
      <div><div className="bbs-heading-kicker"><span>AI</span><i /> GAME SEARCH</div>
        <h1>말하거나 적으면, AI가 게임을 찾아드려요.</h1>
        <p>원하는 게임을 설명하거나, 게임 이름과 함께 “최신 소식 들려줘”라고 말해 보세요.</p></div>
      <div className="bbs-heading-mark" aria-hidden="true"><GSIcon name="search" size={40} /><span>FIND YOUR<br />NEXT PLAY.</span></div>
    </header>
    {spoken && <BbsVoiceCommandStatus state={command.state} onCancel={command.dismiss} />}
    <section className="bbs-search-panel" aria-label="AI 게임 검색">
      <SearchForm key={query} initialQuery={query} busy={['INTERPRETING', 'NEWS', 'SUMMARY'].includes(phase)}
        onSearch={request} onTyping={command.cancel} />
      {typedNotice && <p className="mt-[12px] text-[14px] text-muted" role={phase === 'ERROR' ? 'alert' : 'status'}>{typedNotice}</p>}
      {query && <div className="mt-[26px]"><SearchResults search={search} selectedId={selectedId} onSelect={selectGame} /></div>}
    </section>
    {validId && <GameAiBriefing key={selectedId} appId={Number(selectedId)} />}
    <BbsWorkspace game={selected.data} loading={selected.loading}
      error={selectedId && !validId ? '게임 선택 주소가 올바르지 않아요. 게임을 다시 선택해 주세요.' : selected.error}
      onRetry={validId ? selected.retry : null}
      onClear={() => manual({ appId: null, newsId: null, category: null, page: null })}
      news={news} category={params.get('category')} page={params.get('page')}
      newsId={params.get('newsId')} onNewsChange={manual} />
  </div></VoiceBriefingContext.Provider></BbsAudioFocus.Provider>
}
