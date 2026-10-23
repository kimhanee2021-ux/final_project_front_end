import { PRIMARY_BUTTON } from '@/shared/ui'
import { number } from '@/shared/utils/formatters'
import { NOTE } from '../importStyles'

// 저장 결과: 라이선스를 가져왔을 때와 구매내역(거래)을 가져왔을 때 문구가 다르다.
export default function ImportResult({ result, onClose }) {
  if (result.kind === 'licenses')
    return (
      <div className="text-[13px] leading-[1.7]" role="status">
        <p>
          라이선스 <strong>{number(result.imported)}건</strong>을 가져와 보유 게임 {number(result.matched)}개에 획득일과 획득
          방법을 붙였어요.
          {result.duplicates > 0 && <> 이미 가져온 {number(result.duplicates)}건은 건너뛰었어요.</>}
        </p>
        <p className={NOTE}>데모·도구·옛 패키지처럼 지금 보유 게임이 아닌 라이선스는 연결되지 않아도 정상이에요.</p>
        <button type="button" className={PRIMARY_BUTTON + ' mt-[16px]'} onClick={onClose}>
          소비 분석 보기
        </button>
      </div>
    )
  return (
    <div className="text-[13px] leading-[1.7]" role="status">
      <p>
        <strong>{number(result.imported)}건</strong>을 가져왔어요.
        {result.duplicates > 0 && <> 이미 가져온 {number(result.duplicates)}건은 건너뛰었어요.</>}
      </p>
      {result.unsupportedCurrencies.length > 0 && (
        <p className={NOTE}>
          원화 환율을 구하지 못한 통화({result.unsupportedCurrencies.join(', ')})는 지출 합계에서 빠져요.
        </p>
      )}
      {result.unmatchedItems.length > 0 && (
        <details className={NOTE}>
          <summary className="cursor-pointer">게임과 연결하지 못한 상품 {number(result.unmatchedItems.length)}개 (지출 합계에는 포함)</summary>
          <ul className="mt-[6px] pl-[18px]">
            {result.unmatchedItems.slice(0, 20).map(name => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </details>
      )}
      <button type="button" className={PRIMARY_BUTTON + ' mt-[16px]'} onClick={onClose}>
        소비 분석 보기
      </button>
    </div>
  )
}
