import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { deleteAnimeFromState, editAnimeInState } from '../store/animeSlice'
import { edit, deleteAnime } from '../services/animeService.js'

function Card({ 
  anime, 
  onAnimeSelect, 
  menuAnime, 
  setMenuAnime,
  setDeletingAnime
}) {
  const dispatch = useDispatch()
  const totalEpisodes = anime.totalEp || 1
  const progressPercent = Math.min((anime.currentEp / totalEpisodes) * 100, 100)

  const isMenuOpen = String(menuAnime) === String(anime.id)

  const handleMenuToggle = (e) => {
    e.stopPropagation()
    if (isMenuOpen) {
      setMenuAnime(null)
    } else {
      setMenuAnime(`${anime.id}`)
    }
  }

  const plusOne = async (e) => {
    e.stopPropagation()
    try {
      const nextEps = anime.totalEp > 0 ? Math.min(anime.currentEp + 1, anime.totalEp) : anime.currentEp + 1
      const nextStatus = (anime.totalEp > 0 && nextEps === anime.totalEp) ? 'completed' : 'watching'

      await edit(anime.id, nextEps, anime.totalEp, anime.rating, nextStatus)

      dispatch(editAnimeInState({
        animeId: anime.id,
        updatedFields: {
          num_episodes_watched: nextEps,
          status: nextStatus
        }
      }))

      setMenuAnime("")
    } catch (err) {
      console.log("In-place state update failure:", err)
    }
  }

  const deleteEntry = async () => {
    const animeId = anime.id

    try {
      const response = await deleteAnime(animeId)

      dispatch(deleteAnimeFromState({ animeId }))
    } catch (error) {
      console.log("Could not delete the entry!!")
    }
  }

  const isAuthenticated = useSelector(state => state.auth.isAuthenticated)

  return (
    <div 
    onClick={() => onAnimeSelect(anime.id)}
    className='w-full h-22.5 bg-[#200800]/50 border border-[#A46A44]/15 rounded-xl overflow-hidden flex shadow-md hover:border-[#A77510]/30 transition-all duration-200 group select-none'>
      
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

      <div className='grow p-2.5 flex flex-col justify-between relative min-w-0'>
        
        <div className='flex justify-between items-start space-x-2'>
          <div className='min-w-0 flex-1'>
            <h4 className='font-bold text-sm text-[#E6BD9E] leading-tight truncate group-hover:text-white transition-colors'>
              {anime.title || "Unknown Title"}
            </h4>
          </div>
          
          {!isMenuOpen ? (
            <button 
              onClick={handleMenuToggle}
              className='text-[#A46A44] hover:text-[#E6BD9E] transition-colors font-bold text-sm px-1.5 py-0.5 cursor-pointer active:scale-90'
            >
              ⋮
            </button>
          ) : (
            <div 
              onClick={(e) => e.stopPropagation()}
              className='flex h-8 items-center space-x-1.5 bg-[#200800]/90 border border-[#A46A44]/30 rounded-xl px-2 py-1 animate-fade-in'
            >
              
              <button 
                onClick={(e) => { e.stopPropagation(); onAnimeSelect(anime.id); setMenuAnime(""); }}
                className='text-[10px] font-mono font-bold tracking-wider text-[#E6BD9E] hover:text-white px-1.5 py-0.5 uppercase cursor-pointer'
              >
                Open
              </button>
              
              {isAuthenticated && (
                <>
                <button 
                  onClick={plusOne}
                  className='text-[10px] font-mono font-black tracking-wider text-[#A77510] hover:text-white px-1.5 py-0.5 uppercase cursor-pointer'
                >
                  +1
                </button>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); setDeletingAnime(anime); }}
                  className='text-[10px] font-mono font-bold tracking-wider text-rose-500 hover:text-rose-400 px-1.5 py-0.5 uppercase cursor-pointer'
                >
                  Delete
                </button>
                </>
              )}
              
              <button 
                onClick={(e) => { e.stopPropagation(); setMenuAnime(""); }}
                className='text-[10px] font-mono font-bold tracking-wider text-[#A46A44] hover:text-[#E6BD9E] px-1.5 py-0.5 uppercase cursor-pointer'
              >
                Close
              </button>
            </div>
          )}

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