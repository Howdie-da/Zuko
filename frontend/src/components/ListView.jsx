import React, { useMemo, useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Card from './Card'
import { setListScrollPosition } from '../store/animeSlice'
import Button2 from './Button2'
import { loginHandle } from '../services/authService'
import { setCreds } from '../store/authSlice'; 

import { useWindowVirtualizer } from '@tanstack/react-virtual'

const tabs = [
  { id: 'watching', label: 'WATCHING', activeClass: 'bg-[#A77510]/15 border-[#A77510]/40 text-[#A77510] shadow-[0_0_15px_rgba(167,117,16,0.15)]'},
  { id: 'plan_to_watch', label: 'PLAN TO WATCH', activeClass: 'bg-gray-100/10 border-gray-100/30 text-gray-100'},
  { id: 'on_hold', label: 'ON HOLD', activeClass: 'bg-amber-600/10 border-amber-600/30 text-amber-500'},
  { id: 'completed', label: 'COMPLETED', activeClass: 'bg-emerald-600/10 border-emerald-600/30 text-emerald-500'},
  { id: 'dropped', label: 'DROPPED', activeClass: 'bg-rose-600/10 border-rose-600/30 text-rose-500'},
]

function ListView({
  onAnimeSelect,
  activeTab,
  setActiveTab,
  setDeletingAnime
}) {

  const dispatch = useDispatch()
  const scrollPosition = useSelector(state => state.anime.listScrollPosition)
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated)

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
      dispatch(setListScrollPosition(currentScrollRef.current))
    }
  }, [dispatch])

  // 2. Safely grab the segmented lists from global Redux cache
  const animeLists = useSelector(state => state.anime)
  const activeListToRender = animeLists[activeTab] || []

  // 3. Sub-tab metadata config array

  // 4. Horizontal tracking arithmetic for swiping
  const currentIndex = tabs.findIndex(t => t.id === activeTab)
  const nextIndex = currentIndex === tabs.length - 1 ? 0 : currentIndex + 1
  const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1

  // 5. Encapsulated Touch Vector Engine States & Event Hooks
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)

  const handleTouchStart = (e) => { setStartX(e.touches[0].clientX); setCurrentX(0); }
  const handleTouchMove = (e) => { setCurrentX(e.touches[0].clientX); }
  const handleTouchEnd = () => {
    if (currentX === 0) return
    const deltaX = startX - currentX
    const threshold = 60
    if (deltaX > threshold) setActiveTab(tabs[nextIndex].id)
    else if (deltaX < -threshold) setActiveTab(tabs[prevIndex].id)
  }

  const formattedAnimeList = useMemo(() => {
    return activeListToRender.map((item) => ({
      id: item.node.id,
      title: item.node.title,
      image: item.node.main_picture?.medium,
      currentEp: item.node.my_list_status.num_episodes_watched,
      totalEp: item.node.num_episodes,
      rating: item.node.my_list_status.score,
    }))
  }, [activeListToRender])

  const [menuAnime, setMenuAnime] = useState("")

  const listRef = useRef(null)

  const virtualizer = useWindowVirtualizer({
    count: formattedAnimeList.length,
    estimateSize: () => 150,
    overscan: 20,
    scrollMargin: listRef.current?.offsetTop ?? 0
  })

  const handleAuthClick = () => {
    loginHandle((userData) => dispatch(setCreds({ user: userData })))
  }

  return (
    <div 
      onTouchStart={handleTouchStart} 
      onTouchMove={handleTouchMove} 
      onTouchEnd={handleTouchEnd} 
      className="w-full min-h-[calc(100dvh-5rem)] flex flex-col relative select-none overflow-x-hidden"
    >
      {/* FLOATING SUB-HEADER BAR */}
      <header className="fixed top-0 z-50 w-full max-w-4xl left-0 right-0 mx-auto px-6 pt-6 pointer-events-none">
        <div className="w-full flex items-center justify-center pointer-events-auto bg-[#200800]/60 backdrop-blur-md border border-[#A46A44]/20 rounded-2xl py-4 shadow-xl">
          
          {/* DESKTOP/TABLET HORIZONTAL NAV CHIPS */}
          <nav className="hidden sm:flex items-center space-x-2 max-w-[85%] py-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 text-[10px] font-black tracking-widest rounded-full border transition-all duration-300 cursor-pointer ${
                  activeTab === tab.id ? tab.activeClass : 'bg-[#200800]/40 border-[#A46A44]/10 text-[#A46A44]/50 hover:text-[#E6BD9E]/80 hover:border-[#A46A44]/30'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* MOBILE SINGLE COMPACT PILL */}
          <div className="flex sm:hidden items-center justify-between w-full max-w-65 px-4">
            <button onClick={() => setActiveTab(tabs[prevIndex].id)} className="text-[#A46A44] font-black text-xs px-2 cursor-pointer hover:text-[#E6BD9E]">{"<"}</button>
            <span className={`px-4 py-1 text-[10px] font-black tracking-widest rounded-full border text-center min-w-35 select-none transition-all duration-300 ${tabs[currentIndex].activeClass}`}>
              {tabs[currentIndex].label}
            </span>
            <button onClick={() => setActiveTab(tabs[nextIndex].id)} className="text-[#A46A44] font-black text-xs px-2 cursor-pointer hover:text-[#E6BD9E]">{">"}</button>
          </div>
        </div>
      </header>

      {/* CORE CARDS WRAPPER PANE */}
      <main 
        ref={listRef} 
        className="z-10 max-w-2xl w-full mx-auto px-4 mt-18 relative pb-32"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {activeListToRender.length === 0 ? (
          <div className='w-full border border-dashed border-[#A46A44]/20 rounded-2xl mt-20 py-16 text-center'>
            <p className='text-[#A46A44] mb-6 text-xs font-medium uppercase tracking-wider'>
              No entries logged under {activeTab.replace(/_/g, ' ')}
            </p>
            {!isAuthenticated && (
              <Button2
              onClick={handleAuthClick}
              >
                Login
              </Button2>
            )}
          </div>
        ) : (
          virtualizer.getVirtualItems().map((virtualItem) => {
            const anime = formattedAnimeList[virtualItem.index]
            
            return (
              <div 
                key={anime.id}
                data-index={virtualItem.index} 
                ref={virtualizer.measureElement}
                className="absolute top-0 left-0 w-full px-4"
                style={{
                  transform: `translateY(${virtualItem.start}px)`
                }}
              >
                <div className="cursor-pointer active:scale-[0.99] transition-transform will-change-transform pb-4">
                  <Card 
                    anime={anime} 
                    menuAnime={menuAnime} 
                    setMenuAnime={setMenuAnime} 
                    onAnimeSelect={onAnimeSelect} 
                    setDeletingAnime={setDeletingAnime}
                  />
                </div>
              </div>
            )
          })
        )}
      </main>
    </div>
  )
}

export default ListView