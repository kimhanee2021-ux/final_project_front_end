import { FOCUS_RING } from '../shell/authStyles'

// 온보딩 단계 버튼 모양
export const PRIMARY = `flex items-center justify-center gap-[12px] w-full min-h-[54px] px-[20px] py-[13px] rounded-[10px] bg-auth-mint text-[#062c23] text-[15px] font-[750] transition-[background,transform] duration-[180ms] hover:bg-[#69f5d0] active:translate-y-[1px] disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:bg-auth-mint ${FOCUS_RING}`
export const SECONDARY = `inline-flex items-center justify-center gap-[8px] min-h-[40px] px-[16px] rounded-[10px] border border-[#ffffff33] bg-[#ffffff0d] text-[13px] font-[600] text-auth-text hover:border-auth-mint hover:text-auth-mint ${FOCUS_RING}`
export const TEXT = `bg-transparent text-[12px] text-auth-muted underline underline-offset-[4px] hover:text-auth-mint ${FOCUS_RING}`
