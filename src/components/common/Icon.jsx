const paths = {
  grid: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  chart: 'M4 20V10 M10 20V4 M16 20v-8 M22 20H2',
  library: 'M4 4v16 M9 4v16 M14 4v16 M18 4l4 16',
  arrow: 'M5 12h14 M13 6l6 6-6 6',
  chevron: 'M9 5l7 7-7 7',
  wallet: 'M20 8V5H4a2 2 0 010-4h14v4 M4 5v15h17V8H4 M16 12h5v5h-5z',
  bag: 'M5 7h14l1 14H4L5 7z M9 8V5a3 3 0 016 0v3',
  clock: 'M12 8v5l3 2 M22 12a10 10 0 11-20 0 10 10 0 0120 0',
  spark: 'M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z',
  sun: 'M12 1v2 M12 21v2 M1 12h2 M21 12h2 M4 4l2 2 M18 18l2 2 M4 20l2-2 M18 6l2-2 M17 12a5 5 0 11-10 0 5 5 0 0110 0',
  moon: 'M21 13A9 9 0 1111 3a7 7 0 0010 10',
  monitor: 'M3 3h18v14H3z M8 21h8 M12 17v4',
  menu: 'M4 6h16 M4 12h16 M4 18h16',
  close: 'M6 6l12 12 M6 18L18 6',
  check: 'M5 12l4 4L19 6',
  search: 'M21 21l-5-5 M18 10a8 8 0 11-16 0 8 8 0 0116 0',
  info: 'M12 11v6 M12 7v.2 M22 12a10 10 0 11-20 0 10 10 0 0120 0',
  refresh: 'M20 7V2 M20 7h-5 M20 7a9 9 0 10 1 8',
}
export default function Icon({ name, size = 20, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name] || paths.grid} />
    </svg>
  )
}
