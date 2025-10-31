'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Container,
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Avatar,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material'
import {
  AccountBalance as AccountBalanceIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
} from '@mui/icons-material'
import { HARDCODED_USERNAME, HARDCODED_PASSWORD, setSession } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState(HARDCODED_USERNAME)
  const [password, setPassword] = useState(HARDCODED_PASSWORD)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (username === HARDCODED_USERNAME && password === HARDCODED_PASSWORD) {
      setSession(username)
      router.push('/dashboard')
    } else {
      setError('Invalid username or password')
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 50%, #01579B 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
        },
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            p: 5,
            width: '100%',
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                margin: '0 auto',
                mb: 2,
                background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
                boxShadow: '0px 8px 16px rgba(21, 101, 192, 0.3)',
              }}
            >
              <AccountBalanceIcon sx={{ fontSize: 48 }} />
            </Avatar>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              Accounting Portal
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem' }}>
              Secure access to your financial dashboard
            </Typography>
          </Box>

          <Divider sx={{ mb: 4 }} />

          <Box component="form" onSubmit={handleLogin}>
            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  '& .MuiAlert-icon': {
                    fontSize: 24,
                  },
                }}
              >
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
              required
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                    borderWidth: 2,
                  },
                  '&.Mui-focused fieldset': {
                    borderWidth: 2,
                  },
                },
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                    borderWidth: 2,
                  },
                  '&.Mui-focused fieldset': {
                    borderWidth: 2,
                  },
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              endIcon={<LoginIcon />}
              sx={{
                py: 1.75,
                fontSize: '1.125rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
                boxShadow: '0px 8px 16px rgba(21, 101, 192, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0D47A1 0%, #01579B 100%)',
                  boxShadow: '0px 12px 24px rgba(21, 101, 192, 0.4)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Sign In
            </Button>

            <Box
              sx={{
                mt: 3,
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(3, 155, 229, 0.08)',
                border: '1px solid',
                borderColor: 'rgba(3, 155, 229, 0.2)',
              }}
            >
              <Typography variant="caption" color="text.secondary" display="block" align="center">
                Demo Credentials
              </Typography>
              <Typography
                variant="body2"
                align="center"
                sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'primary.main', mt: 0.5 }}
              >
                Username: {HARDCODED_USERNAME} | Password: {HARDCODED_PASSWORD}
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Typography
          variant="body2"
          align="center"
          sx={{
            mt: 3,
            color: 'rgba(255, 255, 255, 0.9)',
            textShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
          }}
        >
          Powered by Modern Accounting Solutions
        </Typography>
      </Container>
    </Box>
  )
}
