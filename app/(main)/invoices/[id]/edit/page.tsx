'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Invoice, LineItem, Client } from '@/lib/types'
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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material'
import LineItems from '@/components/LineItems'

export default function EditInvoicePage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const [invoice, setInvoice] = useState<Invoice | null>(null)
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
      const { data } = await supabase.from('invoices').select('*').eq('id', id).single()
      setInvoice(data as Invoice)
    } catch (e) {
      console.error('Failed to load invoice', e)
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
    if (!invoice) return
    setSelectedClient(client)
    if (client) {
      setInvoice({
        ...invoice,
        client_name: client.name,
        client_address: client.address || '',
      })
    }
  }

  const calculateDueDate = (invoiceDate: string, paymentTerms: string): string => {
    if (!invoiceDate) return ''
    const date = new Date(invoiceDate)
    
    switch (paymentTerms) {
      case 'net_15':
        date.setDate(date.getDate() + 15)
        break
      case 'net_30':
        date.setDate(date.getDate() + 30)
        break
      default:
        return invoice?.due_date || ''
    }
    
    return date.toISOString().split('T')[0]
  }

  const handlePaymentTermsChange = (terms: 'net_15' | 'net_30' | 'custom') => {
    if (!invoice) return
    const newDueDate = terms === 'custom' ? invoice.due_date : calculateDueDate(invoice.date || '', terms)
    setInvoice({ ...invoice, payment_terms: terms, due_date: newDueDate })
  }

  const handleDateChange = (newDate: string) => {
    if (!invoice) return
    const newDueDate = invoice.payment_terms && invoice.payment_terms !== 'custom'
      ? calculateDueDate(newDate, invoice.payment_terms)
      : invoice.due_date
    setInvoice({ ...invoice, date: newDate, due_date: newDueDate })
  }

  const handleLineItemsChange = (items: LineItem[]) => {
    if (!invoice) return
    const subtotal = items.reduce((sum, item) => (sum + (item.quantity || 0) * (item.unit_price || 0)), 0)
    const gst = items.filter(i => i.gst).reduce((sum, i) => sum + (i.quantity || 0) * (i.unit_price || 0) * 0.1, 0)
    const total = subtotal + gst
    setInvoice({ ...invoice, line_items: items, subtotal, gst, total })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!invoice) return
    setSaving(true)
    setError('')

    if (!invoice.invoice_number || !invoice.client_name) {
      setError('Please fill in all required fields')
      setSaving(false)
      return
    }

    try {
      const { error: updErr } = await supabase
        .from('invoices')
        .update({
          invoice_number: invoice.invoice_number,
          date: invoice.date,
          client_name: invoice.client_name,
          client_address: invoice.client_address,
          due_date: invoice.due_date,
          payment_terms: invoice.payment_terms,
          line_items: invoice.line_items,
          subtotal: invoice.subtotal,
          gst: invoice.gst,
          total: invoice.total,
          status: invoice.status,
        })
        .eq('id', id)

      if (updErr) throw updErr
      router.push(`/invoices/${id}`)
    } catch (e) {
      console.error('Update failed', e)
      setError('Failed to save invoice')
      setSaving(false)
    }
  }

  if (!invoice) {
    return (
      <Container maxWidth="lg">
        <Typography>Loading...</Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Edit Invoice
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
                label="Invoice Number"
                value={invoice.invoice_number}
                onChange={(e) => setInvoice({ ...invoice, invoice_number: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="date"
                label="Invoice Date"
                value={invoice.date}
                onChange={(e) => handleDateChange(e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="payment-terms-label">Payment Terms</InputLabel>
                <Select
                  labelId="payment-terms-label"
                  value={invoice.payment_terms || 'custom'}
                  onChange={(e) => handlePaymentTermsChange(e.target.value as 'net_15' | 'net_30' | 'custom')}
                  label="Payment Terms"
                >
                  <MenuItem value="net_15">Net 15 (15 days)</MenuItem>
                  <MenuItem value="net_30">Net 30 (30 days)</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="date"
                label="Due Date"
                value={invoice.due_date}
                onChange={(e) => setInvoice({ ...invoice, due_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                disabled={invoice.payment_terms !== 'custom'}
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
                value={invoice.client_name}
                onChange={(e) => setInvoice({ ...invoice, client_name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Client Address"
                value={invoice.client_address}
                onChange={(e) => setInvoice({ ...invoice, client_address: e.target.value })}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <LineItems items={invoice.line_items} onChange={handleLineItemsChange} />
        </Paper>

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button variant="contained" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button variant="outlined" onClick={() => router.push(`/invoices/${id}`)}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Container>
  )
}


