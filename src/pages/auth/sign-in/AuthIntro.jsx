import { GSIcon } from '@/shared/ui'

// 넓은 화면 왼쪽 소개: 서비스 한 줄 소개 + 가입하면 이어지는 세 단계
export default function AuthIntro() {
  return (
    <section className="auth-enter-copy max-[900px]:hidden" aria-label="GameSense 소개">
      <p className="text-[#b9d5c5] text-[11px] font-[600] tracking-[3px]">YOUR PLAY, YOUR STORY</p>
      <h2 className="mt-[22px] text-[clamp(36px,4.2vw,64px)] font-[400] leading-[1.35] tracking-[-2.6px] break-keep text-[#e8ece6] [text-shadow:0_2px_22px_#10171b55]">
        게임은 많으니까.<br /><em className="not-italic text-[#b9d5c5]">내 취향부터.</em>
      </h2>
      <p className="mt-[24px] text-[14px] font-[300] leading-[2] text-[#d5ded6] break-keep">
        스팀 계정을 연결하면 보유 게임과 플레이 시간으로<br />소비 패턴을 분석하고, 다음에 할 게임을 추천해 드려요.
      </p>
      <ol className="list-none p-0 mt-[40px] grid gap-[16px] text-[13px] text-[#c8d4cc]">
        {[
          ['user', '1', '계정 만들기', '이메일로 간단하게 시작해요.'],
          ['steam', '2', '스팀 연동', '필수 · 보유 게임을 불러와요.'],
          ['monitor', '3', '구매 내역 · PC 사양', '선택 · 넣으면 AI 분석이 더 정확해져요.'],
        ].map(([icon, number, title, text]) => (
          <li key={number} className="flex items-center gap-[14px]">
            <span className="grid place-items-center w-[38px] h-[38px] rounded-full border border-[#ffffff2e] bg-[#ffffff0a] text-[#b9dcc8] shrink-0"><GSIcon name={icon} size={18} /></span>
            <span><strong className="font-[600] text-[#e8ece6]">{title}</strong><br /><span className="text-[12px] text-[#a9b8ae]">{text}</span></span>
          </li>
        ))}
      </ol>
    </section>
  )
}
