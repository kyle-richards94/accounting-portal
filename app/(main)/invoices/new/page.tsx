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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Autocomplete,
} from '@mui/material'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Invoice, LineItem, Client } from '@/lib/types'
import LineItems from '@/components/LineItems'
import { v4 as uuidv4 } from 'uuid'

export default function NewInvoicePage() {
  const router = useRouter()
  const [invoice, setInvoice] = useState<Partial<Invoice>>({
    invoice_number: '',
    date: new Date().toISOString().split('T')[0],
    client_name: '',
    client_address: '',
    due_date: '',
    payment_terms: 'custom',
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

    setInvoice({
      ...invoice,
      line_items: items,
      subtotal,
      gst: gstAmount,
      total: subtotal + gstAmount,
    })
  }

  const handleGenerateInvoiceNumber = async () => {
    try {
      const { data } = await supabase
        .from('invoices')
        .select('invoice_number')
        .order('invoice_number', { ascending: false })

      // Extract all invoice numbers and find the highest one
      const numbers = data?.map(inv => {
        const match = inv.invoice_number.match(/INV-(\d+)/)
        return match ? parseInt(match[1]) : 0
      }) || [0]

      const maxNumber = Math.max(...numbers, 0)
      const nextNumber = `INV-${(maxNumber + 1).toString().padStart(4, '0')}`

      setInvoice({ ...invoice, invoice_number: nextNumber })
    } catch (error) {
      console.error('Error generating invoice number:', error)
    }
  }

  useEffect(() => {
    handleGenerateInvoiceNumber()
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
        return invoice.due_date || ''
    }
    
    return date.toISOString().split('T')[0]
  }

  const handlePaymentTermsChange = (terms: 'net_15' | 'net_30' | 'custom') => {
    const newDueDate = terms === 'custom' ? invoice.due_date : calculateDueDate(invoice.date || '', terms)
    setInvoice({ ...invoice, payment_terms: terms, due_date: newDueDate })
  }

  const handleDateChange = (newDate: string) => {
    const newDueDate = invoice.payment_terms && invoice.payment_terms !== 'custom'
      ? calculateDueDate(newDate, invoice.payment_terms)
      : invoice.due_date
    setInvoice({ ...invoice, date: newDate, due_date: newDueDate })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    if (!invoice.invoice_number || !invoice.client_name || !invoice.date || !invoice.due_date) {
      setError('Please fill in all required fields (dates, client, number)')
      setSaving(false)
      return
    }

    if (!invoice.line_items || invoice.line_items.length === 0) {
      setError('Please add at least one line item')
      setSaving(false)
      return
    }

    try {
      const { error: insertError } = await supabase
        .from('invoices')
        .insert([invoice])

      if (insertError) throw insertError

      router.push('/invoices')
    } catch (error) {
      console.error('Error creating invoice:', error)
      setError('Failed to create invoice')
      setSaving(false)
    }
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Create New Invoice
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
                onChange={(e) =>
                  setInvoice({ ...invoice, invoice_number: e.target.value })
                }
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
                onChange={(e) =>
                  setInvoice({ ...invoice, client_name: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Client Address"
                value={invoice.client_address}
                onChange={(e) =>
                  setInvoice({ ...invoice, client_address: e.target.value })
                }
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <LineItems
            items={invoice.line_items || []}
            onChange={handleLineItemsChange}
          />
        </Paper>

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            type="submit"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Create Invoice'}
          </Button>
          <Button variant="outlined" onClick={() => router.push('/invoices')}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Container>
  )
}
