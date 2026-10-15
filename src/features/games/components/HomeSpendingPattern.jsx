import { useState } from 'react'
import { Link } from 'react-router-dom'
import GSIcon from '../../../components/common/GSIcon'
import { authLink } from '../../auth/authSession'
import { genreSpending } from '../../dashboard/spendingMetrics'
import { spendingBuckets } from '../../spending/spendingModel'
import { money } from '../../../utils/formatters'

const CHART_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)']

function Shell({ children }) {
  return (
    <section
      className="min-w-0 rounded-[12px] border border-gs-border bg-[linear-gradient(130deg,#65829704,transparent),var(--gs-panel)] p-[15px_16px] min-[1600px]:p-[16px_18px] max-[1350px]:p-[13px] max-[1120px]:p-[18px] max-[600px]:p-[16px]"
      aria-labelledby="gs-pattern-title"
    >
      <div className="flex items-center gap-[12px] mb-[13px] max-[1350px]:gap-[8px]">
        <span className="flex shrink-0 self-start pt-[1px] text-gs-mint [&_svg]:stroke-[3.8]">
          <GSIcon name="chart" size={28} />
        </span>
        <div>
          <h2 className="text-[15px] font-[660] tracking-[-0.3px] leading-[1.3] min-[1600px]:text-[17px] max-[1350px]:text-[13px] max-[1120px]:text-[17px] max-[600px]:text-[15px]" id="gs-pattern-title">나의 게임 소비 패턴</h2>
          <p className="text-[10px] text-gs-muted mt-[3px] leading-[1.4] min-[1600px]:text-[11px] max-[1120px]:text-[11px] max-[600px]:text-[9px]">당신의 플레이가 만들어내는 이야기</p>
        </div>
        <Link to="/analysis" className="ml-auto inline-flex items-center gap-[8px] text-gs-muted whitespace-nowrap text-[10px] shrink-0 bg-transparent p-0 hover:text-gs-mint max-[600px]:text-[9px] max-[600px]:gap-[4px]">
          상세 보기
          <GSIcon name="arrow" size={16} />
        </Link>
      </div>
      <div className="grid grid-cols-[1fr_1.18fr] gap-[10px] max-[1350px]:gap-[8px] max-[600px]:grid-cols-1 max-[600px]:gap-[12px]">
        {children}
      </div>
    </section>
  )
}

function SubCard({ children }) {
  return (
    <div className="border border-gs-border bg-[linear-gradient(130deg,#b1c4d106,#253e4812),var(--gs-panel)] rounded-[11px] p-[12px_13px_8px] min-w-0 min-[1600px]:p-[14px_15px_10px] max-[1350px]:p-[10px_9px_8px] max-[1120px]:p-[17px] max-[600px]:p-[16px]">
      {children}
    </div>
  )
}

function SubCardPrompt({ children }) {
  return <p className="text-[10px] text-gs-muted leading-[1.7] py-[10px]">{children}</p>
}

