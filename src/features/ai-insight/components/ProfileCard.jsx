// 서버가 규칙으로 정한 소비 유형(수집가형·몰입형 등). AI 분석 영역에서 가장 크게 보여 준다.
export default function ProfileCard({ profile }) {
  return (
    <div className="mb-[24px]">
      <p className="text-[13px] font-[650] text-muted">내 게임 소비 유형</p>
      <strong className="block mt-[4px] text-[clamp(34px,5vw,52px)] font-[800] tracking-[-1.5px] leading-[1.2] text-primary-text">{profile.name}</strong>
      <p className="mt-[6px] text-[14px] text-muted leading-[1.6]">{profile.meaning}</p>
    </div>
  )
}
