import React from 'react'

function ScheduleCard({ anime, onAnimeSelect }) {
  // Calculate episodes already out vs total
  const releasedEpisodes = Math.max(0, anime.airingEpisode)
  const totalEpisodes = anime.totalEp > 0 ? anime.totalEp : '??'

  return (
    <div 
      onClick={() => onAnimeSelect(anime.id)}
      className="group relative w-full bg-[#200800]/40 backdrop-blur-md border border-[#A46A44]/20 hover:border-[#A77510]/50 rounded-2xl overflow-hidden flex shadow-lg hover:shadow-[0_8px_30px_rgba(167,117,16,0.15)] transition-all duration-300 cursor-pointer active:scale-[0.98]"
    >
      {/* LEFT: Poster Image Block */}
      <div className="w-24 sm:w-32 shrink-0 relative overflow-hidden bg-[#100300]">
        <img 
          src={anime.image} 
          alt={anime.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" 
        />
        {/* Subtle shadow gradient to blend image into the card body */}
        <div className="absolute inset-0 bg-linear-to-r from-transparent to-[#200800]/60 pointer-events-none" />
      </div>

      {/* RIGHT: Context & Info Block */}
      <div className="flex flex-col justify-between p-3 sm:p-4 flex-1 relative z-10">
        
        {/* Top: Broadcast Time & Title */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded-md bg-[#A77510]/10 border border-[#A77510]/30 text-[#A77510] text-[9px] font-mono font-black tracking-widest uppercase shadow-sm">
              {anime.formattedBroadcast}
            </span>
          </div>
          
          <h3 className="text-sm font-black font-sans text-[#E6BD9E] line-clamp-2 leading-tight group-hover:text-white transition-colors">
            {anime.title}
          </h3>
        </div>

        {/* Bottom: Stats Footer Row */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#A46A44]/10">
          
          {/* Community Rating */}
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#A46A44] font-bold">
            <svg 
              className="w-3 h-3 text-[#A77510] drop-shadow-[0_0_3px_rgba(167,117,16,0.8)]" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="tracking-wider">{anime.rating || 'N/A'}</span>
          </div>
          
          {/* Episodes Released Status */}
          <div className="flex flex-col items-end text-[9px] font-mono font-bold tracking-widest uppercase">
            <span className="text-[#A46A44] opacity-70 mb-0.5">Released</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-[#E6BD9E]">{releasedEpisodes}</span> 
              <span className="text-[#A46A44]">/ {totalEpisodes}</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}

export default ScheduleCard