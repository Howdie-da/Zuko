import React, { useEffect, useState } from 'react'
import apiClient from '../services/api.js'
import ScheduleCard from './ScheduleCard.jsx'
import { useSelector, useDispatch } from 'react-redux'
import { loadSchedule } from '../store/scheduleSlice.js'

const getCurrentSeason = () => {
  const month = new Date().getMonth();
  if (month >= 0 && month <= 2) return 'WINTER';
  if (month >= 3 && month <= 5) return 'SPRING';
  if (month >= 6 && month <= 8) return 'SUMMER';
  return 'FALL';
};

const currYear = new Date().getFullYear()
const currSeason = getCurrentSeason()

function Schedule({ onAnimeSelect }) {
  const dispatch = useDispatch()

  const cachedList = useSelector(state => state.schedule.animeList)

  const [year, setYear] = useState(currYear)
  const [season, setSeason] = useState(currSeason)
  
  const [animeList, setAnimeList] = useState(cachedList)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (cachedList.length > 0 && year === currYear && season === currSeason) {
      setAnimeList(cachedList)
      setIsLoading(false)
      return
    }
    const fetchAnime = async () => {
      try {
        setIsLoading(true)

        const response = await apiClient.get(`/anime/schedule?year=${year}&season=${season}`)
        
        const data = response.data?.data
        const results = data?.results || []
        
        if(year === currYear && season === currSeason) dispatch(loadSchedule(results))
        setAnimeList(results)
      } catch (error) {
        console.log("Failed to fetch seasonal anime:", error)
        setAnimeList([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchAnime()
  }, [year, season])

  const yearOptions = Array.from({ length: 11 }, (_, i) => currYear - 10 + i)
  const seasonOptions = [
    { key: "WINTER", label: "Winter" },
    { key: "SPRING", label: "Spring" },
    { key: "SUMMER", label: "Summer" },
    { key: "AUTUMN", label: "Autumn" },
  ]

  const [yearDD, setYearDD] = useState(false)
  const [seasonDD, setSeasonDD] = useState(false)

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.filter-group')) {
        setYearDD(false)
        setSeasonDD(false)
      }
    }
    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [])

  useEffect(() => {
    if (yearDD || seasonDD) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [yearDD, seasonDD])

  if (isLoading) {
    return (
      <div className="w-full min-h-dvh flex items-center justify-center bg-[#100300] text-[#A46A44] font-mono text-xs animate-pulse">
        SYNCING SEASONAL ARCHIVE...
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pt-6 pb-28 text-white min-h-screen">
      
      <div className="flex justify-center items-center mb-8 relative">
        <div className="filter-group flex bg-[#200800]/60 border border-[#A46A44]/20 rounded-xl p-1 shadow-2xl relative">
          
          <button
            onClick={() => { setSeasonDD(false); setYearDD(!yearDD); }}
            className="px-4 py-1.5 text-[18px] font-black font-mono tracking-widest text-[#E6BD9E] hover:bg-[#A46A44]/10 rounded-lg transition-all"
          >
            {year}
          </button>

          {yearDD && (
            <div className="absolute left-0 top-14 z-50 w-20 max-h-48 overflow-y-auto bg-[#200800] border border-[#A46A44]/40 rounded-xl shadow-2xl flex flex-col py-1 scrollbar-none">
              {yearOptions.map((y) => (
                <button
                  key={y}
                  onClick={() => { setYear(y); setYearDD(false); }}
                  className={`w-full text-center py-1.5 text-[12px] font-mono hover:bg-[#A46A44]/20 transition-colors ${year === y ? 'text-[#A77510] font-bold' : 'text-[#E6BD9E]'}`}
                >
                  {y}
                </button>
              ))}
            </div>
          )}

          <div className="w-px h-6 bg-[#A46A44]/30 self-center" />

          <button
            onClick={() => { setYearDD(false); setSeasonDD(!seasonDD); }}
            className="px-4 py-1.5 text-[18px] font-black font-mono tracking-widest text-[#E6BD9E] hover:bg-[#A46A44]/10 rounded-lg transition-all"
          >
            {season}
          </button>

          {seasonDD && (
            <div className="absolute right-0 top-14 z-50 w-24 max-h-48 overflow-y-auto bg-[#200800] border border-[#A46A44]/40 rounded-xl shadow-2xl flex flex-col py-1 scrollbar-none">
              {seasonOptions.map((s) => (
                <button
                  key={s.key}
                  onClick={() => { setSeason(s.key); setSeasonDD(false); }}
                  className={`w-full text-center py-1.5 text-[12px] font-mono hover:bg-[#A46A44]/20 transition-colors ${season === s.key ? 'text-[#A77510] font-bold' : 'text-[#E6BD9E]'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {animeList.length === 0 ? (
        <div className="w-full py-20 text-center text-xs font-mono tracking-widest text-[#A46A44]/60 border border-dashed border-[#A46A44]/15 rounded-2xl bg-[#200800]/10 mt-4">
          NO ANIME FOUND FOR THIS PERIOD
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 animate-fade-in">
          {animeList.map((anime) => (
            <ScheduleCard 
              key={anime.id}
              anime={{
                ...anime,
                localBroadcastDay: 'SEASONAL',
                localBroadcastTime: anime.status || 'N/A',
                airingEpisode: anime.releasedEp,
              }}
              onAnimeSelect={onAnimeSelect} 
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Schedule