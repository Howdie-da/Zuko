import React, { useEffect, useState } from 'react'
import Carousal from './Carousal'
import apiClient from '../services/api.js'

function Discover({
  onAnimeSelect
}) {
  const [search, setSearch] = useState("")

  const [discoverData, setDiscoverData] = useState(null)

  useEffect(() => {
    const fetchDiscoverFeeds = async () => {
      try {
        const response = await apiClient.get('/anime/discover')
        setDiscoverData(response.data.data)
      } catch (err) {
        console.error("Discover network fetch failed", err)
      }
    }

    fetchDiscoverFeeds()
  }, [])

  return (
    <div className="min-h-screen flex flex-col text-white pb-12">
      
      <header className="fixed top-0 z-50 w-full max-w-4xl left-0 right-0 mx-auto px-4 pt-6 pointer-events-none">
        <div className="w-full flex items-center justify-between pointer-events-auto bg-[#200800]/70 backdrop-blur-xl border border-[#A46A44]/20 rounded-2xl p-2.5 shadow-2xl transition-all duration-300">
          <div className="relative flex-1 flex items-center">
            <input 
              type="text"
              placeholder="SEARCH"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-7 pr-12 bg-[#200800]/40 border border-[#A46A44]/10 rounded-xl text-xs font-mono font-bold tracking-wider text-[#E6BD9E] placeholder-[#A46A44]/40 outline-none focus:border-[#A46A44]/50 focus:bg-[#200800]/80 focus:ring-2 focus:ring-[#A46A44]/10 transition-all uppercase"
            />
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="absolute right-4 text-[#A46A44]/60 hover:text-[#E6BD9E] transition-colors active:scale-90"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="min-h-35" />

      <Carousal title="Trending" list={discoverData?.trending} onAnimeSelect={onAnimeSelect} />
      <Carousal title="Action" list={discoverData?.action} onAnimeSelect={onAnimeSelect} />
      <Carousal title="Sci-Fi" list={discoverData?.scifi} onAnimeSelect={onAnimeSelect} />
      <Carousal title="Shounen" list={discoverData?.shounen} onAnimeSelect={onAnimeSelect} />
      <Carousal title="Seinen" list={discoverData?.seinen} onAnimeSelect={onAnimeSelect} />
      <Carousal title="Isekai" list={discoverData?.isekai} onAnimeSelect={onAnimeSelect} />

    </div>
  )
}

export default Discover