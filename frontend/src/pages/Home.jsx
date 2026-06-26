import React, { useEffect, useState } from 'react'
import { Button2 } from '../components'
import zuko1 from '../assets/zuko1.jpg'
import { loginHandle } from '../services/authService'
import apiClient from '../services/api'
import { useDispatch, useSelector } from 'react-redux'
import { setCreds } from '../store/authSlice'

function Home() {
  const dispatch = useDispatch()
  
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated)

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

  return (
    <div className='relative min-h-screen w-full bg-[#200800] overflow-hidden flex flex-col justify-between items-center font-sans'>
      
      {/* mix-blend-luminosity is the magic */}
      <div 
        className='absolute inset-0 bg-cover bg-center z-0 mix-blend-luminosity opacity-40'
        style={{ backgroundImage: `url(${zuko1})` }}
      />

      {/* this line adds a filter to background image */}
      <div className='absolute inset-0 bg-linear-to-b from-[#200800]/60 via-[#441100]/40 to-[#200800] z-0' />

      <header className='relative z-10 w-full max-w-7xl px-8 py-6 flex justify-between items-center'>
        <div className='text-xl font-bold tracking-wider text-[#A77510]'>
          ZUKO.
        </div>
        <nav className='hidden md:flex space-x-8 text-sm font-medium text-[#E6BD9E]/70'>
          <a href='#features' className='hover:text-[#A77510] transition-colors'>Features</a>
          <a href='#docs' className='hover:text-[#A77510] transition-colors'>API</a>
          <a href='#login' className='hover:text-[#A77510] transition-colors'>Login</a>
        </nav>
      </header>

      {/* adds a layer wiht z-axis = 10 for Interactive Content */}
      <main className='relative z-10 flex flex-col items-center text-center max-w-3xl px-4 my-auto space-y-8 rounded-3xl'>
        
        <h1 className='text-7xl md:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-linear-to-b from-[#E6BD9E] via-[#C85213] to-[#A46A44] drop-shadow-[0_4px_12px_rgba(32,8,0,0.8)]'>
          Zuko
        </h1>

        <p className='text-lg md:text-xl font-medium text-[#E6BD9E]/80 max-w-xl leading-relaxed drop-shadow-md'>
          Track your personal MyAnimeList catalog seamlessly with a streamlined, high-velocity interface.
        </p>

        <div className='pt-4'>
          <Button2 onClick={isAuthenticated ? null : loginHandle}>
            {isAuthenticated ? "Connected" : "Get Started"}
          </Button2>
        </div>

      </main>

      <footer className='relative z-10 w-full h-24 bg-linear-to-t from-[#200800] to-transparent flex items-center justify-center text-xs text-[#A46A44]/50'>
        © 2026 Zuko App. All Rights Reserved.
      </footer>

    </div>
  )
}

export default Home