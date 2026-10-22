import { Link } from 'react-router-dom'

// AI 분석 동의 체크 (필수). 저장하려다 막혔으면(warning) 눈에 띄게 칠한다. 로그인 전이면 로그인 안내를 붙인다.
export default function AiConsentField({ checked, onChange, warning, signedIn }) {
  return (
    <label
      className={`flex items-start gap-[10px] mt-[16px] p-[12px] rounded-[14px] text-[12px] leading-[1.6] cursor-pointer transition-colors ${warning && !checked ? 'bg-peach-bg text-peach-text' : 'text-muted'}`}
    >
      <input
        type="checkbox"
        className="mt-[3px] w-[16px] h-[16px] accent-primary shrink-0"
        checked={checked}
        onChange={event => onChange(event.target.checked)}
      />
      <span>
        입력한 사양을 AI 분석(Gemini·Groq)에 전송해 PC 평가에 쓰는 데 동의해요. (필수)
        {!signedIn && (
          <>
            {' '}
            분석은{' '}
            <Link to="/login?next=%2Fpc-check" className="text-primary-text underline">
              로그인
            </Link>{' '}
            후에 진행돼요.
          </>
        )}
      </span>
    </label>
  )
}
