'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { Box, CircularProgress } from '@mui/material'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    setMounted(true)
    const authStatus = isAuthenticated()
    setAuthenticated(authStatus)
    
    if (!authStatus) {
      router.push('/login')
    }
  }, [router])

  if (!mounted) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!authenticated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return <>{children}</>
}