// 홈의 "나의 게임 소비 패턴" 위젯. 분석탭과 같은 실제 소비 데이터(useMySpending)를 부모(HomePage)에서 받아 쓴다
// (HomeRecentFocus와 같은 데이터를 중복으로 또 호출하지 않기 위해 fetch는 HomePage 한 곳에서만 한다).
export default function HomeSpendingPattern({ isAuthenticated, data, loading, notLinked, startSteamLink }) {
  const [monthIndex, setMonthIndex] = useState(null)

  if (!isAuthenticated) {
    return (
      <Shell>
        <SubCard>
          <SubCardPrompt>로그인하면 나의 소비 패턴을 보여드려요.</SubCardPrompt>
          <Link to={authLink('login', '/')} className="inline-flex items-center gap-[8px] text-[11px] font-[650] text-gs-mint hover:underline">
            로그인하기
            <GSIcon name="arrow" size={15} />
          </Link>
        </SubCard>
        <SubCard>
          <SubCardPrompt>선호 장르도 함께 보여드려요.</SubCardPrompt>
        </SubCard>
      </Shell>
    )
  }

  if (loading) {
    return (
      <Shell>
        <div className="h-[130px] rounded-[11px] bg-gs-raised animate-pulse" />
        <div className="h-[130px] rounded-[11px] bg-gs-raised animate-pulse" />
      </Shell>
    )
  }

  if (notLinked) {
    return (
      <Shell>
        <SubCard>
          <SubCardPrompt>스팀 계정을 연동하면 나의 소비 패턴을 보여드려요.</SubCardPrompt>
          <button
            type="button"
            className="inline-flex items-center gap-[8px] bg-transparent p-0 text-[11px] font-[650] text-gs-mint hover:underline"
            onClick={startSteamLink}
          >
            Steam 계정 연동하기
            <GSIcon name="arrow" size={15} />
          </button>
        </SubCard>
        <SubCard>
          <SubCardPrompt>선호 장르도 함께 보여드려요.</SubCardPrompt>
        </SubCard>
      </Shell>
    )
  }

  const genres = genreSpending(data.games).slice(0, 5)
  const months = data.hasPurchaseHistory ? spendingBuckets(data.transactions, 'six', data.asOf).buckets : []
  const activeIndex = Math.min(monthIndex ?? months.length - 1, months.length - 1)
  const activeMonth = months[activeIndex]
  const previousMonth = months[activeIndex - 1]
  const change =
    previousMonth && previousMonth.total > 0
      ? Math.round(((activeMonth.total - previousMonth.total) / previousMonth.total) * 100)
      : null
  const maxTotal = Math.max(...months.map(month => month.total), 1)

  const stops = genres
    .map((item, index) => {
      const start = genres.slice(0, index).reduce((sum, g) => sum + g.percent, 0)
      return `${CHART_COLORS[index % CHART_COLORS.length]} ${start}% ${start + item.percent}%`
    })
    .join(', ')

  return (
    <Shell>
      <SubCard>
        {months.length > 0 ? (
          <>
            <h3 className="text-[11px] font-semibold flex items-center gap-[9px]">{activeMonth.label} 지출</h3>
            <div className="flex items-center gap-[10px] min-h-[53px] whitespace-nowrap min-[1600px]:min-h-[56px] max-[1350px]:gap-[5px] max-[1120px]:gap-[13px] max-[600px]:min-h-[60px]" aria-live="polite">
              <strong className="text-[24px] leading-[1.3] font-[680] tracking-[-0.5px] min-[1600px]:text-[27px] max-[1350px]:text-[20px] max-[1120px]:text-[27px] max-[600px]:text-[27px]">
                {money(activeMonth.total)}
              </strong>
              {change !== null && (
                <span className={`text-gs-mint text-[10px] pt-[5px] ${change < 0 ? 'text-[#f49abd]' : ''}`}>
                  {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%<small className="block text-[7px] mt-[1px] text-gs-muted">전월 대비</small>
                </span>
              )}
            </div>
            <div className="h-[78px] flex gap-[12px] min-[1600px]:h-[83px] max-[1350px]:gap-[8px] max-[1120px]:h-[89px] max-[600px]:h-[104px] max-[600px]:gap-[17px]" role="group" aria-label="월별 지출 추이">
              {months.map((month, index) => {
                const active = activeIndex === index
                return (
                  <button
                    key={month.key}
                    className={`group flex flex-1 min-w-0 flex-col items-center gap-[4px] p-0 bg-transparent text-[9px] max-[600px]:text-[10px] ${active ? 'text-gs-text' : 'text-gs-muted'}`}
                    aria-label={`${month.label} ${money(month.total)}`}
                    aria-pressed={active}
                    onClick={() => setMonthIndex(index)}
                  >
                    <span className="w-full h-[61px] border-b border-[#65798770] flex justify-center items-end relative min-[1600px]:h-[65px] max-[1120px]:h-[70px] max-[600px]:h-[84px]">
                      <span
                        className={`w-[min(16px,100%)] rounded-[5px_5px_0_0] min-h-[5px] transition-opacity duration-200 group-hover:opacity-100 max-[600px]:w-[22px] ${active ? 'bg-[linear-gradient(0deg,#26dcb4,#15afa1)] opacity-100' : 'bg-[linear-gradient(0deg,#36e7b7,#89cab7)] opacity-[.75]'}`}
                        style={{ height: `${(month.total / maxTotal) * 100}%` }}
                      />
                      <span className="absolute top-[-11px] text-[8px] bg-gs-hover p-[2px_4px] rounded-[4px] opacity-0 pointer-events-none z-[1] group-hover:opacity-100 group-focus-visible:opacity-100">{money(month.total)}</span>
                    </span>
                    <span>{month.label}</span>
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <>
            <h3 className="text-[11px] font-semibold flex items-center gap-[9px]">월별 지출 추이</h3>
            <SubCardPrompt>
              구매내역을 가져오면 월별 지출 추이를 보여드려요.
            </SubCardPrompt>
            <Link to="/purchases" className="inline-flex items-center gap-[8px] text-[11px] font-[650] text-gs-mint hover:underline">
              구매내역 가져오기
              <GSIcon name="arrow" size={15} />
            </Link>
          </>
        )}
      </SubCard>
      <SubCard>
        <h3 className="text-[11px] font-semibold flex items-center gap-[9px]">
          <span className="flex text-[#efa83a]">
            <GSIcon name="compass" size={17} />
          </span>
          선호 장르
        </h3>
        {genres.length > 0 ? (
          <div className="flex items-center gap-[15px] mt-[12px] pb-[2px] min-[1600px]:gap-[18px] min-[1600px]:mt-[15px] max-[1350px]:gap-[9px] max-[1120px]:justify-center max-[1120px]:gap-[22px] max-[600px]:justify-start max-[600px]:gap-[28px] max-[600px]:mt-[20px] max-[600px]:p-[0_4px_5px]">
            <div
              className="w-[clamp(80px,7.2vw,124px)] aspect-square rounded-full shrink-0 relative grid place-items-center rotate-[-1deg] max-[1350px]:w-[77px] max-[1120px]:w-[110px] max-[600px]:w-[117px] max-[360px]:w-[98px]"
              role="img"
              aria-label={genres.map(item => `${item.name} ${Math.round(item.percent)}%`).join(', ')}
              style={{ background: `conic-gradient(${stops})` }}
            >
              <div className="w-[62%] h-[62%] bg-gs-panel rounded-full flex flex-col items-center justify-center">
                <span className="text-[6px] text-gs-muted tracking-[1px] max-[600px]:text-[7px]">FAVORITE</span>
                <strong className="text-[13px] font-semibold max-[600px]:text-[17px]">{genres[0].name}</strong>
              </div>
            </div>
            <ul className="flex-1 flex flex-col gap-[6px] list-none p-0 m-0 min-w-0 min-[1600px]:gap-[8px] max-[1120px]:max-w-[160px] max-[1120px]:gap-[8px] max-[600px]:gap-[9px] max-[600px]:max-w-none">
              {genres.map((item, index) => (
                <li key={item.name} className="flex items-center gap-[7px] text-[9px] leading-[1.25] max-[1350px]:text-[8px] max-[1350px]:gap-[4px] max-[1120px]:text-[10px] max-[1120px]:gap-[8px] max-[600px]:text-[10px]">
                  <span className="w-[9px] h-[9px] rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                  <span>{item.name}</span>
                  <strong className="ml-auto font-medium">{Math.round(item.percent)}%</strong>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <SubCardPrompt>아직 분석할 지출 기록이 없어요.</SubCardPrompt>
        )}
      </SubCard>
    </Shell>
  )
}
