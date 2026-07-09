import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import apiClient from '../services/api.js'
import { deleteAnimeFromState, setList } from '../store/animeSlice.js'
import { AnimeDetails, Card, Discover, ListView, Schedule, Stats, Dialog } from '../components/index.js'
import { deleteAnime } from '../services/animeService.js'

function Dashboard() {
  const dispatch = useDispatch()
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated)

  const [activeTab, setActiveTab] = useState('watching')
  const [selectedAnimeId, setSelectedAnimeId] = useState(null)

  const [search, setSearch] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await apiClient.get('auth/me')

        if (response.data) {
          dispatch(setCreds({user: response.data}))
        }
      } catch (error) {
        console.log("No active secure session found.")
      }
    }

    initializeAuth()
  }, [])
  
  useEffect(() => {
    const fetchUserCatalog = async () => {
      try {
        if (!isAuthenticated) return 
        
        const response = await apiClient.get('/anime/my-list')
        if (response.data) {
          dispatch(setList(response.data))
        }
      } catch (error) {
        console.log("Unable to fetch anime list ", error)
      }
    }
    fetchUserCatalog()
  }, [isAuthenticated, dispatch])
  
  const screens = [
    { id: 'list', comp: ListView },
    { id: 'discover', comp: Discover },
    { id: 'schedule', comp: Schedule },
    { id: 'stats', comp: Stats },
  ]
  
  const [deletingAnime, setDeletingAnime] = useState(null)

  useEffect(() => {
    if (deletingAnime) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [deletingAnime])

  const handleDeleteConfirm = async () => {
    if (!deletingAnime) return
    
    const animeId = deletingAnime.id
    try {
      await deleteAnime(animeId)
      dispatch(deleteAnimeFromState({ animeId }))
      
      setDeletingAnime(null) 
    } catch (error) {
      console.error("Could not delete the entry!!", error)
    }
  }

  const [onScreen, setOnScreen] = useState('list')

  return (
    <div className='bg-[#571e0b] min-h-screen relative select-none overflow-x-hidden'>
      <div className='fixed top-[-10vh] left-0 w-full h-[120vh] bg-linear-to-b from-[#200800]/60 via-[#441100]/40 to-[#200800] z-0 pointer-events-none' />

      
        <Dialog
        isOpen={Boolean(deletingAnime)}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingAnime(null)}
        message={"Do you want to Delete?"}
        animeName={deletingAnime?.title}
        option1={"Yes"}
        option2={"No"}
        />
      

      {selectedAnimeId ? (
        <AnimeDetails 
          animeId={selectedAnimeId} 
          onClose={() => setSelectedAnimeId(null)} 
        />
      ) : (
        screens.map((items) => {
          const ComponentToRender = items.comp
          return items.id === onScreen ? (
            <ComponentToRender 
            key={items.id} 

            onAnimeSelect={setSelectedAnimeId}

            activeTab={activeTab}
            setActiveTab={setActiveTab} 

            search={search}
            setSearch={setSearch}
            searchResults={searchResults}
            setSearchResults={setSearchResults}
            searching={searching}
            setSearching={setSearching}
            
            setDeletingAnime={setDeletingAnime}
            />
          ) : null
        })
      )}

      {!selectedAnimeId && (
        <footer className="fixed bottom-0 z-50 w-full max-w-4xl left-0 right-0 mx-auto px-6 pt-6 bg-[#200800]/60 backdrop-blur-xl border border-[#A46A44]/20 rounded-2xl py-4 shadow-xl">
          <div className='w-full flex items-center justify-between pointer-events-auto text-gray-200 px-3'>
          
            <button 
              className='flex flex-col items-center justify-center cursor-pointer hover:text-[#E6BD9E]' 
              onClick={() => setOnScreen("list")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
              <span className="mt-1 text-[9px] font-black tracking-widest font-mono uppercase opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                List
              </span>
            </button>

            <button 
              className='flex flex-col items-center justify-center cursor-pointer hover:text-[#E6BD9E]'
              onClick={() => setOnScreen("discover")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="mt-1 text-[9px] font-black tracking-widest font-mono uppercase opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                Discover
              </span>
            </button>

            <button 
              className='flex flex-col items-center justify-center cursor-pointer hover:text-[#E6BD9E]'
              onClick={() => setOnScreen("schedule")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="mt-1 text-[9px] font-black tracking-widest font-mono uppercase opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                Schedule
              </span>
            </button>

            <button
              className='flex flex-col items-center justify-center cursor-pointer hover:text-[#E6BD9E]'
              onClick={() => setOnScreen("stats")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="mt-1 text-[9px] font-black tracking-widest font-mono uppercase opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                Stats
              </span>
            </button>
              
          </div>
        </footer>
      )}
      
    </div>
  )
}

export default Dashboard