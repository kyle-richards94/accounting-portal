'use client'

import { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  Box,
} from '@mui/material'
import { supabase } from '@/lib/supabase'
import { CompanySettings } from '@/lib/types'

export default function SettingsPage() {
  const [settings, setSettings] = useState<CompanySettings>({
    company_name: '',
    abn: '',
    address: '',
    phone: '',
    email: '',
    bank_bsb: '',
    bank_account: '',
    bank_account_name: '',
    notes: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setSettings(data)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      setMessage({ type: 'error', text: 'Failed to load settings' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('company_settings')
        .upsert(settings, { onConflict: 'id' })

      if (error) throw error

      setMessage({ type: 'success', text: 'Settings saved successfully' })
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Container maxWidth="md">
        <Typography>Loading...</Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Company Settings
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        {message && (
          <Alert severity={message.type} sx={{ mb: 3 }}>
            {message.text}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Company Name"
            value={settings.company_name}
            onChange={(e) =>
              setSettings({ ...settings, company_name: e.target.value })
            }
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="ABN"
            value={settings.abn}
            onChange={(e) => setSettings({ ...settings, abn: e.target.value })}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Address"
            value={settings.address}
            onChange={(e) =>
              setSettings({ ...settings, address: e.target.value })
            }
            margin="normal"
            required
            multiline
            rows={3}
          />

          <TextField
            fullWidth
            label="Phone"
            value={settings.phone}
            onChange={(e) =>
              setSettings({ ...settings, phone: e.target.value })
            }
            margin="normal"
          />

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={settings.email}
            onChange={(e) =>
              setSettings({ ...settings, email: e.target.value })
            }
            margin="normal"
          />

          <TextField
            fullWidth
            label="Bank BSB"
            value={settings.bank_bsb}
            onChange={(e) => setSettings({ ...settings, bank_bsb: e.target.value })}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Bank Account Number"
            value={settings.bank_account}
            onChange={(e) => setSettings({ ...settings, bank_account: e.target.value })}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Bank Account Name"
            value={settings.bank_account_name}
            onChange={(e) => setSettings({ ...settings, bank_account_name: e.target.value })}
            margin="normal"
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3 }}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}

