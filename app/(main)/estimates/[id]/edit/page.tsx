'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Estimate, LineItem, Client } from '@/lib/types'
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  Box,
  Grid,
  Autocomplete,
} from '@mui/material'
import LineItems from '@/components/LineItems'

export default function EditEstimatePage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const [estimate, setEstimate] = useState<Estimate | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  useEffect(() => {
    if (!id) return
    load()
    loadClients()
  }, [id])

  const load = async () => {
    try {
      const { data } = await supabase.from('estimates').select('*').eq('id', id).single()
      setEstimate(data as Estimate)
    } catch (e) {
      console.error('Failed to load estimate', e)
    }
  }

  const loadClients = async () => {
    try {
      const { data } = await supabase
        .from('clients')
        .select('*')
        .order('name', { ascending: true })
      
      setClients(data || [])
    } catch (error) {
      console.error('Error loading clients:', error)
    }
  }

  const handleClientSelect = (client: Client | null) => {
    if (!estimate) return
    setSelectedClient(client)
    if (client) {
      setEstimate({
        ...estimate,
        client_name: client.name,
        client_address: client.address || '',
      })
    }
  }

  const handleLineItemsChange = (items: LineItem[]) => {
    if (!estimate) return
    const subtotal = items.reduce((sum, item) => (sum + (item.quantity || 0) * (item.unit_price || 0)), 0)
    const gst = items.filter(i => i.gst).reduce((sum, i) => sum + (i.quantity || 0) * (i.unit_price || 0) * 0.1, 0)
    const total = subtotal + gst
    setEstimate({ ...estimate, line_items: items, subtotal, gst, total })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!estimate) return
    setSaving(true)
    setError('')

    if (!estimate.estimate_number || !estimate.client_name) {
      setError('Please fill in all required fields')
      setSaving(false)
      return
    }

    try {
      const { error: updErr } = await supabase
        .from('estimates')
        .update({
          estimate_number: estimate.estimate_number,
          date: estimate.date,
          client_name: estimate.client_name,
          client_address: estimate.client_address,
          expiry_date: estimate.expiry_date,
          line_items: estimate.line_items,
          subtotal: estimate.subtotal,
          gst: estimate.gst,
          total: estimate.total,
          status: estimate.status,
        })
        .eq('id', id)

      if (updErr) throw updErr
      router.push(`/estimates/${id}`)
    } catch (e) {
      console.error('Update failed', e)
      setError('Failed to save estimate')
      setSaving(false)
    }
  }

  if (!estimate) {
    return (
      <Container maxWidth="lg">
        <Typography>Loading...</Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Edit Estimate
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Estimate Number"
                value={estimate.estimate_number}
                onChange={(e) => setEstimate({ ...estimate, estimate_number: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="date"
                label="Estimate Date"
                value={estimate.date}
                onChange={(e) => setEstimate({ ...estimate, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="date"
                label="Expiry Date"
                value={estimate.expiry_date}
                onChange={(e) => setEstimate({ ...estimate, expiry_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                options={clients}
                getOptionLabel={(option) => option.name}
                value={selectedClient}
                onChange={(_, newValue) => handleClientSelect(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Select Existing Client (Optional)" />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Client Name"
                value={estimate.client_name}
                onChange={(e) => setEstimate({ ...estimate, client_name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Client Address"
                value={estimate.client_address}
                onChange={(e) => setEstimate({ ...estimate, client_address: e.target.value })}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <LineItems items={estimate.line_items} onChange={handleLineItemsChange} />
        </Paper>

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button variant="contained" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button variant="outlined" onClick={() => router.push(`/estimates/${id}`)}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Container>
  )
}


