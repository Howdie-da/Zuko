import React from 'react'
import { useSelector } from 'react-redux'

function AnimeDetails({ animeId, onClose }) {
  // 1. In production, pull the full item data from your Redux store or local search cache matching the animeId
  const animeLists = useSelector(state => state.anime)
  
  // Flatten all slices to find the target anime object instantly
  const allAnime = [...animeLists.watching, ...animeLists.completed, ...animeLists.on_hold, ...animeLists.plan_to_watch, ...animeLists.dropped]
  const target = allAnime.find(item => item.node.id === animeId)

  if (!target) return null

  // Clean payload destructuring mapping loop
  const anime = {
    title: target.node.title,
    image: target.node.main_picture?.large || target.node.main_picture?.medium,
    currentEp: target.node.my_list_status?.num_episodes_watched || 0,
    totalEp: target.node.num_episodes || 0,
    score: target.node.my_list_status?.score || 0,
    status: target.node.my_list_status?.status || 'plan_to_watch',
    synopsis: target.node.synopsis || "No data sync loaded from MyAnimeList portal.",
    airingStart: target.node.start_date || "Unknown",
    airingEnd: target.node.end_date || "Unfinished",
    broadcastDay: target.node.broadcast?.day_of_the_week || "N/A"
  }

  const progressPercent = anime.totalEp > 0 ? (anime.currentEp / anime.totalEp) * 100 : 0

  return (
    <div className="w-full text-white relative flex flex-col animate-fade-in">
      
      {/* ================= 1. FULL BLEED SCREEN BACKDROP  ================= */}
      <div className="absolute inset-0 h-screen overflow-hidden z-10 select-none pointer-events-none">
        <img 
          src={anime.image} 
          className="w-full h-screen object-cover object-top opacity-40 brightness-50 will-change-transform" 
          alt="" 
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#200800]/60 to-[#200800]" />
      </div>

      {/* FIXED CONTROL HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full max-w-4xl mx-auto px-6 pt-6 pointer-events-none">
        <div className="w-full flex items-center justify-between pointer-events-auto">
          <button 
            onClick={onClose} 
            className="group flex items-center justify-center w-10 h-10 bg-[#200800]/80 backdrop-blur-md border border-[#A46A44]/30 rounded-xl text-[#A46A44] hover:text-[#E6BD9E] transition-all duration-300 shadow-xl cursor-pointer"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform">{"<"}</span>
          </button>
        </div>
      </header>

      {/* ================= 2. CORE DETAILS CANVAS ================= */}
      <div className="relative z-20 max-w-2xl w-full mx-auto px-4 pt-28 pb-12 flex flex-col">
        
        {/* PROFILES HEADER AXIS SPLIT */}
        <div className="flex items-end space-x-5">
          {/* Crisp, floating, dimensional foreground poster profile card */}
          <div className="w-28 sm:w-36 shrink-0 shadow-[0_12px_30px_rgba(32,8,0,0.6)] rounded-xl overflow-hidden border border-[#A46A44]/30 bg-[#200800]">
            <img src={anime.image} className="w-full h-auto object-cover" alt={anime.title} />
          </div>
          
          {/* Title and metadata block description placement alignment */}
          <div className="flex-1 pb-2">
            <h1 className="text-lg sm:text-2xl font-black tracking-wide leading-tight text-[#E6BD9E] uppercase drop-shadow-md">
              {anime.title}
            </h1>
            <p className="text-[10px] font-mono tracking-widest text-[#A46A44] uppercase mt-1">
              STATUS: <span className="text-gray-300 font-bold">{anime.status.replace(/_/g, ' ')}</span>
            </p>
          </div>
        </div>

        {/* ================= 3. TRACKING PROGRESS OVERLAY INTERACTION TRAY ================= */}
        <div className="w-full bg-[#200800]/50 backdrop-blur-md border border-[#A46A44]/20 rounded-2xl p-4 mt-6 shadow-xl flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono tracking-widest text-[#A46A44] uppercase">EPISODE:</span>
              <span className="text-xl font-black font-mono tracking-wider mt-0.5 text-white">
                {anime.currentEp} <span className="text-xs text-[#A46A44]">/ {anime.totalEp || '??'}</span>
              </span>
            </div>
            
            {/* Quick Increment Macro Action Button Trigger */}
            <button className="px-4 py-2 bg-[#A77510]/20 hover:bg-[#A77510]/30 active:scale-95 border border-[#A77510]/40 rounded-xl text-[10px] font-black tracking-widest text-[#E6BD9E] transition-all duration-300 cursor-pointer shadow-lg shadow-[#A77510]/5">
              UPDATE
            </button>
          </div>

          {/* Glowing horizontal performance index slider axis gauge line */}
          <div className="w-full h-1.5 bg-[#200800] rounded-full overflow-hidden border border-[#A46A44]/10">
            <div 
              className="h-full bg-linear-to-r from-[#A77510] to-[#E6BD9E] shadow-[0_0_12px_#A77510] transition-all duration-500 ease-out" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* ================= 4. ASYMMETRIC SPEC MODULAR DATA GRID ================= */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          
          {/* GRID TILE 1: SYNOPSIS STORY PANEL (SPAN FULL ROW WIDTH) */}
          <div className="col-span-2 bg-[#200800]/30 border border-[#A46A44]/10 rounded-2xl p-4 flex flex-col space-y-2">
            <h3 className="text-[10px] font-mono tracking-widest text-[#A46A44] uppercase font-black">SYNOPSIS SPEC</h3>
            <p className="text-xs text-[#E6BD9E]/80 leading-relaxed font-normal font-sans max-h-48 overflow-y-auto scrollbar-none pr-1">
              {anime.synopsis}
            </p>
          </div>

          {/* GRID TILE 2: METRIC VALUE RATINGS PANEL */}
          <div className="bg-[#200800]/30 border border-[#A46A44]/10 rounded-2xl p-4 flex flex-col justify-center">
            <span className="text-[10px] font-mono tracking-widest text-[#A46A44] uppercase block">SCORE:</span>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-2xl font-black font-mono text-[#A77510]">{anime.score ? anime.score : 'N/A'}</span>
              <span className="text-[9px] font-mono text-[#A46A44]">/ 10</span>
            </div>
          </div>

          {/* GRID TILE 3: SCHEDULING TIME BROADCAST BLOCK */}
          <div className="bg-[#200800]/30 border border-[#A46A44]/10 rounded-2xl p-4 flex flex-col">
            <span className="text-[10px] font-mono tracking-widest text-[#A46A44] uppercase block">AIRING INTERVAL:</span>
            <span className="text-xs font-bold font-mono text-gray-200 mt-2 uppercase tracking-wide">
              {anime.airingStart} - {anime.airingEnd}
            </span>
          </div>

        </div>

      </div>
    </div>
  )
}

export default AnimeDetails