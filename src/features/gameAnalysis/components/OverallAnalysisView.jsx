import { CoachPromptCard } from '@/features/ai-coach'
import { PageHeading, PanelPage, Panel, AnalysisPanel, ColumnChart, CountUp } from '@/shared/ui'
import GameThumb from './GameThumb'
import ValueRankList from './ValueRankList'
import { overallStats } from '../model/gameAnalysisModel'
import { netAmount, hoursText } from '@/features/spending'
import { money, number } from '@/shared/utils/formatters'
import { br, hl } from '@/shared/utils/headline'

const TAGS = [
  { id: 'total', label: '게임 총 소비 금액' },
  { id: 'hourly', label: '게임 시간당 가성비' },
  { id: 'playtime', label: '총 플레이타임' },
  { id: 'average', label: '평균 게임 정가' },
  { id: 'unplayed', label: '미플레이 게임' },
]

// 큰 숫자 하나 + 보조 시각화. 숫자만 던지지 않고 위 제목 문장이 해석을 같이 준다.
const BigNumber = ({ children }) => (
  <p className="text-[clamp(44px,6vw,72px)] font-[800] tracking-[-3px] leading-none text-text">{children}</p>
)

// 큰 숫자는 왼쪽, 그 숫자를 설명하는 막대는 오른쪽에 나란히 둔다.
const NumberWithBars = ({ number, children }) => (
  <div className="grid grid-cols-[1fr_1.6fr] gap-[48px] items-end max-[900px]:grid-cols-1 max-[900px]:gap-[28px]">
    <BigNumber>{number}</BigNumber>
    {children}
  </div>
)

function OverallPanel({ tag, label, stats }) {
  const { summary } = stats
  if (tag === 'total')
    return (
      <AnalysisPanel eyebrow={label} headline={['지금까지 게임에 ', hl(money(summary.total)), '을 썼어요.']}>
        <NumberWithBars number={<CountUp value={summary.total} format={money} />}>
          <ColumnChart items={stats.topSpent.map(game => ({ label: game.name, value: netAmount(game), text: money(netAmount(game)) }))} />
        </NumberWithBars>
      </AnalysisPanel>
    )
  if (tag === 'hourly')
    return (
      <AnalysisPanel
        eyebrow={label}
        headline={summary.hourly == null ? '시간당 비용을 계산할 플레이 기록이 아직 없어요.' : ['플레이 1시간당 ', hl(money(summary.hourly)), '을 쓴 셈이에요.']}
      >
        <ValueRankList ranking={stats.ranking.best} />
      </AnalysisPanel>
    )
  if (tag === 'playtime')
    return (
      <AnalysisPanel eyebrow={label} headline={['지금까지 총 ', hl(`${number(summary.hours)}시간`), '을 플레이했어요.']}>
        <NumberWithBars number={<CountUp value={summary.hours} format={hours => `${number(hours)}시간`} />}>
          <ColumnChart items={stats.topHours.map(game => ({ label: game.name, value: game.hours || 0, text: hoursText(game.hours) }))} />
        </NumberWithBars>
      </AnalysisPanel>
    )
  if (tag === 'average')
    return (
      <AnalysisPanel eyebrow={label} headline={summary.average == null ? '아직 정가를 확인한 게임이 없어요.' : ['게임 한 개당 평균 ', hl(money(summary.average)), '이에요.']}>
        <ColumnChart items={stats.priceBands.map(band => ({ label: band.label, value: band.count, text: `${band.count}개` }))} />
      </AnalysisPanel>
    )
  return (
    <AnalysisPanel
      eyebrow={label}
      headline={stats.unplayed.length ? ['아직 켜보지 않은 게임 ', hl(`${stats.unplayed.length}개`), br, hl(money(summary.unplayedAmount)), '어치예요.'] : '산 게임을 모두 한 번 이상 플레이했어요.'}
    >
      <ul className="gs-stagger grid grid-cols-2 gap-[12px] max-[760px]:grid-cols-1">
        {stats.unplayed.map(game => (
          <li key={game.id} className="flex items-center gap-[14px] p-[16px] rounded-[16px] bg-bg min-w-0">
            <GameThumb game={game} className="w-[40px]! h-[47px]!" />
            <strong className="text-[15px] truncate">{game.name}</strong>
            <span className="px-[10px] py-[3px] rounded-full bg-surface text-muted text-[12px] shrink-0">{game.genre}</span>
            <strong className="ml-auto text-[14px] shrink-0">{money(netAmount(game))}</strong>
          </li>
        ))}
      </ul>
    </AnalysisPanel>
  )
}

// "나의 분석 > 종합 분석": 지표 하나가 패널 하나를 차지한다.
export default function OverallAnalysisView({ games }) {
  const stats = overallStats(games)
  return (
    <PanelPage>
      {TAGS.map(({ id, label }, index) => (
        <Panel key={id} id={id}>
          {index === 0 && <PageHeading title="종합 분석" description="패널마다 숫자 하나씩, 내 게임 생활을 짚어 볼게요." />}
          <OverallPanel tag={id} label={label} stats={stats} />
        </Panel>
      ))}
      <Panel id="coach">
        <AnalysisPanel eyebrow="AI 소비 코치" headline="숫자만으로 부족하다면, 세나에게 물어보세요.">
          <CoachPromptCard />
        </AnalysisPanel>
      </Panel>
    </PanelPage>
  )
}
