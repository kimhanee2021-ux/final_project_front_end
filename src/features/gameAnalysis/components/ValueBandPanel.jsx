import { useState } from 'react'
import { AnalysisPanel, ColumnChart } from '@/shared/ui'
import GameThumb from './GameThumb'
import { valueBandHeadline } from '../model/gameAnalysisModel'
import { hoursText } from '@/features/spending'
import { money } from '@/shared/utils/formatters'

// 분포형 데이터 → 세로 막대(구간별 게임 수) + 고른 구간에 속한 게임 목록.
// 막대를 누르면 그 구간에 어떤 게임이 있는지 아래 박스에 보여준다. 처음에는 게임이 가장 많은 구간이 열려 있다.
export default function ValueBandPanel({ bands, eyebrow, onSelect }) {
  const biggest = bands.reduce((best, band) => (band.count > best.count ? band : best), bands[0])
  const [bandId, setBandId] = useState(biggest.id)
  const band = bands.find(item => item.id === bandId) ?? biggest
  return (
    <AnalysisPanel eyebrow={eyebrow} headline={valueBandHeadline(bands)}>
      <p className="mb-[20px] text-[14px] text-muted">막대를 눌러 구간별 게임을 확인해 보세요 ↓</p>
      <ColumnChart
        items={bands.map(item => ({ key: item.id, label: item.label, value: item.count, text: `${item.count}개` }))}
        activeKey={band.id}
        onSelect={setBandId}
      />
      {/* 선택한 막대 아래 삼각 표시가 이 박스 위쪽에 닿아, 어느 구간의 목록인지 이어 보이게 한다. 구간을 바꾸면 key가 달라져 목록이 새로 나타난다. */}
      <div key={band.id} className="p-[24px] rounded-[20px] bg-primary-soft animate-[gs-appear_.25s_ease] max-[600px]:p-[16px]">
        <h3 className="mb-[16px] text-[18px] font-[750] text-primary-text">
          {band.label}
          <span className="ml-[10px] text-[14px] font-[600] text-muted">{band.count}개</span>
        </h3>
        {band.items.length ? (
          <ul className="gs-stagger grid grid-cols-2 gap-[12px] max-[760px]:grid-cols-1">
            {band.items.map(({ game, hourly }) => (
              <li key={game.id} className="min-w-0">
                <button
                  type="button"
                  className="w-full h-full flex items-center gap-[14px] p-[16px] rounded-[16px] bg-surface text-left hover:opacity-80"
                  onClick={() => onSelect(game)}
                >
                  <GameThumb game={game} className="w-[40px]! h-[47px]!" />
                  <div className="min-w-0 flex-1">
                    <strong className="block text-[15px] truncate">{game.name}</strong>
                    <small className="text-[12px] text-muted">
                      {game.genre} · {hoursText(game.hours)} 플레이
                    </small>
                  </div>
                  <strong className="shrink-0 text-[14px]">{money(hourly)}/시간</strong>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-[8px] text-[14px] text-muted">이 구간에 해당하는 게임이 아직 없어요.</p>
        )}
      </div>
    </AnalysisPanel>
  )
}
