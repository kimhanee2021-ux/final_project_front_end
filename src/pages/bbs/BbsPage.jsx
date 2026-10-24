import { useSearchParams } from 'react-router-dom'
import { GSIcon } from '@/shared/ui'
import GameSearchPanel from '@/features/bbs/components/GameSearchPanel'
import BbsWorkspace from '@/features/bbs/components/BbsWorkspace'
import { useBbsResource } from '@/features/bbs/hooks/useBbsResource'
import '@/features/bbs/styles/bbs.css'

export default function BbsPage() {
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
  }
  const search = value => {
    if (value === query) results.retry()
    else update({ q: value, appId: null, newsId: null, category: null, page: null })
  }

  return <div className="bbs-page">
    <header className="bbs-page-heading">
      <div><div className="bbs-heading-kicker"><span>BBS</span><i /> GAME SENSE NEWSROOM</div>
        <h1>내 게임의 다음 이야기.</h1>
        <p>내 게임의 공식 소식, 한곳에서 읽어보세요.</p></div>
      <div className="bbs-heading-mark" aria-hidden="true"><GSIcon name="note" size={40} /><span>FOR YOUR<br />NEXT PLAY.</span></div>
    </header>
    <GameSearchPanel query={query} selectedId={selectedId} result={results} onSearch={search}
      onSelect={appId => update({ appId, newsId: null, category: null, page: null })} />
    <BbsWorkspace game={selected.data} loading={selected.loading}
      error={selectedId && !validId ? '게임 선택 주소가 올바르지 않아요. 게임을 다시 선택해 주세요.' : selected.error}
      onRetry={validId ? selected.retry : null}
      onClear={() => update({ appId: null, newsId: null, category: null, page: null })}
      news={news} category={params.get('category')} page={params.get('page')}
      newsId={params.get('newsId')} onNewsChange={update} />
  </div>
}
