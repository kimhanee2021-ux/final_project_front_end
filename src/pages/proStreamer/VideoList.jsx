import { useState } from 'react'

export default function VideoList({ videos }) {
  const [activeId, setActiveId] = useState(null)
  return videos.map((video, index) => (
    <article key={video.id} className="min-w-0 overflow-hidden rounded-[16px] border border-border bg-surface">
      {activeId === video.id ? (
        <iframe
          className="aspect-video min-h-[200px] w-full border-0 bg-black"
          src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&playsinline=1&hl=ko&rel=0`}
          title={`${video.channel} · ${video.title}`}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <button type="button" onClick={() => setActiveId(video.id)}
          aria-label={`${video.displayTitle} 영상 재생`}
          className="group relative flex aspect-video min-h-[200px] w-full items-center justify-center overflow-hidden bg-black focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary">
          <img src={video.thumbnail} alt="" loading="lazy"
            className="absolute inset-0 h-full w-full object-contain opacity-80 transition-opacity group-hover:opacity-100" />
          <span className="relative rounded-full bg-black/80 px-[20px] py-[12px] text-[14px] font-[700] text-white">▶ 영상 재생</span>
        </button>
      )}
      <div className="p-[18px]">
        <p className="mb-[8px] text-[11px] font-[700] text-primary-text">{String(index + 1).padStart(2, '0')} · {video.category}</p>
        <h3 className="break-words text-[16px] font-[750] leading-[1.6]">{video.displayTitle}</h3>
        <p className="mt-[6px] break-words text-[11px] leading-[1.6] text-muted">{video.title}</p>
        <a href={video.channelUrl} target="_blank" rel="noopener noreferrer"
          className="mt-[10px] inline-block text-[12px] font-[650] text-primary-text">{video.channel}</a>
        <div className="mt-[16px] flex flex-wrap items-center justify-between gap-[10px] border-t border-border pt-[12px] text-[12px]">
          <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-primary-text">유튜브에서 보기 ↗</a>
          {activeId === video.id && <button type="button" onClick={() => setActiveId(null)} className="text-muted">재생 종료</button>}
        </div>
      </div>
    </article>
  ))
}
