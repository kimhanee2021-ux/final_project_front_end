import { RadarChart } from '@/shared/ui'
import EvaluationNotice from './EvaluationNotice'
import { overallPerformanceExplanation } from '../model/pcGrade'
import { VERDICTS } from '../model/pcEvaluation'

const verdictByValue = Object.fromEntries(Object.values(VERDICTS).map(item => [item.value, item.label]))

// 종합 등급: 왼쪽에 큰 등급(A~E)과 AI 종합 설명, 오른쪽에 부품별 판정 레이더.
// 레이더는 백엔드의 부품 판정(유지 가능/확인 필요/교체 검토)을 모양으로 보여줄 뿐 측정 점수가 아니다.
export default function ScorePanel({ evaluation }) {
  const { status, grade, overview, judgements, analyzing, diagnosis } = evaluation
  if (status !== 'ready') return <EvaluationNotice status={status} />
  const judged = judgements.some(item => item.verdict)
  return (
    <div className="grid grid-cols-[1fr_1.2fr] gap-[48px] items-center max-[900px]:grid-cols-1 max-[900px]:gap-[32px]">
      <div>
        <p aria-label={grade.grade ? `종합 성능 등급 ${grade.grade}` : '종합 성능 등급 미판정'}>
          <strong className="text-[72px] font-[750] tracking-[-3px] leading-none">{grade.grade ?? '—'}</strong>
          <span className="ml-[8px] text-[20px] text-faint">등급</span>
        </p>
        <strong className="block mt-[20px] text-[20px] font-[700]">
          {grade.band ? grade.band.status : analyzing ? `AI 분석 중… ${diagnosis.elapsed ?? 0}초` : '등급을 계산하는 중이에요'}
        </strong>
        <p className="mt-[6px] text-[13px] text-faint">
          {overview?.scopeType === 'owned'
            ? `내 보유게임 ${overview.scopeGameCount}개 기준 · AI 추정 · 낮은 신뢰`
            : overview?.scopeType === 'search'
              ? `검색한 ${overview.gameName} 기준 · AI 추정 · 낮은 신뢰`
              : '보유 게임을 가져오거나 게임을 검색하면 등급이 계산돼요.'}
        </p>
        {(diagnosis.overviewError || diagnosis.error) && (
          <p role="alert" className="mt-[16px] p-[14px] rounded-[12px] bg-bg text-[13px] text-[#e5484d] leading-[1.6]">
            {diagnosis.overviewError || diagnosis.error} 잠시 뒤 사양 입력 완료 버튼에서 다시 저장하면 재분석해요.
          </p>
        )}
        <div className="mt-[20px] grid gap-[10px]">
          {overallPerformanceExplanation(overview ? { overview } : {}).map(text => (
            <p key={text} className="text-[14px] text-muted leading-[1.7]">
              {text.includes(': ') ? (
                <>
                  <strong className="text-text">{text.slice(0, text.indexOf(': '))}</strong> {text.slice(text.indexOf(': ') + 2)}
                </>
              ) : (
                text
              )}
            </p>
          ))}
        </div>
      </div>
      <div>
        {judged ? (
          <>
            <RadarChart items={judgements.map(item => ({ label: item.label, value: item.value }))} formatValue={value => verdictByValue[value] ?? '분석 전'} />
            <p className="mt-[12px] text-center text-[12px] text-faint">부품별 AI 판정을 그린 그래프예요. 측정 점수가 아니에요.</p>
          </>
        ) : (
          <p className="p-[32px] rounded-[16px] bg-bg text-center text-[14px] text-muted">AI 분석이 끝나면 부품별 판정 그래프를 보여드려요.</p>
        )}
      </div>
    </div>
  )
}
