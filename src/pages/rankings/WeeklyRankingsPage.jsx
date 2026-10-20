import { useEffect, useState } from 'react'
import { fetchRankingOptions, fetchWeeklyProducts } from '@/features/rankings/api'
import { Link, useSearchParams } from 'react-router-dom'
import { GSIcon, PageHeading, Panel, PanelPage } from '@/shared/ui'
import { GAMER_COUNTRIES } from '@/shared/config'
import { RankingList, DEFAULT_WEEK, readRankingSelection, getSteamChartUrl, getWeekOptions, formatWeekPeriod, shiftWeek } from '@/features/rankings'

// This archive uses Korean interface copy; original Steam product names are preserved.
const t = (english, korean) => korean ?? english

const buttonStyle = 'inline-flex items-center justify-center gap-[8px] rounded-[10px] border border-border bg-surface px-[14px] py-[10px] text-[12px] font-[650] hover:bg-surface-hover'

export default function WeeklyRankingsPage() {
  const language = 'ko'
  const [searchParams, setSearchParams] = useSearchParams()
  const selection = readRankingSelection(searchParams, GAMER_COUNTRIES)
  const { country, week } = selection
  const [options, setOptions] = useState([])
  const [optionsError, setOptionsError] = useState(false)
  const [request, setRequest] = useState(null)
  const [retry, setRetry] = useState(0)
  const requestKey = `${country}/${week}/${retry}`
  const current = request?.key === requestKey ? request : null
  const loading = !current
  const snapshot = current?.snapshot
  const error = current?.error
  const hasData = ['VERIFIED', 'VERIFIED_GAPS'].includes(snapshot?.status) && snapshot.entries.length > 0
  const unavailable = snapshot?.status === 'COUNTRY_UNAVAILABLE'
  useEffect(() => {
    const controller = new AbortController()
    fetchRankingOptions(controller.signal).then(data => {
      if (!controller.signal.aborted) { setOptions(data); setOptionsError(false) }
    }).catch(() => {
      if (!controller.signal.aborted) setOptionsError(true)
    })
    return () => controller.abort()
  }, [retry])
  useEffect(() => {
    const controller = new AbortController()
    fetchWeeklyProducts(country, week, controller.signal).then(data => {
      if (!controller.signal.aborted) setRequest({ key: requestKey, snapshot: data })
    }).catch(() => {
      if (!controller.signal.aborted) setRequest({ key: requestKey, error: true })
    })
    return () => controller.abort()
  }, [country, week, requestKey])
  const available = item => ['VERIFIED', 'VERIFIED_GAPS'].includes(item.status)
  const countriesWithData = options.filter(item => item.week === week && available(item)).map(item => item.country)
  const availableWeeks = options.filter(item => item.country === country && available(item)).map(item => item.week)
  const unavailableCountries = new Set(options.filter(item => item.status === 'COUNTRY_UNAVAILABLE').map(item => item.country))
  const weekOptions = getWeekOptions(week, availableWeeks)
  const selectedCountry = GAMER_COUNTRIES.find(item => item.code === country)
  const countryName = item => item.name
  const steamUrl = snapshot?.sourceUrl || getSteamChartUrl(country, week)
  const mapParams = new URLSearchParams({ country, week })
  if (searchParams.has('year')) mapParams.set('year', searchParams.get('year'))

  function updateSelection(values) {
    setSearchParams(previous => {
      const next = new URLSearchParams(previous)
      next.set('country', values.country || country)
      next.set('week', values.week || week)
      return next
    })
  }

  return (
    <PanelPage>
      <Panel>
        <div className="mb-[12px] flex items-center gap-[7px] text-[11px] font-[750] uppercase tracking-[.14em] text-primary-text"><GSIcon name="chart" size={16} />스팀 주간 매출 순위</div>
        <PageHeading
          title={t('Steam weekly rankings by country', '스팀 국가별 주간랭킹')}
          description={t('Explore Steam’s original top 10 products by weekly revenue in each country.', '국가와 주차를 선택해 Steam 원본 상품 매출 TOP 10을 살펴보세요.')}
          action={<Link to={`/gamer-map?${mapParams}`} className={`${buttonStyle} shrink-0`}><GSIcon name="globe" size={16} />{t('Gamer map', '게이머 지도')}</Link>}
        />

        <div className="grid grid-cols-[1fr_1.65fr] items-end gap-[16px] max-[700px]:grid-cols-1">
          <label className="grid gap-[8px] text-[12px] font-[650]" htmlFor="weekly-ranking-country">
            <span className="flex items-center gap-[6px] text-muted"><GSIcon name="globe" size={14} />{t('Country', '국가')}</span>
            <select id="weekly-ranking-country" value={country} onChange={event => updateSelection({ country: event.target.value })} className="min-h-[46px] w-full rounded-[10px] bg-surface-soft px-[12px] text-[14px] text-text">
              {GAMER_COUNTRIES.map(item => <option key={item.code} value={item.code}>{countryName(item)} · {item.code}{unavailableCountries.has(item.code) ? t(' · Unavailable', ' · 미제공') : ''}</option>)}
            </select>
          </label>
          <div className="grid gap-[8px]">
            <label htmlFor="weekly-ranking-week" className="flex items-center gap-[6px] text-[12px] font-[650] text-muted"><GSIcon name="calendar" size={14} />{t('Chart period', '집계 기간')}</label>
            <div className="flex min-w-0 gap-[8px]">
              <button type="button" className={`${buttonStyle} !px-[12px]`} onClick={() => updateSelection({ week: shiftWeek(week, -1) })} aria-label={t('Previous week', '이전 주')}><GSIcon name="arrowLeft" size={18} /></button>
              <select id="weekly-ranking-week" value={week} onChange={event => updateSelection({ week: event.target.value })} className="min-h-[46px] min-w-0 flex-1 rounded-[10px] bg-surface-soft px-[10px] text-[13px] text-text">
                {weekOptions.map(value => <option key={value} value={value}>{formatWeekPeriod(value)}{availableWeeks.includes(value) ? t(' · Available', ' · 자료 있음') : ''}</option>)}
              </select>
              <button type="button" className={`${buttonStyle} !px-[12px]`} onClick={() => updateSelection({ week: shiftWeek(week, 1) })} aria-label={t('Next week', '다음 주')}><GSIcon name="arrow" size={18} /></button>
            </div>
          </div>
        </div>
        {(selection.invalidCountry || selection.invalidWeek) && <p role="status" className="mt-[14px] rounded-[10px] bg-peach-bg px-[14px] py-[10px] text-[12px] text-peach-text">{t('The URL contains an invalid selection. The affected field has been reset to the reference country or week shown above.', '주소의 국가 또는 주차가 올바르지 않아 해당 항목을 기본값으로 표시했습니다. 위 선택값을 확인해 주세요.')}</p>}
        <div className="mt-[18px] flex flex-wrap items-center justify-between gap-[10px] border-t border-border pt-[16px] text-[12px] text-muted">
          <span className="inline-flex items-center gap-[6px]"><GSIcon name="wallet" size={15} />{t('Ranked by revenue, including in-game purchases', '매출 기준 · 인게임 결제 포함')}</span>
          <span className="rounded-full bg-primary-soft px-[10px] py-[4px] text-[10px] font-[700] text-primary-text">{t('WEEKLY ARCHIVE', '주간 기록')}</span>
        </div>
      </Panel>

      <Panel>
        <div className="mb-[25px] flex flex-wrap items-start justify-between gap-[16px]">
          <div>
            <div className="mb-[7px] flex items-center gap-[9px]"><span className="inline-flex h-[27px] min-w-[36px] items-center justify-center rounded-[6px] bg-primary-soft px-[7px] text-[11px] font-[800] text-primary-text">{country}</span><h2 className="text-[21px] font-[750] tracking-[-.5px]">{countryName(selectedCountry)} <span className="font-[500] text-muted">상위 10개</span></h2></div>
            <p className="text-[12px] text-muted">{formatWeekPeriod(week)} · {t('Steam Top Sellers', 'Steam 최고 인기 제품')}</p>
          </div>
          <a href={unavailable ? undefined : steamUrl} aria-disabled={unavailable} tabIndex={unavailable ? -1 : undefined} target="_blank" rel="noopener noreferrer" className={`${buttonStyle} text-primary-text ${unavailable ? 'pointer-events-none opacity-40' : ''}`} aria-label={t('Open the original Steam chart in a new tab', 'Steam 원본 차트 보기, 새 탭')}><GSIcon name="steam" size={16} />{t('Steam chart', 'Steam 원본')}<GSIcon name="arrow" size={14} /></a>
        </div>

        <div aria-live="polite" aria-atomic="false">
          {hasData ? (
            <RankingList entries={snapshot.entries} sourceUrl={snapshot.sourceUrl} language={language} t={t} />
          ) : (
            <div className="flex min-h-[310px] flex-col items-center justify-center rounded-[18px] border border-dashed border-border bg-surface-soft px-[24px] py-[38px] text-center">
              <span className="mb-[17px] flex h-[54px] w-[54px] items-center justify-center rounded-[16px] bg-primary-soft text-primary-text"><GSIcon name="calendar" size={25} /></span>
              <h3 className="text-[17px] font-[750]">{loading ? t('Loading rankings…', '순위를 불러오고 있어요…') : error ? t('Unable to load rankings', '순위를 불러오지 못했어요') : unavailable ? t('Country chart unavailable', '국가별 주간 차트 미제공') : t('No data for this week', '선택한 주차의 자료가 없습니다')}</h3>
              <p className="mt-[9px] max-w-[460px] text-[13px] leading-[1.8] text-muted">{loading ? t('Reading the saved weekly chart.', '저장된 주간 차트를 조회하고 있습니다.') : error ? t('Check the server connection and try again.', '서버 연결을 확인한 후 다시 시도해 주세요.') : unavailable ? t('Steam does not provide a public weekly chart for this country in the collected archive.', '수집 자료 기준으로 Steam이 이 국가의 공식 주간 차트를 제공하지 않습니다.') : t('Choose a week marked Available. No other week is substituted.', '자료 있음으로 표시된 주차를 선택해 주세요. 다른 주차의 순위로 대체하지 않습니다.')}</p>
              <div className="mt-[21px] flex flex-wrap justify-center gap-[8px]">
                {error && <button type="button" className={buttonStyle} onClick={() => setRetry(value => value + 1)}>{t('Retry', '다시 시도')}</button>}
                <button type="button" className={`${buttonStyle} !border-primary-soft !bg-primary-soft text-primary-text`} onClick={() => updateSelection({ country: 'KR', week: DEFAULT_WEEK })}>{t('Reset country and week', '국가·주차 초기화')}</button>
              </div>
            </div>
          )}
        </div>

        {hasData && (
          <div className="mt-[20px] flex flex-wrap justify-between gap-[10px] border-t border-border pt-[16px] text-[11px] leading-[1.7] text-muted">
            <p>{t('Original product rankings include hardware. Missing images use a placeholder.', '하드웨어를 포함한 원본 상품 순위입니다. 제공되지 않는 이미지는 기본 아이콘으로 표시합니다.')}</p>
            <p>{snapshot.verificationKind === 'archived' ? t('Previously verified record', '기존 검증 자료') : t('Steam source checked', 'Steam 원본 확인')} · <time dateTime={snapshot.verifiedAt}>{snapshot.verifiedAt ? new Date(snapshot.verifiedAt).toLocaleString(language === 'en' ? 'en-US' : 'ko-KR') : t('Unknown', '미확인')}</time></p>
          </div>
        )}
      </Panel>

      <div className="grid grid-cols-[1.4fr_1fr] gap-[16px] max-[700px]:grid-cols-1">
        <Panel>
          <div className="mb-[12px] flex items-center gap-[8px]"><GSIcon name="info" size={17} className="text-primary-text" /><h2 className="text-[15px] font-[750]">{t('How to read this chart', '랭킹 읽는 방법')}</h2></div>
          <p className="text-[12px] leading-[1.9] text-muted">{t('Revenue includes game sales, DLC and in-game purchases. Free-to-play games can also rank highly. These positions do not represent player counts or playtime.', '게임 판매·DLC·인게임 결제를 합산한 매출 기준입니다. 무료 게임도 상위에 오를 수 있으며, 순위가 이용자 수나 플레이 시간을 뜻하지는 않습니다.')}</p>
          <div className="mt-[16px] flex flex-wrap gap-x-[17px] gap-y-[8px] text-[11px] text-muted"><span><b className="text-mint-text">↑</b> {t('Up', '상승')}</span><span><b className="text-peach-text">↓</b> {t('Down', '하락')}</span><span><b className="text-primary-text">신규</b> {t('New entry', '첫 진입')}</span><span><b className="text-primary-text">{t('RETURNING', '재진입')}</b> {t('Back in chart', '차트 복귀')}</span></div>
        </Panel>
        <Panel>
          <div className="mb-[12px] flex items-center gap-[8px]"><GSIcon name="globe" size={17} className="text-primary-text" /><h2 className="text-[15px] font-[750]">{t('Ranking data status', '랭킹 데이터 안내')}</h2></div>
          {countriesWithData.length ? <div className="flex flex-wrap gap-[7px]">{countriesWithData.map(code => { const item = GAMER_COUNTRIES.find(candidate => candidate.code === code); return item && <button key={code} type="button" onClick={() => updateSelection({ country: code })} aria-pressed={code === country} className={`rounded-[8px] border px-[11px] py-[7px] text-[12px] font-[650] ${code === country ? 'border-insight-border bg-primary-soft text-primary-text' : 'border-border hover:bg-surface-hover'}`}>{countryName(item)}</button> })}</div> : <p className="text-[12px] leading-[1.9] text-muted">{optionsError ? t('Unable to load available countries.', '자료가 있는 국가 목록을 불러오지 못했습니다.') : t('No collected rankings for this week.', '선택한 주차에 수집된 순위가 없습니다.')}</p>}
          <Link to={`/gamer-map?${mapParams}`} className="mt-[18px] inline-flex items-center gap-[7px] text-[12px] font-[700] text-primary-text">{t('Explore PC gamers around the world', '전세계 PC 게이머 지도 보기')}<GSIcon name="arrow" size={15} /></Link>
        </Panel>
      </div>
    </PanelPage>
  )
}
