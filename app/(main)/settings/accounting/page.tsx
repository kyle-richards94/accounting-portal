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
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import { supabase } from '@/lib/supabase'
import { CompanySettings } from '@/lib/types'

export default function AccountingSettingsPage() {
  const [settings, setSettings] = useState<Partial<CompanySettings>>({
    invoice_notes: '',
    estimate_notes: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [useSameNotes, setUseSameNotes] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  useEffect(() => {
    if (useSameNotes) {
      setSettings(prev => ({ ...prev, invoice_notes: prev.estimate_notes }))
    }
  }, [settings.estimate_notes, useSameNotes])

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('invoice_notes, estimate_notes')
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setSettings({
          invoice_notes: data.invoice_notes || '',
          estimate_notes: data.estimate_notes || '',
        })
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
      // Get the existing ID first
      const { data: existing } = await supabase
        .from('company_settings')
        .select('id')
        .single()

      const updateData = {
        invoice_notes: settings.invoice_notes,
        estimate_notes: settings.estimate_notes,
        ...(existing?.id && { id: existing.id }),
      }

      const { error } = await supabase
        .from('company_settings')
        .upsert(updateData, { onConflict: 'id' })

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
        Accounting Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure notes that appear on your invoice and estimate PDFs
      </Typography>

      <Paper sx={{ p: 3 }}>
        {message && (
          <Alert severity={message.type} sx={{ mb: 3 }}>
            {message.text}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h6" gutterBottom>
            PDF Notes
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            These notes appear at the bottom of PDF documents
          </Typography>

          <TextField
            fullWidth
            label="Estimate Notes"
            value={settings.estimate_notes}
            onChange={(e) => setSettings({ ...settings, estimate_notes: e.target.value })}
            margin="normal"
            multiline
            minRows={4}
            placeholder="Notes shown at the bottom of estimate PDFs"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={useSameNotes}
                onChange={(e) => {
                  setUseSameNotes(e.target.checked)
                  if (e.target.checked) {
                    setSettings({ ...settings, invoice_notes: settings.estimate_notes })
                  }
                }}
              />
            }
            label="Use the same notes as Estimate"
            sx={{ mt: 2, mb: 2 }}
          />

          <TextField
            fullWidth
            label="Invoice Notes"
            value={settings.invoice_notes}
            onChange={(e) => {
              setSettings({ ...settings, invoice_notes: e.target.value })
              setUseSameNotes(false)
            }}
            margin="normal"
            multiline
            minRows={4}
            placeholder="Notes shown at the bottom of invoice PDFs"
            disabled={useSameNotes}
          />

          <Button
            type="submit"
            variant="contained"
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

