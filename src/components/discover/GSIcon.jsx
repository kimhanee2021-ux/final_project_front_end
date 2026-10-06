const paths = {
  user: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a8 8 0 0 1 16 0v2',
  edit: 'm16 3 5 5-12 12-6 1 1-6L16 3ZM13 6l5 5',
  camera: 'M3 6h4l2-3h6l2 3h4v15H3V6ZM16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  image: 'M3 3h18v18H3zM3 16l6-6 5 5 3-3 4 4M16 7h.01',
  pin: 'M19 9c0 6-7 13-7 13S5 15 5 9a7 7 0 1 1 14 0ZM15 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  wallet: 'M20 7V3H5a3 3 0 0 0 0 6h16v12H5a3 3 0 0 1-3-3V6M21 13h-6v4h6M17 15h.01',
  play: 'm8 4 12 8-12 8V4Z',
  pause: 'M7 4v16M17 4v16',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  plus: 'M12 5v14M5 12h14',
  note: 'M4 3h16v18H4zM8 7h8M8 11h8M8 15h5',
  monitor: 'M3 3h18v13H3zM12 16v5M7 21h10',
  cpu: 'M6 6h12v12H6zM9 9h6v6H9zM9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4',
  gpu: 'M3 5h18v13H3zM1 3v17M8 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM17 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM6 18v3M10 18v3M14 18v3',
  ram: 'M2 6h20v11H2zM6 9v4M10 9v4M14 9v4M18 9v4M4 17v3M8 17v3M12 17v3M16 17v3M20 17v3',
  drive: 'm5 3-2 9v8h18v-8l-2-9H5ZM3 12h18M7 16h.01M11 16h.01M7 7h10',
  shield: 'M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6l-9-4ZM8 12l3 3 5-6',
  refresh: 'M20 7a9 9 0 0 0-15-2L2 8M2 3v5h5M4 17a9 9 0 0 0 15 2l3-3M22 21v-5h-5',
  activity: 'M2 12h4l3-9 5 18 3-9h5',
  thermometer: 'M9 14V5a3 3 0 0 1 6 0v9a5 5 0 1 1-6 0ZM12 8v9M12 17v2M18 5h3M18 9h2',
  bulb: 'M9 18h6M9 21h6M9 15a6 6 0 1 1 6 0v3H9v-3ZM12 1v1M2 5l2 1M20 6l2-1M1 12h2M21 12h2',
  crown: 'm3 6 5 5 4-8 4 8 5-5-2 13H5L3 6ZM5 22h14',
  info: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM12 11v6M12 7h.01',
  home: 'm3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z',
  compass: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM16 8l-3 5-5 3 3-5z',
  grid: 'M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h6v6h-6z',
  list: 'M9 5h12M9 12h12M9 19h12M3 5h.01M3 12h.01M3 19h.01',
  flame:
    'M13 2c2 6-5 6-2 11 2 0 4-2 4-5 4 4 6 7 4 11-3 5-11 4-14-1-3-6 2-10 3-12-1 4 1 5 2 5 0-4 4-5 3-9Z',
  calendar:
    'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM8 14h3M8 18h6',
  chart: 'M4 20V11a2 2 0 0 1 4 0v9M10 20V5a2 2 0 0 1 4 0v15M16 20v-7a2 2 0 0 1 4 0v7',
  spark: 'm12 2 2.8 7.2L22 12l-7.2 2.8L12 22l-2.8-7.2L2 12l7.2-2.8z',
  gamepad:
    'M8 6h8c4 0 5 3 6 10 .5 4-3 5-5 2l-2-2H9l-2 2c-2 3-5.5 2-5-2C3 9 4 6 8 6ZM6 11h5M8.5 8.5v5M16 10h.01M18 13h.01M10 2h4',
  heart:
    'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
  folder: 'M3 7h18v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l3 4',
  settings:
    'm9 3 1-2h4l1 2 2 1 2 0 2 3-1 2v3l1 2-2 4-2-1-2 1-1 3h-4l-1-3-2-1-2 1-2-4 1-2V9L2 7l2-3h3zM16 11a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  search: 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  arrow: 'M4 12h15m-6-6 6 6-6 6',
  chevron: 'm8 10 4 4 4-4',
  sun: 'M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0',
  moon: 'M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10',
  globe:
    'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM2 12h20M12 2a20 20 0 0 1 0 20 20 20 0 0 1 0-20ZM4 6h16M4 18h16',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4',
  close: 'm6 6 12 12M6 18 18 6',
  menu: 'M3 6h18M3 12h18M3 18h18',
  clock: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM12 6v6l4 2',
  star: 'm12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z',
  steam:
    'M22 7a5 5 0 1 1-10 0 5 5 0 0 1 10 0ZM20 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM12 7 8 14M17 12l-5 6M1 13l5 2a4 4 0 1 1-2 4l-3-1M6 16l3 1',
  playstation:
    'M9 21V3l7 2c4 1 4 7 0 8l-2-1V7l-2-1v15M7 13l-5 2c-2 2 2 3 5 2M14 17l5-2c5-1 5 2 0 4l-5 2',
  xbox: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM5 4c6 2 11 9 13 15M19 4C13 6 8 13 6 19',
  switch:
    'M10 3H6a4 4 0 0 0-4 4v10a4 4 0 0 0 4 4h4V3ZM14 3h4a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4h-4V3ZM6 7v2M18 14v2',
  trophy: 'M8 3h8v7a4 4 0 0 1-8 0V3ZM8 5H3v3a5 5 0 0 0 5 5M16 5h5v3a5 5 0 0 1-5 5M12 14v6M7 21h10',
  check: 'm5 12 4 4L19 6',
}
export default function GSIcon({ name, size = 22, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name] || paths.gamepad} />
    </svg>
  )
}
