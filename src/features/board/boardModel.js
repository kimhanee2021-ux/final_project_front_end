// 백엔드 BoardPost.category는 자유 문자열 컬럼이라 값 목록을 강제하지 않는다.
// 엔티티 주석에 적힌 카테고리를 화면 탭으로 고정해서 쓴다.
export const BOARD_CATEGORIES = ['가성비랭킹', '세일공유', '방치게임인증', '구매고민QNA', '베타', '공지']

const dateTimeFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

// LocalDateTime은 타임존 없이 "2026-10-11T10:23:45" 형태로 내려온다.
export const dateTimeLabel = value => (value ? dateTimeFormatter.format(new Date(value)) : '')

// BoardPostSummaryResponse/DetailResponse는 authorId만 내려주고 닉네임은 없다.
export const postAuthorLabel = post => (post.isAnonymous ? '익명' : `회원 #${post.authorId}`)
