import { GSIcon } from '@/shared/ui'
import { FOCUS_RING } from '../shell/authStyles'

// 입력 칸 하나: 라벨 + 아이콘 + 입력 + (비밀번호면) 보이기 버튼 + 오류. form은 useAuthForm이 돌려준 값이다.
export default function AuthField({ form, isSignup, name, label, icon, placeholder, type = 'text' }) {
  const { values, errors, change, checkAvailability, showPassword, setShowPassword } = form
  return (
    <div className="flex flex-col">
      <label className="text-[13px] inline-block font-[550] mb-[9px]" htmlFor={`auth-${name}`}>{label}</label>
      <div className={`flex items-center gap-[13px] min-h-[54px] px-[17px] bg-[#ffffff0d] border rounded-[10px] transition-[border-color,box-shadow] duration-150 focus-within:border-auth-mint focus-within:shadow-[0_0_0_3px_#35edbe10] ${errors[name] ? 'border-[#e97f86]' : 'border-[#ffffff2e]'}`}>
        <GSIcon name={icon} size={21} className="text-[#8499ad] shrink-0" />
        <input id={`auth-${name}`} name={name} type={type} value={values[name]} onChange={change} placeholder={placeholder} required
          autoComplete={name === 'email' ? 'email' : name === 'name' ? 'nickname' : isSignup ? 'new-password' : 'current-password'}
          onBlur={name === 'email' || name === 'name' ? checkAvailability : undefined}
          maxLength={name === 'name' ? 24 : name === 'email' ? 254 : 128}
          minLength={isSignup && name === 'password' ? 8 : undefined}
          aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `auth-${name}-error` : undefined}
          className={`w-full min-w-0 py-[16px] text-[14px] text-auth-text bg-transparent border-0 outline-none placeholder:text-[#91a2b5] ${FOCUS_RING}`} />
        {name === 'password' && <button type="button" className={`grid place-items-center bg-transparent text-[#afc3d9] p-[10px] mr-[-9px] shrink-0 rounded-[6px] ${FOCUS_RING}`} onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'} aria-pressed={showPassword}><GSIcon name={showPassword ? 'eyeOff' : 'eye'} size={21} /></button>}
      </div>
      {errors[name] && <p className="text-[12px] text-[#ff9e9e] mt-[7px]" id={`auth-${name}-error`}>{errors[name]}</p>}
    </div>
  )
}
