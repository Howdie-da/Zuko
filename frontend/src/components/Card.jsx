import React from 'react'

function Card({ anime }) {
  // Safe computation for the custom progress slider tracking line
  const totalEpisodes = anime.totalEp || 1 // Avoid division by zero crashes
  const progressPercent = Math.min((anime.currentEp / totalEpisodes) * 100, 100)

  return (
    <div className='w-full h-22.5 bg-[#200800]/50 border border-[#A46A44]/15 rounded-xl overflow-hidden flex shadow-md hover:border-[#A77510]/30 transition-all duration-200 group select-none'>
      
      {/* 1. LEFT POSTER THUMBNAIL */}
      <div className='w-16.25 h-full shrink-0 bg-neutral-900 overflow-hidden relative border-r border-[#A46A44]/10'>
        {anime.image ? (
          <img 
            src={anime.image} 
            alt={anime.title} 
            className='w-full h-full object-cover group-hover:scale-102 transition-transform duration-300'
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#441100]/20 text-[10px] text-[#A46A44]">
            NO IMG
          </div>
        )}
      </div>

      {/* 2. CORE INFORMATION GRID CONTAINER */}
      <div className='grow p-2.5 flex flex-col justify-between relative min-w-0'>
        
        {/* Top Info Tier: Title & Options Trigger */}
        <div className='flex justify-between items-start space-x-2'>
          <div className='min-w-0 flex-1'>
            <h4 className='font-bold text-sm text-[#E6BD9E] leading-tight truncate group-hover:text-white transition-colors'>
              {anime.title || "Unknown Title"}
            </h4>
          </div>
          
          {/* Touch Action Option Trigger (Ellipsis Dot Menu) */}
          <button 
            onClick={(e) => {
              e.stopPropagation() // Prevents triggering card click states
              console.log(`Open menu for anime id: ${anime.id}`)
            }}
            className='text-[#A46A44] hover:text-[#E6BD9E] transition-colors font-bold text-sm px-1.5 py-0.5 cursor-pointer active:scale-90'
          >
            ⋮
          </button>
        </div>

        {/* Bottom Info Tier: Counter, Progress Bar Track, Rating Badge */}
        <div className='flex justify-between items-end mt-1 gap-4'>
          
          {/* Left Side: Counter metrics and sliding layout bar */}
          <div className='grow flex flex-col space-y-1.5 min-w-0'>
            <div className='text-[11px] font-mono font-bold text-[#E6BD9E]/90 flex items-baseline space-x-1'>
              <span>EP:</span>
              <span className='text-sm text-white'>{anime.currentEp}</span>
              <span className='text-[#A46A44]/60'>/{anime.totalEp || '??'}</span>
            </div>
            
            {/* Custom Progress Bar Slider Track */}
            <div className='w-full h-1 bg-[#441100]/50 rounded-full overflow-hidden border border-white/5 relative'>
              <div 
                className='h-full bg-linear-to-r from-[#A77510] to-[#C85213] rounded-full transition-all duration-500'
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Right Side: High-Contrast Star Rating Box */}
          {anime.rating > 0 && (
            <div className='shrink-0 flex items-center space-x-1 bg-[#A77510]/10 border border-[#A77510]/30 rounded-md px-1.5 py-0.5 text-[#A77510] text-[10px] font-black shadow-xs tracking-wider'>
              <span>{anime.rating}</span>
              <span className='text-[9px] transform translate-y-[-0.5px]'>★</span>
            </div>
          )}

        </div>

      </div>
    </div>
  )
}

export default Card