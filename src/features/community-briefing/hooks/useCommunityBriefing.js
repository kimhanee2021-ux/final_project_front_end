import { useEffect, useState } from 'react'
import { fetchBriefing, fetchOfficialNews, fetchSourceGames } from '../api'

export function useCommunityBriefing(enabled) {
  const [page, setPage] = useState(0)
  const [appId, setAppId] = useState('')
  const [revision, setRevision] = useState(0)
  const [group, setGroup] = useState('NOTICE')
  const [topic, setTopic] = useState('')
  const [aiPage, setAiPage] = useState(0)
  const [state, setState] = useState({ loading: true, error: '', briefing: null, news: null })
  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    let active = true
    Promise.allSettled([fetchBriefing(aiPage, appId, controller.signal, group, topic), fetchOfficialNews(page, appId, controller.signal), fetchSourceGames(controller.signal)]).then(([briefing, news, games]) => {
      if (!active) return
      setState({ loading: false, briefing: briefing.status === 'fulfilled' ? briefing.value : null, news: news.status === 'fulfilled' ? news.value : null, games: games.status === 'fulfilled' ? games.value : [],
        error: briefing.status === 'rejected' || news.status === 'rejected' ? '일부 정보를 불러오지 못했어요. 잠시 후 다시 확인해 주세요.' : '' })
    })
    return () => { active = false; controller.abort() }
  }, [enabled, page, appId, revision, group, topic, aiPage])
  const loading = () => setState(previous => ({ ...previous, loading: true, error: '' }))
  const selectGame = value => { if (value === appId) return; loading(); setPage(0); setAiPage(0); setAppId(value) }
  const selectGroup = value => { if (value === group && !topic && aiPage === 0) return; loading(); setGroup(value); setTopic(''); setAiPage(0) }
  const selectTopic = value => { if (value === topic && aiPage === 0) return; loading(); setTopic(value); setAiPage(0) }
  const movePage = value => { setState(previous => ({ ...previous, loading: true })); setPage(value) }
  return { ...state, page, appId, group, topic, aiPage, selectGame, selectGroup, selectTopic, movePage,
    moveAiPage: value => { loading(); setAiPage(value) }, retry: () => { loading(); setRevision(value => value + 1) } }
}
