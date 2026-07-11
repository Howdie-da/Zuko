import { useEffect } from 'react'
import './App.css'
import { Outlet } from "react-router"
import { useDispatch, useSelector } from 'react-redux'
import { setCreds } from './store/authSlice'
import { getProfile } from './services/authService'

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await getProfile()

        console.log("User Data at App.jsx: ", response)

        if (response) {
          dispatch(setCreds({user: response}))
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
