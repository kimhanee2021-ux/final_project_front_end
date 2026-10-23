// 계정 섹션의 버튼은 모두 같은 모양(보조 버튼 + 아이콘)으로 통일한다.
// gs-secondary-button은 12px·굵기 750이라 한글이 뭉개져 보여서, 이 섹션에서는 글자를 키우고 굵기를 낮춘다
// (gamesense.css는 레이어 밖 규칙이라 Tailwind 유틸리티가 이기려면 !가 필요하다).
export const ACTION_BUTTON = 'gs-secondary-button disabled:opacity-60 !text-[14px] !font-[600] !tracking-normal !min-h-[40px] !px-[20px] antialiased'
