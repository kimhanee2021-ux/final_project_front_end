import { newsView } from '@/features/bbs/model/news'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { GSIcon } from '@/shared/ui'
import GameSearchPanel from '@/features/bbs/components/GameSearchPanel'
import BbsWorkspace from '@/features/bbs/components/BbsWorkspace'
import BbsVoiceOrb from '@/features/bbs/components/BbsVoiceOrb'
import { useBbsVoiceSearch } from '@/features/bbs/hooks/useBbsVoiceSearch'
import { useBbsResource } from '@/features/bbs/hooks/useBbsResource'
import { BbsAudioFocus, createBbsAudioFocus, useBbsAudioFocus } from '@/features/bbs/hooks/bbsAudioFocus'
import { useVoiceBriefingFlow } from '@/features/bbs/hooks/useVoiceBriefingFlow'
import { VoiceBriefingContext } from '@/features/bbs/hooks/voiceBriefingContext'
import BbsVoiceCommandStatus from '@/features/bbs/components/BbsVoiceCommandStatus'
import '@/features/bbs/styles/bbs.css'

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

export default function BbsPage() {
  const [audioFocus] = useState(createBbsAudioFocus)
  const [voiceVersion, setVoiceVersion] = useState(0)
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const selectedId = params.get('appId') ?? ''
  const validId = /^[1-9]\d{0,9}$/.test(selectedId) && Number(selectedId) <= 4294967295
  const results = useBbsResource(query ? `/api/games/bbs/search?q=${encodeURIComponent(query)}&limit=12` : null)
  const selected = useBbsResource(validId ? `/api/games/bbs/${selectedId}` : null)
  const news = useBbsResource(selected.data ? `/api/games/bbs/${selected.data.appId}/news` : null)
  const update = changes => {
    const next = new URLSearchParams(params)
    Object.entries(changes).forEach(([key, value]) => value ? next.set(key, String(value)) : next.delete(key))
    setParams(next)
    return next.toString()
  }
  const command = useVoiceBriefingFlow({ location: params.toString(), navigate: update, audioFocus,
    context: { game: selected.data, articleId: newsView(news.data?.items ?? [], params.get('category'), params.get('page'), params.get('newsId')).selected?.id } })
  const manual = changes => { command.cancel(); setVoiceVersion(version => version + 1); update(changes) }
  const search = value => {
    if (value === query) results.retry()
    else update({ q: value, appId: null, newsId: null, category: null, page: null })
  }

  return <BbsAudioFocus.Provider value={audioFocus}><VoiceBriefingContext.Provider value={command}><div className="bbs-page">
    <VoiceSearch key={`${voiceVersion}:${query}:${selectedId}`} onTranscript={command.start} onStart={command.beginListening} />
    <header className="bbs-page-heading">
      <div><div className="bbs-heading-kicker"><span>BBS</span><i /> GAME SENSE NEWSROOM</div>
        <h1>내 게임의 다음 이야기.</h1>
        <p>내 게임의 공식 소식, 한곳에서 읽어보세요.</p></div>
      <div className="bbs-heading-mark" aria-hidden="true"><GSIcon name="note" size={40} /><span>FOR YOUR<br />NEXT PLAY.</span></div>
    </header>
    <BbsVoiceCommandStatus state={command.state} onCancel={command.dismiss} />
    <GameSearchPanel query={query} selectedId={selectedId} result={results}
      onManualInput={() => { command.cancel(); setVoiceVersion(value => value + 1) }}
      onSearch={value => { command.cancel(); setVoiceVersion(version => version + 1); search(value) }}
      onSelect={appId => { if (!command.choose(appId)) manual({ appId, newsId: null, category: null, page: null }) }} />
    <BbsWorkspace game={selected.data} loading={selected.loading}
      error={selectedId && !validId ? '게임 선택 주소가 올바르지 않아요. 게임을 다시 선택해 주세요.' : selected.error}
      onRetry={validId ? selected.retry : null}
      onClear={() => manual({ appId: null, newsId: null, category: null, page: null })}
      news={news} category={params.get('category')} page={params.get('page')}
      newsId={params.get('newsId')} onNewsChange={manual} />
  </div></VoiceBriefingContext.Provider></BbsAudioFocus.Provider>
}
