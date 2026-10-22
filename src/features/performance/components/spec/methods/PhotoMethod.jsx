import SystemPhotoInput from '../SystemPhotoInput'

// ③ 사진: 시스템 정보 사진을 AI가 읽어 ② 칸에 채운다.
export default function PhotoMethod({ signedIn, onApply }) {
  return (
    <section aria-label="사진으로 입력">
      <p className="mb-[14px] text-[13px] text-muted leading-[1.7]">
        Windows 설정 → 시스템 → 정보 화면을 찍은 사진을 올리면 AI가 부품 정보를 읽어요. 읽은 값은 “직접 입력”
        칸에 채워지니 확인하고 저장하세요.
      </p>
      <SystemPhotoInput signedIn={signedIn} onApply={onApply} />
    </section>
  )
}
