import { gradeBands } from '../model/pcGrade'

// A~E 다섯 단계 눈금: 내 등급 칸만 강조해서 "5단계 중 어디쯤인지"를 보여준다. 칸은 왼쪽부터 차례로 나타난다.
export default function GradeScale({ grade }) {
  return (
    <div className="mt-[20px]" role="img" aria-label={`A부터 E까지 다섯 단계 중 ${grade} 등급`}>
      <div className="flex gap-[6px]">
        {gradeBands.map((band, index) => (
          <div
            key={band.grade}
            className={`gs-grow-x origin-left flex-1 h-[42px] grid place-items-center rounded-[10px] text-[15px] font-[700] ${
              band.grade === grade ? 'bg-primary text-on-primary' : 'bg-bg text-faint'
            }`}
            style={{ animationDelay: `${index * 80}ms` }}
          >
            {band.grade}
          </div>
        ))}
      </div>
      <div className="mt-[6px] flex justify-between text-[11px] text-faint">
        <span>매우 쾌적</span>
        <span>개선 필요</span>
      </div>
    </div>
  )
}
