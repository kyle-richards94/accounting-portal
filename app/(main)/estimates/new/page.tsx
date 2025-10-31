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
  Grid,
  Autocomplete,
} from '@mui/material'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Estimate, LineItem, Client } from '@/lib/types'
import LineItems from '@/components/LineItems'
import { v4 as uuidv4 } from 'uuid'

export default function NewEstimatePage() {
  const router = useRouter()
  const [estimate, setEstimate] = useState<Partial<Estimate>>({
    estimate_number: '',
    date: new Date().toISOString().split('T')[0],
    client_name: '',
    client_address: '',
    expiry_date: '',
    line_items: [],
    subtotal: 0,
    gst: 0,
    total: 0,
    status: 'draft',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  const handleLineItemsChange = (items: LineItem[]) => {
    const subtotal = items.reduce((sum, item) => {
      const quantity = item.quantity || 0
      const unitPrice = item.unit_price || 0
      return sum + quantity * unitPrice
    }, 0)

    const gstAmount = items
      .filter((item) => item.gst)
      .reduce((sum, item) => {
        const quantity = item.quantity || 0
        const unitPrice = item.unit_price || 0
        return sum + quantity * unitPrice * 0.1
      }, 0)

    setEstimate({
      ...estimate,
      line_items: items,
      subtotal,
      gst: gstAmount,
      total: subtotal + gstAmount,
    })
  }

  const handleGenerateEstimateNumber = async () => {
    try {
      const { data } = await supabase
        .from('estimates')
        .select('estimate_number')
        .order('estimate_number', { ascending: false })

      // Extract all estimate numbers and find the highest one
      const numbers = data?.map(est => {
        const match = est.estimate_number.match(/EST-(\d+)/)
        return match ? parseInt(match[1]) : 0
      }) || [0]

      const maxNumber = Math.max(...numbers, 0)
      const nextNumber = `EST-${(maxNumber + 1).toString().padStart(4, '0')}`

      setEstimate({ ...estimate, estimate_number: nextNumber })
    } catch (error) {
      console.error('Error generating estimate number:', error)
    }
  }

  useEffect(() => {
    handleGenerateEstimateNumber()
    loadClients()
  }, [])

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
    setSelectedClient(client)
    if (client) {
      setEstimate({
        ...estimate,
        client_name: client.name,
        client_address: client.address || '',
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    if (!estimate.estimate_number || !estimate.client_name || !estimate.date || !estimate.expiry_date) {
      setError('Please fill in all required fields (dates, client, number)')
      setSaving(false)
      return
    }

    if (!estimate.line_items || estimate.line_items.length === 0) {
      setError('Please add at least one line item')
      setSaving(false)
      return
    }

    try {
      const { error: insertError } = await supabase
        .from('estimates')
        .insert([estimate])

      if (insertError) throw insertError

      router.push('/estimates')
    } catch (error) {
      console.error('Error creating estimate:', error)
      setError('Failed to create estimate')
      setSaving(false)
    }
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Create New Estimate
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
                onChange={(e) =>
                  setEstimate({ ...estimate, estimate_number: e.target.value })
                }
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
                onChange={(e) =>
                  setEstimate({ ...estimate, client_name: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Client Address"
                value={estimate.client_address}
                onChange={(e) =>
                  setEstimate({ ...estimate, client_address: e.target.value })
                }
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <LineItems
            items={estimate.line_items || []}
            onChange={handleLineItemsChange}
          />
        </Paper>

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            type="submit"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Create Estimate'}
          </Button>
          <Button variant="outlined" onClick={() => router.push('/estimates')}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Container>
  )
}
