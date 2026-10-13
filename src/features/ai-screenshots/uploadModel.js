export function validateUpload(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return 'JPG, PNG, WEBP 이미지를 선택해주세요.';
  if (!file.size || file.size > 10 * 1024 * 1024) return '0바이트보다 크고 10MB 이하인 이미지를 선택해주세요.';
  return '';
}
