'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { CompanySettings, Invoice } from '@/lib/types'
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Button,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material'
import { exportInvoicePDF } from '@/lib/pdf'

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      const { data } = await supabase.from('invoices').select('*').eq('id', id).single()
      setInvoice(data as Invoice)
      const { data: cs } = await supabase.from('company_settings').select('*').maybeSingle()
      if (cs) setCompanySettings(cs)
    } catch (e) {
      console.error('Failed to load invoice', e)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this invoice?')) return
    try {
      const { error } = await supabase.from('invoices').delete().eq('id', id)
      if (error) throw error
      router.push('/invoices')
    } catch (e) {
      console.error('Delete failed', e)
      alert('Failed to delete invoice')
    }
  }

  if (loading) {
    return (
      <Container maxWidth="md">
        <Typography>Loading...</Typography>
      </Container>
    )
  }

  if (!invoice) {
    return (
      <Container maxWidth="md">
        <Typography>Invoice not found.</Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Invoice {invoice.invoice_number}</Typography>
        <Chip label={invoice.status.toUpperCase()} />
      </Box>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2">Client</Typography>
            <Typography>{invoice.client_name}</Typography>
            <Typography color="text.secondary">{invoice.client_address}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography>Date: {new Date(invoice.date).toLocaleDateString()}</Typography>
            <Typography>Due: {new Date(invoice.due_date).toLocaleDateString()}</Typography>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell align="right">Unit Price</TableCell>
                <TableCell align="center">GST</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoice.line_items.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">${item.unit_price.toFixed(2)}</TableCell>
                  <TableCell align="center">{item.gst ? 'Yes' : 'No'}</TableCell>
                  <TableCell align="right">${item.total.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
          <Typography>Subtotal: ${invoice.subtotal.toFixed(2)}</Typography>
          <Typography>GST: ${invoice.gst.toFixed(2)}</Typography>
          <Typography variant="h6">Total: ${invoice.total.toFixed(2)}</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button variant="contained" onClick={() => router.push(`/invoices/${id}/edit`)}>Edit</Button>
          <Button variant="outlined" onClick={() => exportInvoicePDF(invoice, companySettings || undefined)}>Export PDF</Button>
          <Button color="error" variant="outlined" onClick={handleDelete}>Delete</Button>
          <Button onClick={() => router.push('/invoices')}>Back</Button>
        </Box>
      </Paper>
    </Container>
  )
}


