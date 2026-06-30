import React, { useEffect, useState } from 'react'
import apiClient from '../services/api.js'
import { useSelector, useDispatch } from 'react-redux'
import { loadProfile } from '../store/statsSlice.js'

function Stats() {
  const dispatch = useDispatch()

  const cachedProfile = useSelector(state => state.stats.profile)

  const [profile, setProfile] = useState(cachedProfile)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if(cachedProfile){
      setIsLoading(false)
      return
    }

    const fetchUserStats = async () => {
      try {
        setIsLoading(true)
        const response = await apiClient.get('/user/stats')
        if (response.data?.data) {
          dispatch(loadProfile(response.data?.data))
          setProfile(response.data.data)
        }
      } catch (error) {
        console.error("Failed to sync client transmission logs:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUserStats()
  }, [])

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#100300] text-[#A46A44] font-mono text-xs tracking-widest animate-pulse">
        LOADING ACCOUNT MANIFESTS...
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#100300] text-[#A46A44] font-mono text-xs tracking-widest">
        CRITICAL ERROR: ACCESS LOGS DEGRADED
      </div>
    )
  }

  const stats = profile.anime_statistics || {}
  const joinedDate = profile.joined_at ? new Date(profile.joined_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'N/A'

  return (
    <div className="w-full backdrop-blur-md  max-w-4xl mx-auto px-4 pt-6 pb-28 text-white min-h-screen animate-fade-in">
      
      <div className="w-full bg-[#200800]/40 border border-[#A46A44]/25 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-xl mb-8">
        <div className="w-24 h-24 rounded-full border-2 border-[#A77510] overflow-hidden bg-[#100300] shadow-[0_0_15px_rgba(167,117,16,0.2)] shrink-0">
          <img 
            src={profile.picture || 'https://via.placeholder.com/150'} 
            alt={profile.name} 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="text-center sm:text-left flex-1">
          <h1 className="text-2xl font-black font-sans tracking-tight text-[#E6BD9E] mb-1">
            {profile.name}
          </h1>
          <p className="text-xs font-mono text-[#A46A44] tracking-widest uppercase mb-3">
            ID: // {profile.id}
          </p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs font-mono text-gray-400">
            <span>JOINED: <span className="text-[#E6BD9E]">{joinedDate}</span></span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#200800]/20 border border-[#A46A44]/15 rounded-xl p-4 flex flex-col items-center justify-center min-h-24 text-center">
          <span className="text-[10px] font-mono tracking-widest text-[#A46A44] font-bold uppercase mb-1">Days Watched</span>
          <span className="text-2xl font-mono font-black text-[#A77510]">{(stats.num_days_watched + stats.num_days_watching + stats.num_days_on_hold + stats.num_days_dropped)?.toFixed(1)}</span>
        </div>
        
        <div className="bg-[#200800]/20 border border-[#A46A44]/15 rounded-xl p-4 flex flex-col items-center justify-center min-h-24 text-center">
          <span className="text-[10px] font-mono tracking-widest text-[#A46A44] font-bold uppercase mb-1">Episodes Tracked</span>
          <span className="text-2xl font-mono font-black text-[#E6BD9E]">{stats.num_episodes || '0'}</span>
        </div>

        <div className="bg-[#200800]/20 border border-[#A46A44]/15 rounded-xl p-4 flex flex-col items-center justify-center min-h-24 text-center">
          <span className="text-[10px] font-mono tracking-widest text-[#A46A44] font-bold uppercase mb-1">Mean Score</span>
          <span className="text-2xl font-mono font-black text-[#A77510]">{stats.mean_score?.toFixed(2) || '0.00'}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Watching', count: stats.num_items_watching, color: 'text-[#A77510]' },
          { label: 'Plan To Watch', count: stats.num_items_plan_to_watch, color: 'text-gray-100' },
          { label: 'On Hold', count: stats.num_items_on_hold, color: 'text-amber-500' },
          { label: 'Completed', count: stats.num_items_completed, color: 'text-emerald-500' },
          { label: 'Dropped', count: stats.num_items_dropped, color: 'text-rose-500' },
          { label: 'Rewatch', count: stats.num_times_rewatched, color: 'text-gray-400' }
        ].map((item, idx) => (
          <div 
            key={idx}
            className="bg-[#200800]/40 border border-[#A46A44]/10 p-3.5 rounded-xl flex flex-col justify-between min-h-20"
          >
            <span className="text-[9px] font-mono tracking-wider font-bold text-gray-400 uppercase">
              {item.label}
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className={`text-xl font-mono font-black ${item.color}`}>
                {item.count || '0'}
              </span>
              <span className="text-[18px] font-mono text-[#A46A44]/40 font-bold">
                {(((item.count || 0) / (stats.num_items || 1)) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default Stats