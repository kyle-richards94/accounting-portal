'use client'

import { AppBar, Toolbar, Typography, Button, Box, Container, IconButton, Tooltip } from '@mui/material'
import {
  Dashboard as DashboardIcon,
  ReceiptLong as ReceiptLongIcon,
  Description as DescriptionIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  AccountBalance as AccountBalanceIcon,
  People as PeopleIcon,
} from '@mui/icons-material'
import { useRouter, usePathname } from 'next/navigation'
import { clearSession } from '@/lib/auth'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    clearSession()
    router.push('/login')
  }

  const navItems = [
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { label: 'Invoices', icon: <ReceiptLongIcon />, path: '/invoices' },
    { label: 'Estimates', icon: <DescriptionIcon />, path: '/estimates' },
    { label: 'Clients', icon: <PeopleIcon />, path: '/clients' },
    { label: 'BAS', icon: <SettingsIcon />, path: '/bas' },
    { label: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ]

  const isActive = (path: string) => {
    if (path === '/dashboard') return pathname === path
    return pathname?.startsWith(path)
  }

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: 70 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <AccountBalanceIcon sx={{ fontSize: 32, mr: 1.5, color: 'white' }} />
            <Typography
              variant="h5"
              component="div"
              sx={{
                fontWeight: 700,
                letterSpacing: '0.5px',
                background: 'linear-gradient(45deg, #FFFFFF 30%, #90CAF9 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Accounting Portal
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                color="inherit"
                onClick={() => router.push(item.path)}
                startIcon={item.icon}
                sx={{
                  px: 2.5,
                  py: 1,
                  borderRadius: 2,
                  fontWeight: 500,
                  color: isActive(item.path) ? 'white' : 'rgba(255, 255, 255, 0.85)',
                  backgroundColor: isActive(item.path)
                    ? 'rgba(255, 255, 255, 0.15)'
                    : 'transparent',
                  backdropFilter: isActive(item.path) ? 'blur(10px)' : 'none',
                  border: isActive(item.path) ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                {item.label}
              </Button>
            ))}

            <Box sx={{ ml: 1, borderLeft: '1px solid rgba(255, 255, 255, 0.2)', pl: 2 }}>
              <Tooltip title="Logout" arrow>
                <IconButton
                  color="inherit"
                  onClick={handleLogout}
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
