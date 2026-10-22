import { DANGER_TEXT_BUTTON, GSIcon } from '@/shared/ui'
import { NOTE } from '../importStyles'

const HISTORY_URL = 'https://store.steampowered.com/account/history/'
const LICENSES_URL = 'https://store.steampowered.com/account/licenses/'

// 처음 화면: 스팀에서 페이지를 저장하는 방법 + 파일 선택 / 표 붙여넣기. 이미 가져온 기록이 있으면 모두 지우기 버튼.
export default function ImportGuide({ fileRef, onFile, onPaste, hasHistory, busy, onRemoveAll }) {
  return (
    <div>
      <ol className="mb-[16px] pl-[18px] text-[14px] leading-[1.9] list-decimal [&_a]:text-primary-text [&_a]:underline">
        <li>
          크롬에서 스팀에 로그인한 뒤{' '}
          <a href={HISTORY_URL} target="_blank" rel="noreferrer">
            구매내역 페이지
          </a>
          를 엽니다.
        </li>
        <li>
          맨 아래 <strong>"더 보기"</strong>가 안 나올 때까지 누릅니다.
        </li>
        <li>
          <strong>Ctrl + S</strong> → <strong>"웹페이지, 전체"</strong>로 저장하고 아래에 올립니다.
        </li>
        <li>
          (선택){' '}
          <a href={LICENSES_URL} target="_blank" rel="noreferrer">
            라이선스 페이지
          </a>
          도 같은 방법으로 올리면, 선물·무료로 받은 게임의 획득일과 방법까지 보여줘요.
        </li>
      </ol>
      <label className="flex items-center gap-[10px] px-[16px] py-[14px] border border-dashed border-border rounded-[12px] cursor-pointer text-[14px] font-[650] hover:bg-surface-hover focus-within:outline-2 focus-within:outline-primary focus-within:outline-offset-2">
        <GSIcon name="library" size={18} />
        <span>저장한 HTML 파일 선택 (구매내역 또는 라이선스)</span>
        <input className="sr-only" ref={fileRef} type="file" accept=".html,.htm,text/html" onChange={onFile} />
      </label>
      <textarea
        className="block w-full mt-[10px] px-[14px] py-[12px] border border-dashed border-border rounded-[12px] bg-transparent text-text text-[14px] resize-none placeholder:text-muted"
        aria-label="구매내역 또는 라이선스 표 붙여넣기"
        placeholder="또는 구매내역·라이선스 표를 복사해서 여기에 붙여넣기 (Ctrl + V)"
        value=""
        onChange={() => {}}
        onPaste={onPaste}
        rows={2}
      />
      <p className={NOTE}>파일은 이 브라우저 안에서만 읽어요. 실제 결제 금액과 구매일로 소비 분석이 바뀝니다.</p>
      {hasHistory && (
        <button type="button" className={DANGER_TEXT_BUTTON + ' mt-[14px]'} onClick={onRemoveAll} disabled={busy}>
          가져온 구매내역·라이선스 모두 지우기
        </button>
      )}
    </div>
  )
}
