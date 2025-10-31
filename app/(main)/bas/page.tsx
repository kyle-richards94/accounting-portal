'use client'

import { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Card,
  CardContent,
  Stack,
} from '@mui/material'
import { Assessment as AssessmentIcon, PictureAsPdf as PdfIcon } from '@mui/icons-material'
import { supabase } from '@/lib/supabase'
import { Invoice } from '@/lib/types'

interface BASData {
  totalSales: number
  gstOnSales: number
  gstPayable: number
  invoiceCount: number
  invoices: Invoice[]
}

export default function BASPage() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [quarter, setQuarter] = useState('')
  const [basData, setBasData] = useState<BASData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Set default to current quarter
    const now = new Date()
    const currentQuarter = Math.floor(now.getMonth() / 3) + 1
    const year = now.getFullYear()
    setQuarter(`Q${currentQuarter}-${year}`)
    setQuarterDates(`Q${currentQuarter}-${year}`)
  }, [])

  const setQuarterDates = (quarterValue: string) => {
    if (!quarterValue) return

    const [q, year] = quarterValue.split('-')
    const quarterNum = parseInt(q.replace('Q', ''))
    const yearNum = parseInt(year)

    const quarterStartMonths = [0, 3, 6, 9]
    const startMonth = quarterStartMonths[quarterNum - 1]
    
    const start = new Date(yearNum, startMonth, 1)
    const end = new Date(yearNum, startMonth + 3, 0)

    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
  }

  const handleQuarterChange = (value: string) => {
    setQuarter(value)
    setQuarterDates(value)
  }

  const generateQuarters = () => {
    const quarters = []
    const currentYear = new Date().getFullYear()
    
    for (let year = currentYear; year >= currentYear - 5; year--) {
      for (let q = 4; q >= 1; q--) {
        quarters.push(`Q${q}-${year}`)
      }
    }
    
    return quarters
  }

  const generateReport = async () => {
    if (!startDate || !endDate) {
      alert('Please select a date range')
      return
    }

    setLoading(true)

    try {
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .in('status', ['sent', 'paid'])
        .order('date', { ascending: true })

      if (error) throw error

      const totalSales = invoices?.reduce((sum, inv) => sum + inv.subtotal, 0) || 0
      const gstOnSales = invoices?.reduce((sum, inv) => sum + inv.gst, 0) || 0

      setBasData({
        totalSales,
        gstOnSales,
        gstPayable: gstOnSales,
        invoiceCount: invoices?.length || 0,
        invoices: invoices || [],
      })
    } catch (error) {
      console.error('Error generating BAS report:', error)
      alert('Failed to generate BAS report')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU')
  }

  return (
    <Container maxWidth="lg">
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <AssessmentIcon color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h4" component="h1">
          BAS Report (GST)
        </Typography>
      </Stack>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Select Reporting Period
        </Typography>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Quarter</InputLabel>
              <Select
                value={quarter}
                onChange={(e) => handleQuarterChange(e.target.value)}
                label="Quarter"
              >
                {generateQuarters().map((q) => (
                  <MenuItem key={q} value={q}>
                    {q}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value)
                setQuarter('')
              }}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              type="date"
              label="End Date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value)
                setQuarter('')
              }}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={generateReport}
              disabled={loading}
              sx={{ height: 56 }}
            >
              {loading ? 'Loading...' : 'Generate'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {basData && (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Sales (Ex GST)
                  </Typography>
                  <Typography variant="h5" component="div">
                    {formatCurrency(basData.totalSales)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    G1 - Total Sales
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    GST on Sales
                  </Typography>
                  <Typography variant="h5" component="div" color="primary">
                    {formatCurrency(basData.gstOnSales)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    1A - GST Collected
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ bgcolor: 'success.light' }}>
                <CardContent>
                  <Typography color="success.dark" gutterBottom sx={{ fontWeight: 600 }}>
                    GST Payable
                  </Typography>
                  <Typography variant="h5" component="div" color="success.dark" sx={{ fontWeight: 700 }}>
                    {formatCurrency(basData.gstPayable)}
                  </Typography>
                  <Typography variant="caption" color="success.dark">
                    7 - Amount Payable
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Invoices
                  </Typography>
                  <Typography variant="h5" component="div">
                    {basData.invoiceCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    In reporting period
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                BAS Summary
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Period: {formatDate(startDate)} - {formatDate(endDate)}
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                GST Calculations
              </Typography>
              <Box sx={{ maxWidth: 600 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography>G1 - Total sales</Typography>
                  <Typography fontWeight="bold" sx={{ minWidth: 120, textAlign: 'right' }}>{formatCurrency(basData.totalSales)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography>1A - GST on sales</Typography>
                  <Typography fontWeight="bold" sx={{ minWidth: 120, textAlign: 'right' }}>{formatCurrency(basData.gstOnSales)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2, borderBottom: '2px solid', borderColor: 'divider' }}>
                  <Typography>1B - GST on purchases</Typography>
                  <Typography fontWeight="bold" sx={{ minWidth: 120, textAlign: 'right' }}>$0.00</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 2, px: 2, bgcolor: 'success.light', borderRadius: 1, mt: 1 }}>
                  <Typography fontWeight="bold" color="success.dark">7 - GST payable (1A - 1B)</Typography>
                  <Typography fontWeight="bold" color="success.dark" sx={{ minWidth: 120, textAlign: 'right', fontSize: '1.1rem' }}>{formatCurrency(basData.gstPayable)}</Typography>
                </Box>
              </Box>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              Note: This report only includes GST on sales (invoices). GST on purchases is not tracked in this system. 
              You will need to manually calculate and add your GST credits (purchases) in your BAS lodgement.
            </Typography>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Invoice Details
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice #</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                    <TableCell align="right">GST</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {basData.invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.invoice_number}</TableCell>
                      <TableCell>{formatDate(invoice.date)}</TableCell>
                      <TableCell>{invoice.client_name}</TableCell>
                      <TableCell align="right">{formatCurrency(invoice.subtotal)}</TableCell>
                      <TableCell align="right">{formatCurrency(invoice.gst)}</TableCell>
                      <TableCell align="right">{formatCurrency(invoice.total)}</TableCell>
                      <TableCell>
                        <Box
                          component="span"
                          sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: invoice.status === 'paid' ? 'success.light' : 'warning.light',
                            color: invoice.status === 'paid' ? 'success.dark' : 'warning.dark',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                          }}
                        >
                          {invoice.status}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}

      {!basData && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <AssessmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Report Generated
          </Typography>
          <Typography color="text.secondary">
            Select a reporting period and click "Generate" to view your BAS report
          </Typography>
        </Paper>
      )}
    </Container>
  )
}

