import { useEffect } from 'react'
import './App.css'
import { Outlet } from "react-router"
import { useDispatch, useSelector } from 'react-redux'
import apiClient from './services/api'
import { setCreds } from './store/authSlice'

function App() {
  const dispatch = useDispatch()

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
    <div>
      <Outlet/>
    </div>
  )
}

export default App
