import React, { useEffect, useRef } from 'react'
import Carousal from './Carousal'
import { useDispatch, useSelector } from 'react-redux'
import { setDiscoverData } from '../store/discoverSlice.js'
import { setDiscoverScrollPosition } from '../store/animeSlice.js'
import SearchCard from './SearchCard.jsx'
import { getDiscover, searchAnime } from '../services/animeService.js'

function Discover({
  onAnimeSelect,
  search,
  setSearch,
  searchResults,
  setSearchResults,
  searching,
  setSearching
}) {
  const dispatch = useDispatch()
  const scrollPosition = useSelector(state => state.anime.discoverScrollPosition)
  
  const currentScrollRef = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      currentScrollRef.current = window.scrollY
    }
    window.addEventListener('scroll', handleScroll)

    const timer = setTimeout(() => {
      window.scrollTo(0, scrollPosition)
    }, 15)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(timer)
      dispatch(setDiscoverScrollPosition(currentScrollRef.current))
    }
  }, [dispatch])

  const {feeds, lastFetched} = useSelector(state => state.discover)

  useEffect(() => {
    if(feeds) return

    const fetchDiscoverFeeds = async () => {
      try {
        const response = await getDiscover()
        dispatch(setDiscoverData(response))
      } catch (err) {
        console.error("Discover network fetch failed", err)
      }
    }

    fetchDiscoverFeeds()
  }, [])

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([])
      setSearching(false)
      return
    }

    setSearching(true)

    const delayDebounce = setTimeout(async () => {
      try {
        const response = await searchAnime(search)
        if(response) setSearchResults(response)
      } catch (error) {
        console.log("Cannot find: ", error)
      } finally {
        setSearching(false)
      }
    }, 400)

    return () => clearTimeout(delayDebounce)
  }, [search, setSearching, setSearchResults])

  const discoverData = feeds

  return (
    <div className={`min-h-screen flex flex-col text-white pb-12 ${search ? 'h-screen overflow-hidden' : ''}`}>
      
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

      {search && (
        <div className="fixed inset-0 z-40 w-full max-w-4xl mx-auto px-4 pb-24 overflow-y-auto scrollbar-none backdrop-blur-xl bg-[#200800]/40 border-t border-[#A46A44]/10 animate-fade-in">
          <div className="w-full pt-6 top-32">

            <div className="min-h-25" />

            {searchResults.length > 0 ? (
              <div className="">
                {searchResults.map((anime) => (
                  <SearchCard 
                    key={anime.mal_id} 
                    anime={anime} 
                    onClick={onAnimeSelect} 
                  />
                ))}
              </div>
            ) : (
              !searching && (
                <div className="text-center font-mono text-xs text-[#A46A44] py-24 uppercase tracking-widest">
                  No matches.
                </div>
              )
            )}
          </div>
        </div>
      )}
      
    </div>
  )
}

export default Discover