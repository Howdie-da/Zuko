import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router'

function AuthLayout({ children, authentication = true }) {
  const navigate = useNavigate()
  const [loader, setLoader] = useState(true)
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated)

  useEffect(() => {
    if (!authentication && isAuthenticated) {
      navigate('/dashboard')
    }
    
    setLoader(false)
  }, [isAuthenticated, authentication, navigate])

  return loader ? null : <>{children}</>
}

export default AuthLayout