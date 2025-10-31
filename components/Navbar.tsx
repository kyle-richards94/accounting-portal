'use client'

import { useState, MouseEvent } from 'react'
import { AppBar, Toolbar, Typography, Button, Box, Container, IconButton, Tooltip, Menu, MenuItem } from '@mui/material'
import {
  Dashboard as DashboardIcon,
  ReceiptLong as ReceiptLongIcon,
  Description as DescriptionIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  AccountBalance as AccountBalanceIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material'
import { useRouter, usePathname } from 'next/navigation'
import { clearSession } from '@/lib/auth'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [accountingMenuAnchor, setAccountingMenuAnchor] = useState<null | HTMLElement>(null)
  const [settingsMenuAnchor, setSettingsMenuAnchor] = useState<null | HTMLElement>(null)

  const handleLogout = () => {
    clearSession()
    router.push('/login')
  }

  const handleAccountingMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setAccountingMenuAnchor(event.currentTarget)
  }

  const handleAccountingMenuClose = () => {
    setAccountingMenuAnchor(null)
  }

  const handleSettingsMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setSettingsMenuAnchor(event.currentTarget)
  }

  const handleSettingsMenuClose = () => {
    setSettingsMenuAnchor(null)
  }

  const navigateTo = (path: string) => {
    router.push(path)
    handleAccountingMenuClose()
    handleSettingsMenuClose()
  }

  const isActive = (path: string) => {
    if (path === '/dashboard') return pathname === path
    return pathname?.startsWith(path)
  }

  const isAccountingActive = () => {
    return pathname?.startsWith('/invoices') || pathname?.startsWith('/estimates') || pathname?.startsWith('/bas')
  }

  const isSettingsActive = () => {
    return pathname?.startsWith('/settings') || pathname?.startsWith('/clients')
  }

  const isAccountingSettingsActive = () => {
    return pathname?.startsWith('/settings/accounting')
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
            {/* Dashboard */}
            <Button
              color="inherit"
              onClick={() => router.push('/dashboard')}
              startIcon={<DashboardIcon />}
              sx={{
                px: 2.5,
                py: 1,
                borderRadius: 2,
                fontWeight: 500,
                color: isActive('/dashboard') ? 'white' : 'rgba(255, 255, 255, 0.85)',
                backgroundColor: isActive('/dashboard')
                  ? 'rgba(255, 255, 255, 0.15)'
                  : 'transparent',
                backdropFilter: isActive('/dashboard') ? 'blur(10px)' : 'none',
                border: isActive('/dashboard') ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Dashboard
            </Button>

            {/* Accounting Dropdown */}
            <Button
              color="inherit"
              onClick={handleAccountingMenuOpen}
              endIcon={<ArrowDownIcon />}
              sx={{
                px: 2.5,
                py: 1,
                borderRadius: 2,
                fontWeight: 500,
                color: isAccountingActive() ? 'white' : 'rgba(255, 255, 255, 0.85)',
                backgroundColor: isAccountingActive()
                  ? 'rgba(255, 255, 255, 0.15)'
                  : 'transparent',
                backdropFilter: isAccountingActive() ? 'blur(10px)' : 'none',
                border: isAccountingActive() ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Accounting
            </Button>
            <Menu
              anchorEl={accountingMenuAnchor}
              open={Boolean(accountingMenuAnchor)}
              onClose={handleAccountingMenuClose}
              sx={{ mt: 1 }}
            >
              <MenuItem onClick={() => navigateTo('/invoices')}>
                <ReceiptLongIcon sx={{ mr: 1, fontSize: 20 }} />
                Invoices
              </MenuItem>
              <MenuItem onClick={() => navigateTo('/estimates')}>
                <DescriptionIcon sx={{ mr: 1, fontSize: 20 }} />
                Estimates
              </MenuItem>
              <MenuItem onClick={() => navigateTo('/bas')}>
                <AssessmentIcon sx={{ mr: 1, fontSize: 20 }} />
                BAS Report
              </MenuItem>
            </Menu>

            {/* Settings Dropdown */}
            <Button
              color="inherit"
              onClick={handleSettingsMenuOpen}
              startIcon={<SettingsIcon />}
              endIcon={<ArrowDownIcon />}
              sx={{
                px: 2.5,
                py: 1,
                borderRadius: 2,
                fontWeight: 500,
                color: isSettingsActive() ? 'white' : 'rgba(255, 255, 255, 0.85)',
                backgroundColor: isSettingsActive()
                  ? 'rgba(255, 255, 255, 0.15)'
                  : 'transparent',
                backdropFilter: isSettingsActive() ? 'blur(10px)' : 'none',
                border: isSettingsActive() ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Settings
            </Button>
            <Menu
              anchorEl={settingsMenuAnchor}
              open={Boolean(settingsMenuAnchor)}
              onClose={handleSettingsMenuClose}
              sx={{ mt: 1 }}
            >
              <MenuItem onClick={() => navigateTo('/settings')}>
                <SettingsIcon sx={{ mr: 1, fontSize: 20 }} />
                Company
              </MenuItem>
              <MenuItem onClick={() => navigateTo('/settings/accounting')}>
                <AssessmentIcon sx={{ mr: 1, fontSize: 20 }} />
                Accounting
              </MenuItem>
              <MenuItem onClick={() => navigateTo('/clients')}>
                <PeopleIcon sx={{ mr: 1, fontSize: 20 }} />
                Clients
              </MenuItem>
            </Menu>

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
