// 여러 화면이 같이 쓰는 버튼 Tailwind 클래스 묶음 (기존 .text-button/.primary-button 대체)
const TEXT_BUTTON_BASE =
  'inline-flex items-center gap-[8px] py-[4px] bg-transparent text-[13px] font-[650] hover:underline disabled:opacity-60 disabled:no-underline'
export const TEXT_BUTTON = TEXT_BUTTON_BASE + ' text-primary-text'
// 되돌릴 수 없는 동작(가져온 기록 모두 지우기)용
export const DANGER_TEXT_BUTTON = TEXT_BUTTON_BASE + ' text-[#e5484d]'
export const PRIMARY_BUTTON =
  'px-[20px] h-[40px] bg-primary text-on-primary rounded-full text-[14px] font-semibold whitespace-nowrap disabled:opacity-60'
