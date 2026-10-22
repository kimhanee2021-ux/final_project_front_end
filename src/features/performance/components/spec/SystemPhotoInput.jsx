import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { GSIcon } from '@/shared/ui'
import { useSystemPhotoReader } from '../../hooks/useSystemPhotoReader'
import PhotoReadControls from './photo/PhotoReadControls'
import SpecReviewForm from './photo/SpecReviewForm'

// Windows 시스템 정보 사진을 올리면 AI가 부품 정보를 읽고, 사용자가 확인·수정한 사양을 onApply로 넘긴다.
export default function SystemPhotoInput({ onApply, signedIn }) {
  const inputRef = useRef(null)
  const reader = useSystemPhotoReader(signedIn)
  const { photo, error, busy, values } = reader
  return (
    <div className="pcd-photo-input">
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={reader.selectPhoto} hidden />
      {photo ? (
        <>
          <img src={photo.url} alt="선택한 시스템 정보 사진" onError={reader.photoFailed} />
          <span className="pcd-photo-name">{photo.name}</span>
        </>
      ) : (
        <div className="pcd-photo-empty">
          <GSIcon name="image" size={34} />
          <strong>시스템 정보 사진을 넣어주세요</strong>
          <span>Windows 설정 → 시스템 → 정보</span>
        </div>
      )}
      <button className="pcd-outline-action" onClick={() => inputRef.current.click()}>
        <GSIcon name="image" size={17} />
        {photo ? '사진 변경' : '사진 선택'}
      </button>
      <p className="pcd-photo-formats">JPG · PNG · WEBP / 최대 10MB · 2400만 화소</p>
      {!signedIn && (
        <p className="pcd-photo-pending">
          <Link to="/login?next=%2Fpc-check">로그인</Link> 후 AI로 사양을 읽을 수 있어요.
        </p>
      )}
      {photo && signedIn && !values && (
        <PhotoReadControls
          consent={reader.consent}
          onConsent={reader.setConsent}
          busy={busy}
          provider={reader.provider}
          elapsed={reader.elapsed}
          onRead={reader.readPhoto}
          onCancel={reader.cancel}
        />
      )}
      {error && (
        <p role="alert" className="pcd-photo-error">
          {error}
        </p>
      )}
      {values && (
        <SpecReviewForm
          values={values}
          setValues={reader.setValues}
          warnings={reader.warnings}
          gpus={reader.gpus}
          signedIn={signedIn}
          provider={reader.provider}
          consent={reader.consent}
          onApply={onApply}
          onError={reader.setError}
        />
      )}
    </div>
  )
}
