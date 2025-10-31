'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { CompanySettings, Estimate } from '@/lib/types'
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
import { exportEstimatePDF } from '@/lib/pdf'

export default function EstimateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const [estimate, setEstimate] = useState<Estimate | null>(null)
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      const { data } = await supabase.from('estimates').select('*').eq('id', id).single()
      setEstimate(data as Estimate)
      const { data: cs } = await supabase.from('company_settings').select('*').maybeSingle()
      if (cs) setCompanySettings(cs)
    } catch (e) {
      console.error('Failed to load estimate', e)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this estimate?')) return
    try {
      const { error } = await supabase.from('estimates').delete().eq('id', id)
      if (error) throw error
      router.push('/estimates')
    } catch (e) {
      console.error('Delete failed', e)
      alert('Failed to delete estimate')
    }
  }

  if (loading) {
    return (
      <Container maxWidth="md">
        <Typography>Loading...</Typography>
      </Container>
    )
  }

  if (!estimate) {
    return (
      <Container maxWidth="md">
        <Typography>Estimate not found.</Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Estimate {estimate.estimate_number}</Typography>
        <Chip label={estimate.status.toUpperCase()} />
      </Box>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2">Client</Typography>
            <Typography>{estimate.client_name}</Typography>
            <Typography color="text.secondary">{estimate.client_address}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography>Date: {new Date(estimate.date).toLocaleDateString()}</Typography>
            <Typography>Expiry: {new Date(estimate.expiry_date).toLocaleDateString()}</Typography>
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
              {estimate.line_items.map((item, idx) => (
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
          <Typography>Subtotal: ${estimate.subtotal.toFixed(2)}</Typography>
          <Typography>GST: ${estimate.gst.toFixed(2)}</Typography>
          <Typography variant="h6">Total: ${estimate.total.toFixed(2)}</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button variant="contained" onClick={() => router.push(`/estimates/${id}/edit`)}>Edit</Button>
          <Button variant="outlined" onClick={() => exportEstimatePDF(estimate, companySettings || undefined)}>Export PDF</Button>
          <Button color="error" variant="outlined" onClick={handleDelete}>Delete</Button>
          <Button onClick={() => router.push('/estimates')}>Back</Button>
        </Box>
      </Paper>
    </Container>
  )
}


