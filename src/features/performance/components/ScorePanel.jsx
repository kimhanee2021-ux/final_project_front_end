import { GSIcon, RadarChart } from '@/shared/ui'
import EvaluationNotice from './EvaluationNotice'
import { overallPerformanceExplanation } from '../model/pcGrade'
import { VERDICTS } from '../model/pcEvaluation'

const verdictByValue = Object.fromEntries(Object.values(VERDICTS).map(item => [item.value, item.label]))

// AI 종합 설명의 네 항목. 항목마다 따로 칸을 만들어 읽기 쉽게 보여준다.
const SECTION_ICONS = {
  '현재 성능': 'chart',
  '제한 요인': 'thermometer',
  '설정 조언': 'edit',
  '업그레이드 방향': 'spark',
}

// "현재 성능: 내용" 형태의 글을 { title, body }로 나눈다. 형식이 아니면 제목 없이 내용만 둔다.
function toSection(text) {
  const split = text.indexOf(': ')
  return split === -1 ? { title: '', body: text } : { title: text.slice(0, split), body: text.slice(split + 2) }
}

// 종합 등급: 위쪽에 큰 등급(A~E)과 부품별 판정 레이더, 아래쪽에 AI 종합 설명을 네 칸으로 나눠 보여준다.
// 레이더는 백엔드의 부품 판정(유지 가능/확인 필요/교체 검토)을 모양으로 보여줄 뿐 측정 점수가 아니다.
export default function ScorePanel({ evaluation }) {
  const { status, grade, overview, judgements, analyzing, diagnosis } = evaluation
  if (status !== 'ready') return <EvaluationNotice status={status} />
  const judged = judgements.some(item => item.verdict)
  const sections = overallPerformanceExplanation(overview ? { overview } : {}).map(toSection)
  const hasTitles = sections.every(section => section.title)
  return (
    <div className="grid gap-[32px]">
      <div className="grid grid-cols-[1fr_1.2fr] gap-[48px] items-center max-[900px]:grid-cols-1 max-[900px]:gap-[32px]">
        <div>
          <p aria-label={grade.grade ? `종합 성능 등급 ${grade.grade}` : '종합 성능 등급 미판정'}>
            <strong className="text-[72px] font-[750] tracking-[-3px] leading-none">{grade.grade ?? '—'}</strong>
            <span className="ml-[8px] text-[20px] text-faint">등급</span>
          </p>
          <strong className="block mt-[20px] text-[20px] font-[700]">
            {grade.band
              ? grade.band.status
              : analyzing
                ? `AI 분석 중… ${diagnosis.elapsed ?? 0}초`
                : '등급을 계산하는 중이에요'}
          </strong>
          {!overview && !analyzing && (
            <p className="mt-[6px] text-[13px] text-faint">보유 게임을 가져오거나 게임을 검색하면 등급이 계산돼요.</p>
          )}
          {(diagnosis.overviewError || diagnosis.error) && (
            <p
              role="alert"
              className="mt-[16px] p-[14px] rounded-[12px] bg-bg text-[13px] text-[#e5484d] leading-[1.6]"
            >
              {diagnosis.overviewError || diagnosis.error} 잠시 뒤 사양 입력 완료 버튼에서 다시 저장하면 재분석해요.
            </p>
          )}
        </div>
        <div>
          {judged ? (
            <>
              <RadarChart
                items={judgements.map(item => ({ label: item.label, value: item.value }))}
                formatValue={value => verdictByValue[value] ?? '분석 전'}
              />
              <p className="mt-[12px] text-center text-[12px] text-faint">
                부품별 AI 판정을 그린 그래프예요. 측정 점수가 아니에요.
              </p>
            </>
          ) : (
            <p className="p-[32px] rounded-[16px] bg-bg text-center text-[14px] text-muted">
              AI 분석이 끝나면 부품별 판정 그래프를 보여드려요.
            </p>
          )}
        </div>
      </div>

      <ul
        className={`grid gap-[16px] ${hasTitles ? 'grid-cols-4 max-[1000px]:grid-cols-2 max-[560px]:grid-cols-1' : 'grid-cols-1'}`}
      >
        {sections.map(section => (
          <li
            key={section.title || section.body}
            className="flex flex-col gap-[12px] p-[20px] rounded-[20px] bg-bg min-w-0"
          >
            {section.title && (
              <span className="flex items-center gap-[10px] text-[14px] font-[650] text-primary-text">
                <span className="grid place-items-center w-[32px] h-[32px] rounded-full bg-surface text-muted shrink-0">
                  <GSIcon name={SECTION_ICONS[section.title] ?? 'info'} size={16} />
                </span>
                {section.title}
              </span>
            )}
            <p className="text-[14px] text-muted leading-[1.7]">{section.body}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
