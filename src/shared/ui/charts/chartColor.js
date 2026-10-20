// 장르 순번별 보라 톤온톤 색 (tokens.css의 --chart-1..5)
export const chartColor = index => `var(--chart-${(index % 5) + 1})`
