import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { GSIcon, PageHeading, Panel, PanelPage } from '@/shared/ui'
import { GAMER_COUNTRIES, findGamerCountry } from '@/shared/config'
import { GamerMap, getAvailableYears, getSnapshot, formatPeople } from '@/tab'

const regions = ['전체', '아시아', '유럽', '아메리카', '아프리카', '오세아니아']
const years = getAvailableYears()
const latestYear = years[years.length - 1]

// 원본 지도는 src/tab이, 앱의 URL·국가 선택·랭킹 이동은 이 컴포넌트가 관리한다.
export default function GamerMapOverview() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [region, setRegion] = useState('전체')
  const country = findGamerCountry(searchParams.get('country')) || findGamerCountry('KR')
  const requestedYear = Number(searchParams.get('year'))
  const year = years.includes(requestedYear) ? requestedYear : latestYear
  const selectedRecord = getSnapshot(year, 'PC').find(item => item.iso2 === country.code)
  const countries = GAMER_COUNTRIES.filter(item => region === '전체' || item.region === region)
  const rankingParams = new URLSearchParams({ country: country.code, year: String(year) })
  const week = searchParams.get('week')
  if (week) rankingParams.set('week', week)

  useEffect(() => {
    if (searchParams.get('country') === country.code && searchParams.get('year') === String(year)) return
    const next = new URLSearchParams(searchParams)
    next.set('country', country.code)
    next.set('year', String(year))
    setSearchParams(next, { replace: true })
  }, [country.code, year, searchParams, setSearchParams])

  function selectYear(value) {
    if (!years.includes(value)) return
    setSearchParams(previous => {
      const next = new URLSearchParams(previous)
      next.set('year', String(value))
      return next
    }, { replace: true })
  }

  function selectCountry(code) {
    setSearchParams(previous => {
      const next = new URLSearchParams(previous)
      next.set('country', code)
      return next
    })
  }

  return (
    <PanelPage>
      <Panel>
        <PageHeading
          title="게이머 지도"
          description="2010–2025년, 19개국 PC 게이머의 변화를 모자이크 지도로 살펴보세요."
          action={
            <span className="inline-flex items-center gap-[7px] rounded-full bg-primary-soft px-[13px] py-[7px] text-[12px] font-[650] text-primary-text">
              <GSIcon name="monitor" size={16} /> PC 게이머
            </span>
          }
        />
        <GamerMap year={year} onYearChange={selectYear} selectedCountry={country.code} onSelectCountry={selectCountry} />
      </Panel>
      <Panel>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_240px] items-center gap-[24px] max-[800px]:grid-cols-1" aria-live="polite" aria-atomic="true">
          <div>
            <p className="text-[11px] font-[650] tracking-[1.2px] text-muted">SELECTED COUNTRY</p>
            <span className="my-[12px] inline-flex h-[32px] min-w-[40px] items-center justify-center rounded-[9px] bg-primary-soft px-[10px] text-[13px] font-[750] text-primary-text" aria-hidden="true">{country.code}</span>
            <h2 className="text-[25px] font-[750] tracking-[-0.7px]">{country.name}</h2>
            <p className="mt-[4px] text-[12px] text-muted">{country.englishName} · {country.region}</p>
          </div>
          <div>
            <p className="text-[12px] text-muted">{year}년 PC 이용자 · 제공 자료의 MAU</p>
            <p className="mt-[8px] text-[28px] font-[750] tracking-[-1px] tabular-nums text-primary-text">{selectedRecord?.players == null ? '자료 없음' : formatPeople(selectedRecord.players)}</p>
            <p className="mt-[7px] text-[11px] leading-[1.7] text-muted">첨부 자료의 값을 표시하며, 외부 원출처는 별도로 검증하지 않았습니다.</p>
          </div>
          <div>
            <p className="mb-[12px] text-[12px] leading-[1.8] text-muted">이 국가의 Steam 주간 매출 TOP 10을 확인하세요.</p>
            <Link className="gs-primary-button w-full" to={`/weekly-rankings?${rankingParams}`}>
              주간랭킹 보기 <GSIcon name="arrow" size={16} />
            </Link>
          </div>
        </div>
      </Panel>
      <Panel>
        <div className="mb-[20px] flex flex-wrap items-end justify-between gap-[12px]">
          <div>
            <h2 className="text-[20px] font-[700] tracking-[-0.5px]">국가 둘러보기</h2>
            <p className="mt-[6px] text-[13px] text-muted">19개국 중 관심 있는 국가를 선택하세요.</p>
          </div>
          <div className="flex flex-wrap gap-[6px]" role="group" aria-label="지역 필터">
            {regions.map(item => (
              <button key={item} type="button" aria-pressed={region === item} onClick={() => setRegion(item)}
                className={`min-h-[36px] rounded-full px-[12px] text-[12px] ${region === item ? 'bg-primary-soft font-[650] text-primary-text' : 'bg-surface-soft text-muted hover:text-text'}`}>
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-[10px] max-[900px]:grid-cols-3 max-[650px]:grid-cols-2 max-[390px]:grid-cols-1" role="group" aria-label="국가 선택">
          {countries.map(item => (
            <button key={item.code} type="button" onClick={() => selectCountry(item.code)} aria-pressed={country.code === item.code}
              className={`flex min-h-[75px] items-center gap-[11px] rounded-[14px] border! p-[14px] text-left transition-colors ${country.code === item.code ? 'border-primary! bg-primary-soft' : 'border-border! bg-surface hover:bg-surface-soft'}`}>
              <span className={`grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[10px] text-[11px] font-[750] ${country.code === item.code ? 'bg-primary text-on-primary' : 'bg-surface-soft text-muted'}`} aria-hidden="true">{item.code}</span>
              <span className="min-w-0"><strong className="block text-[13px] font-[650]">{item.name}</strong><small className="block text-[11px] text-muted">{item.region}</small></span>
            </button>
          ))}
        </div>
      </Panel>
    </PanelPage>
  )
}
