import { providerSendText } from '../../../model/pcPhoto'

// 사진을 고른 뒤 판독 전: 개인정보 안내 + AI 전송 동의 + 판독 버튼(진행 중이면 경과 초와 취소)
export default function PhotoReadControls({ consent, onConsent, busy, provider, elapsed, onRead, onCancel }) {
  return (
    <>
      <p className="pcd-photo-pending">
        장치 ID·제품 ID·사용자 이름은 가리고 사양 부분만 올려주세요. 사진은 서비스 서버에 저장하지 않아요.
      </p>
      <label className="pcd-photo-consent">
        <input type="checkbox" checked={consent} onChange={e => onConsent(e.target.checked)} disabled={busy || !provider} />
        사진과 확인한 PC 사양을 {providerSendText(provider)} 사양 판독과 게임 분석에 사용하는 데 동의해요.
      </label>
      <button className="gs-primary-button" disabled={!consent || busy || !provider} onClick={onRead}>
        {busy ? `사진에서 사양 읽는 중… ${elapsed}초` : 'AI로 사양 읽기'}
      </button>
      {busy && (
        <button className="pcd-inline-action" onClick={onCancel}>
          취소
        </button>
      )}
    </>
  )
}
