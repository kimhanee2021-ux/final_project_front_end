import { useState } from 'react'
import { GSIcon } from '@/shared/ui'
import { describeRankChange } from '../model/weeklyRankings'

// User-selected logos override only these two products; persisted image URLs stay unchanged.
const productLogos = {
  2357570: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuD7iwsnaoBhv-9_UKkk5BRN1u0K7Ofid4ELeQqttIf0eT_IcMRmYz_l6s&s=10',
  3393110: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXwnvVydmMwPdnB5gReqeAvuRSmjgaVLC4uDjWb5cbLw&s=10',
}

const changeColors = {
  up: 'bg-mint-bg text-mint-text',
  down: 'bg-peach-bg text-peach-text',
  new: 'bg-primary-soft text-primary-text',
  returning: 'bg-primary-soft text-primary-text',
  same: 'bg-surface-soft text-muted',
  unknown: 'bg-surface-soft text-muted',
}

function RankChange({ value, language }) {
  const change = describeRankChange(value, language)
  return (
    <span className={`inline-flex min-w-[42px] items-center justify-center rounded-[7px] px-[9px] py-[4px] text-[12px] font-[700] ${changeColors[change.tone]}`} aria-label={change.label} title={change.label}>
      {value === 'NEW' && language === 'ko' ? '신규' : change.text}
    </span>
  )
}

function GameThumbnail({ imageUrl, logo = false }) {
  const [failed, setFailed] = useState(false)
  const hasImage = typeof imageUrl === 'string' && imageUrl.startsWith('https://')
  return (
    <div className="flex aspect-[460/215] w-[112px] items-center justify-center overflow-hidden rounded-[8px] bg-primary-soft text-primary-text max-[700px]:w-[112px]" aria-hidden="true">
      {failed || !hasImage ? <GSIcon name="gamepad" size={26} /> : (
        <img src={imageUrl} alt="" loading="lazy" className={`h-full w-full ${logo ? 'object-contain' : 'object-cover'}`} onError={() => setFailed(true)} />
      )}
    </div>
  )
}

export default function RankingList({ entries, sourceUrl, language, t }) {
  const columns = 'grid grid-cols-[48px_112px_minmax(0,1fr)_112px_76px_24px] items-center gap-[16px] max-[900px]:gap-[12px] max-[700px]:grid-cols-[28px_minmax(0,1fr)_16px] max-[700px]:gap-x-[10px] max-[700px]:gap-y-[12px]'
  return (
    <div>
      <div aria-hidden="true" className={`${columns} mb-[10px] px-[16px] text-[11px] font-[600] tracking-[.04em] text-muted max-[700px]:hidden`}>
        <span>{t('RANK', '원본 순위')}</span><span />
        <span>{t('PRODUCT', '상품')}</span><span>{t('CHANGE', '전주 대비')}</span><span>{t('WEEKS', '연속 진입')}</span><span />
      </div>
      <ol className="m-0 grid list-none gap-[8px] p-0" aria-label={t('Top 10 products by weekly revenue', '주간 매출 상위 상품 10개')}>
        {entries.map((game, index) => {
          const logoUrl = productLogos[game.appId]
          const thumbnailUrl = logoUrl || game.imageUrl
          const changeLabel = describeRankChange(game.rankChange, language).label
          const weeksLabel = game.consecutiveWeeks == null
            ? t('Consecutive weeks unavailable', '연속 진입 주수 미확인')
            : t(`${game.consecutiveWeeks} consecutive weeks`, `${game.consecutiveWeeks}주 연속 진입`)
          return (
          <li key={`${game.sourceRank}-${game.appId}-${game.name}`} value={game.sourceRank}>
            <a
              href={Number.isInteger(game.appId) && game.appId > 0 ? `https://store.steampowered.com/app/${game.appId}/` : sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t(`Rank ${game.sourceRank}`, `${game.sourceRank}위`)} ${game.name}. ${changeLabel}. ${weeksLabel}. ${t('Open in Steam, new tab.', 'Steam에서 보기, 새 탭.')}`}
              className={`${columns} rounded-[14px] border px-[16px] py-[16px] transition-colors max-[700px]:px-[14px] ${index === 0 ? 'border-insight-border bg-insight-bg hover:bg-primary-soft' : 'border-border bg-surface hover:bg-surface-hover'}`}
            >
              <span className={`text-[25px] font-[800] tabular-nums max-[700px]:text-[21px] ${index === 0 ? 'text-primary-text' : 'text-muted'}`}>{String(game.sourceRank).padStart(2, '0')}</span>
              <GameThumbnail key={thumbnailUrl || 'missing'} imageUrl={thumbnailUrl} logo={Boolean(logoUrl)} />
              <div className="min-w-0 max-[700px]:col-span-full max-[700px]:row-start-2">
                {index === 0 && <span className="mb-[4px] flex items-center gap-[5px] text-[10px] font-[750] uppercase tracking-[.12em] text-primary-text"><GSIcon name="crown" size={12} />{t('TOP PRODUCT THIS WEEK', '이번 주 상품 1위')}</span>}
                <h3 className="break-normal [overflow-wrap:anywhere] text-[15px] font-[750] leading-[1.5] max-[700px]:text-[16px]">{game.name}</h3>
                <p className="mt-[5px] text-[11px] text-muted min-[701px]:block max-[700px]:hidden">{t('Steam · Product', 'Steam · 상품')}</p>
                <div className="mt-[8px] flex flex-wrap items-center gap-[7px] min-[701px]:hidden">
                  <RankChange value={game.rankChange} language={language} />
                  <span className="text-[10px] text-muted">{game.consecutiveWeeks == null ? t('Weeks unavailable', '진입 주수 미확인') : t(`${game.consecutiveWeeks} weeks`, `${game.consecutiveWeeks}주 연속`)}</span>
                </div>
              </div>
              <div className="max-[700px]:hidden"><RankChange value={game.rankChange} language={language} /></div>
              <span className="text-[13px] font-[650] tabular-nums max-[700px]:hidden" title={game.consecutiveWeeks == null ? t('Weeks unavailable in the saved record', '저장 자료에 연속 진입 주수 없음') : undefined}>{game.consecutiveWeeks == null ? '—' : `${game.consecutiveWeeks}${t(' wk', '주')}`}</span>
              <GSIcon name="arrow" size={18} className="text-muted max-[700px]:col-start-3 max-[700px]:row-start-1" />
            </a>
          </li>
          )
        })}
      </ol>
    </div>
  )
}
