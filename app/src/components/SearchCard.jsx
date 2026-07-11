import React from 'react'

function SearchCard({ anime, onClick }) {
  const title = anime?.title || "Unknown"
  const img = anime?.main_picture?.large || anime?.main_picture?.medium || anime?.images?.jpg?.large_image_url || anime?.images?.jpg?.image_url
  const rating = anime?.score
  const status = anime?.status

  return (
    <div 
      onClick={() => onClick?.(anime.mal_id)}
      className="w-full group cursor-pointer active:scale-[0.98] transition-all duration-300 select-none"
    >
      <div className="w-full h-32 my-3 bg-linear-to-r from-[#200800]/90 to-[#140500]/70 backdrop-blur-md border border-[#A46A44]/10 rounded-2xl overflow-hidden flex shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:border-[#A77510]/40 hover:shadow-[0_0_20px_rgba(167,117,16,0.15)] transition-all duration-300 relative group">
        
        <div className="absolute top-0 right-0 w-0.5 h-0 bg-linear-to-b from-[#A77510] to-transparent group-hover:h-full transition-all duration-500" />

        <div className="w-24 h-full shrink-0 overflow-hidden relative border-r border-[#A46A44]/10">
          {img ? (
            <>
              <img
                src={img}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
                alt={title}
              />
              <div className="absolute inset-0 bg-linear-to-r from-transparent to-[#200800]/50" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#200800]/60 font-mono text-[9px] text-[#A46A44]/40 uppercase font-black tracking-widest">
              NO IMG
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between p-4 relative z-10">
          
          <div className="w-full min-w-0">
            <h3 className="text-xs font-mono font-black text-[#E6BD9E] group-hover:text-white transition-colors duration-300 line-clamp-2 leading-snug tracking-wide uppercase wrap-break-word">
              {title}
            </h3>
          </div>

          <div className="w-full flex items-center justify-between mt-2 border-t border-[#A46A44]/5 pt-2">
            
            <span className="text-[9px] font-mono font-bold text-[#A46A44]/80 tracking-widest uppercase truncate max-w-[70%]">
              {status || "UNKNOWN"}
            </span>

            <div className="flex items-center space-x-1 font-mono font-black text-xs text-[#A77510] drop-shadow-[0_0_8px_rgba(167,117,16,0.3)] bg-[#200800]/60 border border-[#A46A44]/20 px-2 py-0.5 rounded-md">
              <span className="text-[10px]">★</span>
              <span className="text-[#E6BD9E]">
                {rating && Number(rating) !== 0 ? Number(rating).toFixed(1) : '—'}
              </span>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}

export default SearchCard