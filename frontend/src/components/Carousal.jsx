import React, { useRef, useEffect } from 'react'

function Carousal({ 
  title = "Title", 
  list = [],
  onAnimeSelect 
}) {
  const scrollTrackRef = useRef(null);

  useEffect(() => {
    const track = scrollTrackRef.current;
    if (!track) return;

    const handleWheelScroll = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        
        track.scrollLeft += e.deltaY * 1.2;
      }
    };

    track.addEventListener('wheel', handleWheelScroll, { passive: false });

    return () => {
      track.removeEventListener('wheel', handleWheelScroll);
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mb-6">
      <div className="w-full flex flex-col bg-[#200800]/50 backdrop-blur-md border border-[#A46A44]/10 rounded-2xl p-4 shadow-xl">
        
        <div className="pl-2 mb-3 text-xs font-mono font-black tracking-widest text-[#A46A44] uppercase">
          {title}
        </div>

        <div 
          ref={scrollTrackRef}
          className="w-full flex space-x-4 overflow-x-auto scrollbar-none pb-2"
        >
          {list.length > 0 ? (
            list.map((anime) => (
              <div 
                key={anime.mal_id}
                onClick={() => onAnimeSelect?.(anime.mal_id)}
                className="w-28 sm:w-32 shrink-0 cursor-pointer active:scale-95 transition-transform duration-200"
              >
                <div className="w-full h-40 rounded-xl overflow-hidden border border-[#A46A44]/20 bg-[#200800]/60 shadow-md">
                  <img 
                    src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url} 
                    className="w-full h-full object-cover" 
                    alt={anime.title} 
                    loading="lazy"
                  />
                </div>
                <p className="text-[10px] font-mono font-bold text-[#E6BD9E] truncate mt-2 px-1 uppercase tracking-wide">
                  {anime.title}
                </p>
              </div>
            ))
          ) : (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="w-28 sm:w-32 shrink-0 flex flex-col">
                <div className="w-full h-40 bg-[#200800]/30 border border-[#A46A44]/5 rounded-xl animate-pulse" />
                <div className="w-16 h-2.5 bg-[#200800]/20 rounded mt-2.5 mx-1 animate-pulse" />
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}

export default Carousal