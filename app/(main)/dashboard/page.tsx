'use client'

import { useEffect, useState } from 'react'
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Box,
  Button,
  Paper,
  Divider,
  Chip,
  Stack,
  Snackbar,
  Alert,
} from '@mui/material'
import {
  ReceiptLong as ReceiptLongIcon,
  Description as DescriptionIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  PendingActions as PendingActionsIcon,
} from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Invoice, Estimate } from '@/lib/types'
import { useDataContext } from '@/lib/dataContext'

export default function DashboardPage() {
  const router = useRouter()
  const { invoices, estimates, loading: initialLoading, refresh } = useDataContext()
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([])
  const [recentEstimates, setRecentEstimates] = useState<Estimate[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    setRecentInvoices((invoices || []).slice(0, 5))
    setRecentEstimates((estimates || []).slice(0, 5))
    setLoading(initialLoading)
  }, [invoices, estimates, initialLoading])

  const loadData = async () => {
    await refresh()
  }

  const calculateTotals = (items: { quantity: number; unit_price: number; gst: boolean }[]) => {
    const subtotal = items.reduce((sum, i) => sum + (i.quantity || 0) * (i.unit_price || 0), 0)
    const gst = items
      .filter((i) => i.gst)
      .reduce((sum, i) => sum + (i.quantity || 0) * (i.unit_price || 0) * 0.1, 0)
    const total = subtotal + gst
    return { subtotal, gst, total }
  }

  const generateNextNumber = (prefix: string, last: string | undefined) => {
    const base = last || `${prefix}-0000`
    const next = base.replace(/^[A-Z]+-(\d+)/, (_, n) => `${prefix}-${(parseInt(n) + 1).toString().padStart(4, '0')}`)
    return next
  }

  const seedDemoData = async () => {
    try {
      setSeeding(true)

      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setErrorMsg('You appear to be offline. Connect to the internet to generate demo data via Supabase.')
        setSeeding(false)
        return
      }

      // Determine next numbers
      const { data: lastInv } = await supabase
        .from('invoices')
        .select('invoice_number')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      const { data: lastEst } = await supabase
        .from('estimates')
        .select('estimate_number')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      const today = new Date()
      const formatDate = (d: Date) => d.toISOString().split('T')[0]

      // Seed invoices
      const inv1Items = [
        { quantity: 5, unit_price: 120, gst: true },
        { quantity: 2, unit_price: 80, gst: false },
      ]
      const inv2Items = [
        { quantity: 10, unit_price: 60, gst: true },
      ]
      const inv1Num = generateNextNumber('INV', lastInv?.invoice_number)
      const inv2Num = generateNextNumber('INV', inv1Num)
      const inv1Totals = calculateTotals(inv1Items)
      const inv2Totals = calculateTotals(inv2Items)

      const invoicesToInsert = [
        {
          invoice_number: inv1Num,
          date: formatDate(today),
          client_name: 'Acme Pty Ltd',
          client_address: '123 Example St, Sydney NSW',
          due_date: formatDate(new Date(today.getTime() + 7 * 86400000)),
          line_items: inv1Items.map((i) => ({ ...i, description: 'Service Item', total: (i.quantity * i.unit_price) * (i.gst ? 1.1 : 1) })),
          subtotal: inv1Totals.subtotal,
          gst: inv1Totals.gst,
          total: inv1Totals.total,
          status: 'sent',
        },
        {
          invoice_number: inv2Num,
          date: formatDate(today),
          client_name: 'Globex Corporation',
          client_address: '456 Market Rd, Melbourne VIC',
          due_date: formatDate(new Date(today.getTime() + 14 * 86400000)),
          line_items: inv2Items.map((i) => ({ ...i, description: 'Consulting Hours', total: (i.quantity * i.unit_price) * (i.gst ? 1.1 : 1) })),
          subtotal: inv2Totals.subtotal,
          gst: inv2Totals.gst,
          total: inv2Totals.total,
          status: 'draft',
        },
      ]

      // Seed estimates
      const est1Items = [
        { quantity: 3, unit_price: 200, gst: true },
        { quantity: 1, unit_price: 500, gst: true },
      ]
      const est1Num = generateNextNumber('EST', lastEst?.estimate_number)
      const est1Totals = calculateTotals(est1Items)

      const estimatesToInsert = [
        {
          estimate_number: est1Num,
          date: formatDate(today),
          client_name: 'Initech',
          client_address: '789 Industrial Ave, Brisbane QLD',
          expiry_date: formatDate(new Date(today.getTime() + 30 * 86400000)),
          line_items: est1Items.map((i) => ({ ...i, description: 'Project Scope', total: (i.quantity * i.unit_price) * (i.gst ? 1.1 : 1) })),
          subtotal: est1Totals.subtotal,
          gst: est1Totals.gst,
          total: est1Totals.total,
          status: 'sent',
        },
      ]

      const { error: invErr } = await supabase.from('invoices').insert(invoicesToInsert)
      if (invErr) throw invErr
      const { error: estErr } = await supabase.from('estimates').insert(estimatesToInsert)
      if (estErr) throw estErr

      await loadData()
    } catch (e: any) {
      console.error('Error seeding demo data:', e)
      setErrorMsg(e?.message || 'Failed to generate demo data')
    } finally {
      setSeeding(false)
    }
  }

  const totalInvoiceAmount = recentInvoices.reduce((sum, inv) => sum + inv.total, 0)
  const totalEstimateAmount = recentEstimates.reduce((sum, est) => sum + est.total, 0)
  const pendingInvoices = recentInvoices.filter((inv) => inv.status === 'sent' || inv.status === 'draft').length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success'
      case 'sent':
        return 'info'
      case 'draft':
        return 'default'
      case 'overdue':
        return 'error'
      case 'accepted':
        return 'success'
      case 'rejected':
        return 'error'
      case 'expired':
        return 'warning'
      default:
        return 'default'
    }
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 70px)', py: 4 }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Dashboard
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="primary"
            onClick={seedDemoData}
            disabled={seeding}
            sx={{
              px: 3,
              py: 1.5,
              fontWeight: 600,
            }}
          >
            {seeding ? 'Generating...' : 'Generate Demo Data'}
          </Button>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
                color: 'white',
                borderRadius: 3,
                height: '100%',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 56, height: 56 }}>
                  <AttachMoneyIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                ${totalInvoiceAmount.toFixed(2)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total Invoice Value
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                background: 'linear-gradient(135deg, #0288D1 0%, #01579B 100%)',
                color: 'white',
                borderRadius: 3,
                height: '100%',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 56, height: 56 }}>
                  <TrendingUpIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                ${totalEstimateAmount.toFixed(2)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total Estimate Value
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                background: 'linear-gradient(135deg, #039BE5 0%, #0277BD 100%)',
                color: 'white',
                borderRadius: 3,
                height: '100%',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 56, height: 56 }}>
                  <PendingActionsIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {pendingInvoices}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Pending Invoices
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                height: '100%',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                    <ReceiptLongIcon />
                  </Avatar>
                }
                title={
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Recent Invoices
                  </Typography>
                }
                subheader={
                  <Typography variant="body2" color="text.secondary">
                    Latest 5 invoices
                  </Typography>
                }
                sx={{ pb: 1 }}
              />
              <Divider />
              <CardContent sx={{ pt: 2 }}>
                {loading ? (
                  <Typography color="text.secondary">Loading...</Typography>
                ) : recentInvoices.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <ReceiptLongIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography color="text.secondary">No invoices yet</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Create your first invoice to get started
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {recentInvoices.map((invoice) => (
                      <Paper
                        key={invoice.id}
                        elevation={0}
                        sx={{
                          p: 2,
                          bgcolor: 'background.default',
                          borderRadius: 2,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: 'rgba(21, 101, 192, 0.04)',
                            transform: 'translateX(4px)',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {invoice.invoice_number}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {invoice.client_name}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
                              ${invoice.total.toFixed(2)}
                            </Typography>
                            <Chip
                              label={invoice.status}
                              color={getStatusColor(invoice.status) as any}
                              size="small"
                              sx={{ fontWeight: 500 }}
                            />
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                )}
                <Stack spacing={1.5} sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={() => router.push('/invoices')}
                    sx={{
                      py: 1.5,
                      fontWeight: 600,
                    }}
                  >
                    View All Invoices
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={() => router.push('/invoices/new')}
                    sx={{
                      py: 1.5,
                      fontWeight: 600,
                    }}
                  >
                    New Invoice
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                height: '100%',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 48, height: 48 }}>
                    <DescriptionIcon />
                  </Avatar>
                }
                title={
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Recent Estimates
                  </Typography>
                }
                subheader={
                  <Typography variant="body2" color="text.secondary">
                    Latest 5 estimates
                  </Typography>
                }
                sx={{ pb: 1 }}
              />
              <Divider />
              <CardContent sx={{ pt: 2 }}>
                {loading ? (
                  <Typography color="text.secondary">Loading...</Typography>
                ) : recentEstimates.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <DescriptionIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography color="text.secondary">No estimates yet</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Create your first estimate to get started
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {recentEstimates.map((estimate) => (
                      <Paper
                        key={estimate.id}
                        elevation={0}
                        sx={{
                          p: 2,
                          bgcolor: 'background.default',
                          borderRadius: 2,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: 'rgba(2, 136, 209, 0.04)',
                            transform: 'translateX(4px)',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {estimate.estimate_number}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {estimate.client_name}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: 'secondary.main', mb: 0.5 }}>
                              ${estimate.total.toFixed(2)}
                            </Typography>
                            <Chip
                              label={estimate.status}
                              color={getStatusColor(estimate.status) as any}
                              size="small"
                              sx={{ fontWeight: 500 }}
                            />
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                )}
                <Stack spacing={1.5} sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={() => router.push('/estimates')}
                    sx={{
                      py: 1.5,
                      fontWeight: 600,
                    }}
                  >
                    View All Estimates
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={() => router.push('/estimates/new')}
                    sx={{
                      py: 1.5,
                      fontWeight: 600,
                    }}
                  >
                    New Estimate
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Snackbar
          open={!!errorMsg}
          autoHideDuration={6000}
          onClose={() => setErrorMsg(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setErrorMsg(null)} severity="error" sx={{ width: '100%' }}>
            {errorMsg}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  )
}
