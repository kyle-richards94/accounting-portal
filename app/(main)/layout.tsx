'use client'

import { Box } from '@mui/material'
import Navbar from '@/components/Navbar'
import AuthGuard from '@/components/AuthGuard'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <Box sx={{ flexGrow: 1 }}>
        <Navbar />
        <Box component="main" sx={{ p: 3 }}>
          {children}
        </Box>
      </Box>
    </AuthGuard>
  )
}

