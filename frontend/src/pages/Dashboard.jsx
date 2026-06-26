import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import apiClient from '../services/api'
import { setList } from '../store/animeSlice'
import { Card } from '../components/index.js'

function Dashboard() {
  const dispatch = useDispatch()
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated)
  
  // 1. Fixed Case Strategy: Synchronized tab IDs with your exact lowercase Redux slice keys!
  const [activeTab, setActiveTab] = useState('watching') 

  useEffect(() => {
    const fetchUserCatalog = async () => {
      try {
        // Guard check added to prevent race conditions on page refresh
        if (!isAuthenticated) return 

        const response = await apiClient.get('/anime/my-list')
        if (response.data) {
          console.log(response.data)
          dispatch(setList(response.data))
        }
      } catch (error) {
        console.log("Unable to fetch anime list ", error)
      }
    }
    fetchUserCatalog()
  }, [isAuthenticated, dispatch])

  // 2. Extract lists straight out of global store
  const animeLists = useSelector(state => state.anime)
  
  // 3. Dynamic Lookup: Instantly selects the correct array on every single tab update!
  const activeListToRender = animeLists[activeTab] || []

  const tabs = [
    { id: 'watching', label: 'WATCHING', activeClass: 'bg-[#A77510]/15 border-[#A77510]/40 text-[#A77510] shadow-[0_0_15px_rgba(167,117,16,0.15)]'},
    { id: 'plan_to_watch', label: 'PLAN TO WATCH', activeClass: 'bg-gray-50/10 border-gray-50/30 text-gray-50'},
    { id: 'on_hold', label: 'ON HOLD', activeClass: 'bg-amber-600/10 border-amber-600/30 text-amber-500'},
    { id: 'completed', label: 'COMPLETED', activeClass: 'bg-emerald-600/10 border-emerald-600/30 text-emerald-500'},
    { id: 'dropped', label: 'DROPPED', activeClass: 'bg-rose-600/10 border-rose-600/30 text-rose-500'},
  ]

  // --- Array Boundary Index Arithmetic ---
  const currentIndex = tabs.findIndex(t => t.id === activeTab)
  const nextIndex = currentIndex === tabs.length - 1 ? 0 : currentIndex + 1
  const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1

  // --- Touch Vector Engine Event Handlers ---
  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX)
    setCurrentX(0)
  }

  const handleTouchMove = (e) => {
    setCurrentX(e.touches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (currentX === 0) return

    const deltaX = startX - currentX
    const threshold = 60

    if (deltaX > threshold) {
      setActiveTab(tabs[nextIndex].id)
    } else if (deltaX < -threshold) {
      setActiveTab(tabs[prevIndex].id)
    }
  }

  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className='min-h-screen bg-[#571e0b] relative select-none overflow-x-hidden pb-16'
    >
      <div className='absolute inset-0 bg-linear-to-b from-[#200800]/60 via-[#441100]/40 to-[#200800] z-0' />

      <header className="sticky top-0 z-50 w-full max-w-4xl mx-auto px-6 pt-6 pointer-events-none">
        <div className="w-full flex items-center justify-center pointer-events-auto">

          {/* 1. DESKTOP / TABLET MULTI-CHIP VIEW */}
          <nav className="hidden sm:flex items-center overflow-x-auto scrollbar-none space-x-2 max-w-[85%] py-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-1.5 text-[10px] font-black tracking-widest rounded-full border transition-all duration-300 cursor-pointer ${
                    isActive
                      ? tab.activeClass
                      : 'bg-[#200800]/40 border-[#A46A44]/10 text-[#A46A44]/50 hover:text-[#E6BD9E]/80 hover:border-[#A46A44]/30'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </nav>

          {/* 2. MOBILE SINGLE COMPACT PILL VIEW */}
          <div className="flex sm:hidden items-center justify-between w-full max-w-65 bg-[#200800]/80 backdrop-blur-md border border-[#A46A44]/20 rounded-full px-4 py-1.5 shadow-lg">
            <button 
              onClick={() => setActiveTab(tabs[prevIndex].id)}
              className="text-[#A46A44] hover:text-[#E6BD9E] font-black text-xs px-2 py-1 transition-colors cursor-pointer"
            >
              {"<"}
            </button>
            
            <span className={`px-4 py-1 text-[10px] font-black tracking-widest rounded-full border text-center min-w-35 select-none transition-all duration-300 ${tabs[currentIndex].activeClass}`}>
              {tabs[currentIndex].label}
            </span>

            <button 
              onClick={() => setActiveTab(tabs[nextIndex].id)}
              className="text-[#A46A44] hover:text-[#E6BD9E] font-black text-xs px-2 py-1 transition-colors cursor-pointer"
            >
              {">"}
            </button>
          </div>

        </div>
      </header>

      {/* 3. CORE DYNAMIC CONTENT REGION */}
      <main className="z-10 max-w-2xl mx-auto px-4 mt-8 flex flex-col space-y-3 justify-center">
        {activeListToRender.length === 0 ? (
          <div className='w-full border border-dashed border-[#A46A44]/20 rounded-2xl py-16 flex flex-col items-center justify-center text-center'>
            <p className='text-[#A46A44] text-xs font-medium uppercase tracking-wider'>
              No entries logged under {activeTab.replace(/_/g, ' ')}
            </p>
          </div>
        ) : (
          // Map directly through the selected array list cache 
          activeListToRender.map((item) => {
            // Reformat MAL data wrapper structure slightly to feed clean props to card component
            const formattedAnime = {
              id: item.node.id,
              title: item.node.title,
              image: item.node.main_picture?.medium,
              currentEp: item.node.my_list_status.num_episodes_watched,
              totalEp: item.node.num_episodes,
              rating: item.node.my_list_status.score,
              airingPeriod: ""
            }
            return <Card key={formattedAnime.id} anime={formattedAnime} />
          })
        )}
      </main>
    </div>
  )
}

export default Dashboard