import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import apiClient from '../services/api.js'
import { edit } from '../services/animeService.js'
import { addAnimeToState, editAnimeInState } from '../store/animeSlice.js'

function AnimeDetails({ animeId, onClose }) {
  const dispatch = useDispatch()

  const [networkAnime, setNetworkAnime] = useState(null)
  const animeLists = useSelector(state => state.anime)
  const [isLoading, setIsLoading] = useState(false)
  
  const allAnime = [...animeLists.watching, ...animeLists.completed, ...animeLists.on_hold, ...animeLists.plan_to_watch, ...animeLists.dropped]
  const localTarget = allAnime.find(item => item.node.id === animeId)

  useEffect(() => {
    if (localTarget) {
      setNetworkAnime(null)
      setIsLoading(false)
      return
    }

    const fetchDetails = async () => {
      setIsLoading(true)
      try {
        const response = await apiClient.get(`/anime/anime?animeId=${animeId}`)
        if(response.data?.data) setNetworkAnime(response.data.data)
      } catch (error) {
        console.log("Failed to fetch anime details: ", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDetails()
  }, [animeId, localTarget])

  const target = localTarget?.node || networkAnime

  const isAuthenticated = useSelector(state => state.auth.isAuthenticated)

  const anime = {
    title: target?.title,
    image: target?.main_picture?.large || target?.main_picture?.medium || target?.images?.jpg?.large_image_url || target?.images?.jpg?.image_url,
    currentEp: target?.my_list_status?.num_episodes_watched || 0,
    totalEp: target?.num_episodes || target?.episodes || 0,
    score: target?.my_list_status?.score || 0,
    rating: target?.mean || target?.score ||  '?',
    status: target?.my_list_status?.status || target?.status || 'plan_to_watch',
    synopsis: target?.synopsis || "No synopsis is fetched.",
    airingStart: target?.start_date || target?.aired?.from?.split('T')?.[0] || "Unknown",

    airingEnd: target?.end_date || (target?.aired?.to ? target.aired.to.split('T')[0] : null) 
    ? (target?.end_date || target?.aired?.to?.split('T')[0])
    : (target?.my_list_status?.status === "completed" || target?.status === "Finished Airing")
      ? ("")
      : "Unfinished",

    broadcastDay: target?.broadcast?.day_of_the_week || target?.broadcast?.day || "N/A"
  }

  const progressPercent = anime.totalEp > 0 ? (anime.currentEp / anime.totalEp) * 100 : 0

  const [currEp, setCurrEp] = useState(anime.currentEp)
  const [currRating, setCurrRating] = useState(anime.score)
  const [currStatus, setCurrStatus] = useState(anime.status)

  const [activeEp, setActiveEp] = useState(false)
  const [activeRating, setActiveRating] = useState(false)
  const [activeStatus, setActiveStatus] = useState(false)

  useEffect(() => {
    setCurrEp(anime.currentEp)
    setCurrRating(anime.score)
    setCurrStatus(anime.status)
  }, [anime.currentEp, anime.score, anime.status])

  const backBuffer = anime.currentEp < 30 ? anime.currentEp : 10
  const forwardBuffer = 50

  const startEp = Math.max(0, anime.currentEp - backBuffer)
  const endEp = anime.totalEp > 0 
    ? Math.min(anime.totalEp, anime.currentEp + forwardBuffer) 
    : anime.currentEp + forwardBuffer

  const windowLength = (endEp - startEp) + 1

  const episodeOptions = Array.from({ length: windowLength }, (_, i) => startEp + i)
  const scoreOptions = Array.from({ length: 11}, (_, i) => i)
  const statusOptions = [
    { key: 'watching', label: 'Watching' },
    { key: 'completed', label: 'Completed' },
    { key: 'on_hold', label: 'On Hold' },
    { key: 'dropped', label: 'Dropped' },
    { key: 'plan_to_watch', label: 'Plan to Watch' }
  ]

  const inList = statusOptions.some((item) => item.key === anime.status)

  const [changes, setChanges] = useState(null)

  useEffect(() => {
    const updatedChanges = {}
    let hasChanged = false

    if (currEp !== anime.currentEp) {
      updatedChanges.episode = currEp
      hasChanged = true
    }
    if (currRating !== anime.score) {
      updatedChanges.score = currRating
      hasChanged = true
    }
    if (currStatus !== anime.status) {
      updatedChanges.status = currStatus
      hasChanged = true
    }

    if (hasChanged) {
      setChanges(updatedChanges)
    } else {
      setChanges(null)
    }
  }, [currEp, currRating, currStatus, anime.currentEp, anime.score, anime.status])

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!changes) return

    setIsSaving(true)
    try {
      const response = await edit(animeId, currEp, anime.totalEp, currRating, currStatus)

      if (response.status === 200 || response.data) {
        dispatch(editAnimeInState({
          animeId,
          updatedFields: {
            num_episodes_watched: currEp,
            score: currRating,
            status: currStatus
          }
        }))
        setActiveEp(false)
        setActiveRating(false)
        setActiveStatus(false)
        setChanges(null) 
      }
    } catch (error) {
      console.log("Critical error during synchronization mutation pipeline:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const [isAdding, setIsAdding] = useState(false)

  const addToProfile = async () => {
    setIsAdding(true)
    try {
      const response = await edit(animeId, currEp, anime.totalEp, currRating, "plan_to_watch")
      
      if (response.status === 200 || response.data) {
        dispatch(addAnimeToState({
        animeData: {
          id: animeId,
          title: anime.title,
          main_picture: {
            large: anime.image,
            medium: anime.image
          },
          synopsis: anime.synopsis,
          num_episodes: anime.totalEp,
          mean: anime.rating,
          airingStart: anime.airingStart,
          airingEnd: anime.airingEnd
        },
        updatedFields: {
          num_episodes_watched: currEp,
          score: currRating,
          status: "plan_to_watch"
        }
      }))
      }
    } catch (error) {
      console.log("Critical error during synchronization mutation pipeline:", error)
    } finally {
      setIsAdding(false)
    }
  }

  // ================= 🌟 CLEAN EARLY GUARD RETURN FOR LOADING SCREEN =================
  if (isLoading) {
    return (
      <div className="w-full text-white relative flex flex-col min-h-screen justify-center items-center bg-[#200800]">
        <div className="max-w-2xl w-full mx-auto px-4 flex flex-col space-y-6 animate-pulse">
          
          <div className="flex items-end space-x-5">
            <div className="w-28 sm:w-36 h-40 sm:h-52 shrink-0 bg-[#A46A44]/10 rounded-xl border border-[#A46A44]/20 shadow-xl" />
            <div className="flex-1 space-y-3 pb-2">
              <div className="h-6 w-3/4 bg-[#E6BD9E]/20 rounded-lg" />
              <div className="h-3 w-1/3 bg-[#A46A44]/20 rounded-md" />
            </div>
          </div>

          <div className="w-full h-24 bg-[#200800]/50 border border-[#A46A44]/10 rounded-2xl p-4 space-y-4">
            <div className="flex justify-between items-center">
              <div className="w-24 h-4 bg-[#A46A44]/20 rounded-md" />
              <div className="w-10 h-8 bg-[#A77510]/10 rounded-xl" />
            </div>
            <div className="w-full h-1.5 bg-[#200800] rounded-full overflow-hidden">
              <div className="w-1/3 h-full bg-[#A46A44]/20 rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 h-36 bg-[#200800]/30 border border-[#A46A44]/10 rounded-2xl p-4 space-y-2">
              <div className="w-16 h-3 bg-[#A46A44]/20 rounded-md" />
              <div className="w-full h-4 bg-[#E6BD9E]/10 rounded-md" />
              <div className="w-5/6 h-4 bg-[#E6BD9E]/10 rounded-md" />
            </div>
            <div className="h-20 bg-[#200800]/30 border border-[#A46A44]/10 rounded-2xl p-4" />
            <div className="h-20 bg-[#200800]/30 border border-[#A46A44]/10 rounded-2xl p-4" />
          </div>

        </div>
      </div>
    )
  }

  // ================= MAIN RENDER PANEL CANVAS =================
  return (
    <div className="w-full text-white relative flex flex-col animate-fade-in">

      {/* FULL BLEED SCREEN BACKDROP */}
      <div className="fixed inset-0 h-screen overflow-hidden z-10 select-none pointer-events-none">
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

          <div className="group text-xs flex items-center justify-center px-1 w-13 h-10 bg-[#200800]/80 backdrop-blur-md border border-[#A46A44]/30 rounded-xl text-[#A46A44] shadow-xl">
            <svg 
              className="w-3.5 h-3.5 mr-1 text-[#A77510] drop-shadow-[0_0_5px_rgba(167,117,16,0.6)]" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {anime.rating}
          </div>
        </div>
      </header>

      {/* CORE DETAILS CANVAS */}
      <div className="relative z-20 max-w-2xl w-full mx-auto px-4 pt-28 pb-12 flex flex-col">
        
        {/* PROFILES HEADER AXIS SPLIT */}
        <div className="flex items-end space-x-5">
          <div className="w-28 sm:w-36 shrink-0 shadow-[0_12px_30px_rgba(32,8,0,0.6)] rounded-xl overflow-hidden border border-[#A46A44]/30 bg-[#200800]">
            <img src={anime.image} className="w-full h-auto object-cover" alt={anime.title} />
          </div>
          
          <div className="flex-1 pb-2">
            <h1 className="text-lg sm:text-2xl font-black tracking-wide leading-tight text-[#E6BD9E] uppercase drop-shadow-md">
              {anime.title}
            </h1>
            
            <div className="text-[10px] font-mono tracking-widest text-[#A46A44] uppercase mt-1 flex items-center gap-1.5">
              <span>STATUS:</span> 
              {isAuthenticated && inList ? (
                <div className="relative inline-block text-left normal-case tracking-normal">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveStatus(!activeStatus)
                    }}
                    className={`px-2 py-0.5 rounded-md font-sans text-[11px] font-bold bg-[#200800]/60 text-gray-200 border border-linear transition-all cursor-pointer ${
                      activeStatus ? 'border-[#A77510]' : 'border-transparent'
                    }`}
                  >
                    {statusOptions.find(o => o.key === currStatus)?.label || currStatus?.replace?.(/_/g, ' ')}
                    <span className="ml-1 text-[8px] opacity-60">{activeStatus ? '▲' : '▼'}</span>
                  </button>

                  {activeStatus && (
                    <div className="absolute left-0 top-6 z-50 w-32 bg-[#200800] border border-[#A46A44]/40 rounded-xl shadow-2xl flex flex-col py-1 overflow-hidden animate-fade-in">
                      {statusOptions.map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => {
                            setCurrStatus(opt.key)
                            setActiveStatus(false)
                          }}
                          className={`w-full text-left px-3 py-1.5 text-[11px] font-sans font-medium transition-colors cursor-pointer ${
                            currStatus === opt.key 
                              ? 'bg-[#A77510]/20 text-[#E6BD9E] font-bold' 
                              : 'text-gray-400 hover:bg-[#A46A44]/10 hover:text-white'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-gray-300 font-bold">{anime.status.replace(/_/g, ' ')}</span>
              )}
            </div>
          </div>

          {/* Inline Changes Action Panel */}
          {isAuthenticated && inList && changes && (
            <button 
              disabled={isSaving}
              onClick={handleSave}
              className={`px-4 py-2 bg-[#A77510]/20 border border-[#A77510]/50 rounded-xl text-[10px] font-black tracking-widest text-[#E6BD9E] transition-all duration-300 shadow-lg shadow-[#A77510]/5 flex items-center gap-2 ${
                isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#A77510]/40 active:scale-95 cursor-pointer'
              }`}
            >
              {isSaving ? "SYNCING..." : "SAVE"}
            </button>
          )}
        </div>

        {/* TRACKING PROGRESS OVERLAY INTERACTION TRAY */}
        <div className="w-full bg-[#200800]/50 backdrop-blur-md border border-[#A46A44]/20 rounded-2xl p-4 mt-6 shadow-xl flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono tracking-widest text-[#A46A44] uppercase">EPISODE:</span>
              <div className="text-xl font-black font-mono tracking-wider mt-0.5 text-center text-white flex items-baseline">
                
                <div className="relative flex items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (inList) setActiveEp(!activeEp)
                    }}
                    className={`bg-[#200800]/60 text-[#E6BD9E] w-16 py-1 text-center font-mono font-bold rounded-lg border transition-all ${
                      activeEp ? 'border-[#A77510]' : 'border-transparent'
                    } ${!inList ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    {currEp}
                  </button>

                  {activeEp && inList && (
                    <div className="absolute left-0 top-9 z-50 w-16 max-h-36 overflow-y-auto bg-[#200800] border border-[#A46A44]/40 rounded-xl shadow-2xl flex flex-col py-1 scrollbar-none">
                      {episodeOptions.map((ep) => (
                        <button
                          key={ep}
                          onClick={() => {
                            setCurrEp(ep)
                            setActiveEp(false)
                          }}
                          className="z-50 w-full text-center py-1 text-[11px] font-mono hover:bg-[#A46A44]/20 text-[#E6BD9E] hover:text-white transition-colors cursor-pointer"
                        >
                          {ep}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <span className="ml-1.5 text-xs text-[#A46A44]">/ {anime.totalEp || '??'}</span>
              </div>
            </div>
            
            {isAuthenticated && (
              <>
                {inList ? (
                  <button 
                    onClick={() => setActiveEp(!activeEp)}
                    className="px-4 py-2 bg-[#A77510]/20 hover:bg-[#A77510]/30 active:scale-95 border border-[#A77510]/40 rounded-xl text-[10px] font-black tracking-widest text-[#E6BD9E] transition-all duration-300 cursor-pointer shadow-lg shadow-[#A77510]/5"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-[#A46A44] group-hover:text-[#E6BD9E] transition-colors">
                      <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                  </button>
                ) : (
                  <button 
                    disabled={isAdding}
                    onClick={addToProfile}
                    className={`px-4 py-2 bg-[#A77510]/20 border border-[#A77510]/40 rounded-xl text-[10px] font-black tracking-widest text-[#E6BD9E] transition-all duration-300 shadow-lg shadow-[#A77510]/5 ${
                      isAdding ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#A77510]/30 active:scale-95 cursor-pointer'
                    }`}
                  >
                    {isAdding ? "ADDING..." : "ADD TO PROFILE"}
                  </button>
                )}
              </>
            )}
          </div>

          <div className="w-full h-1.5 bg-[#200800] rounded-full overflow-hidden border border-[#A46A44]/10">
            <div 
              className="h-full bg-linear-to-r from-[#A77510] to-[#E6BD9E] shadow-[0_0_12px_#A77510] transition-all duration-500 ease-out" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* ASYMMETRIC SPEC MODULAR DATA GRID */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="col-span-2 bg-[#200800]/30 border border-[#A46A44]/10 rounded-2xl p-4 flex flex-col space-y-2">
            <h3 className="text-[10px] font-mono tracking-widest text-[#A46A44] uppercase font-black">SYNOPSIS</h3>
            <p className="text-xs text-[#E6BD9E]/80 leading-relaxed font-normal font-sans max-h-48 overflow-y-auto scrollbar-none pr-1">
              {anime.synopsis}
            </p>
          </div>

          <div className="bg-[#200800]/30 border border-[#A46A44]/10 rounded-2xl p-4 flex flex-col justify-center">
            <span className="text-[10px] font-mono tracking-widest text-[#A46A44] uppercase block">SCORE:</span>
            <div className="flex justify-between items-baseline space-x-1 mt-1">
              <div className='flex items-baseline'>
                <div className="relative flex items-center mt-1">
                  <button
                    disabled={!activeRating || !inList}
                    onClick={() => setActiveRating(!activeRating)}
                    className={`bg-[#200800]/60 text-2xl font-black font-mono text-[#A77510] w-12 py-0.5 text-center rounded-lg border transition-all ${
                      activeRating ? 'border-[#A77510]' : 'border-transparent'
                    }`}
                  >
                    {currRating === 0 ? '-' : currRating}
                  </button>

                  {activeRating && inList && (
                    <div className="absolute left-0 bottom-11 origin-bottom z-50 w-12 max-h-36 overflow-y-auto bg-[#200800] border border-[#A46A44]/40 rounded-xl shadow-2xl flex flex-col py-1 scrollbar-none">
                      {scoreOptions.map((score) => (
                        <button
                          key={score}
                          onClick={() => {
                            setCurrRating(score)
                            setActiveRating(false)
                          }}
                          className="w-full text-center py-1 text-[11px] font-mono hover:bg-[#A46A44]/20 text-[#A77510] hover:text-white transition-colors cursor-pointer"
                        >
                          {score === 0 ? '-' : score}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="ml-1.5 text-[9px] font-mono text-[#A46A44]">/ 10</span>
              </div>
              {isAuthenticated && inList && (
                <button 
                  onClick={() => setActiveRating(!activeRating)}
                  className="px-4 py-2 bg-[#A77510]/20 hover:bg-[#A77510]/30 active:scale-95 border border-[#A77510]/40 rounded-xl text-[10px] font-black tracking-widest text-[#E6BD9E] transition-all duration-300 cursor-pointer shadow-lg shadow-[#A77510]/5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-[#A46A44] group-hover:text-[#E6BD9E] transition-colors">
                    <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="bg-[#200800]/30 border border-[#A46A44]/10 rounded-2xl p-4 flex flex-col">
            <span className="text-[10px] font-mono tracking-widest text-[#A46A44] uppercase block">AIRING INTERVAL:</span>
            <span className="text-xs font-bold font-mono text-gray-200 mt-2 uppercase tracking-wide">
              {anime.airingStart} {anime.airingEnd ? '-' : ''} <br/> {anime.airingEnd}
            </span>
          </div>
        </div>

      </div>
    </div>
  )
}

export default AnimeDetails