'use client'

import { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Box,
  Stack,
  Snackbar,
  Alert,
} from '@mui/material'
import { ReceiptLong as ReceiptLongIcon } from '@mui/icons-material'
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon, PictureAsPdf as PdfIcon } from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Invoice, CompanySettings } from '@/lib/types'
import { exportInvoicePDF } from '@/lib/pdf'
import { useDataContext } from '@/lib/dataContext'
import ConfirmDialog from '@/components/ConfirmDialog'

export default function InvoicesPage() {
  const router = useRouter()
  const { invoices: ctxInvoices, settings: ctxSettings, loading: ctxLoading, refresh } = useDataContext()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null)

  useEffect(() => {
    setInvoices(ctxInvoices)
    setCompanySettings(ctxSettings || null)
    setLoading(ctxLoading)
  }, [ctxInvoices, ctxSettings, ctxLoading])

  useEffect(() => {
    // Refresh data when page loads
    refresh()
  }, [])

  const loadCompanySettings = async () => {
    try {
      const { data } = await supabase
        .from('company_settings')
        .select('*')
        .single()
      if (data) {
        setCompanySettings(data)
      }
    } catch (error) {
      console.error('Error loading company settings:', error)
      setErrorMsg('Failed to load company settings')
    }
  }

  const loadInvoices = async () => {
    try {
      await refresh()
    } catch (error) {
      console.error('Error loading invoices:', error)
      setErrorMsg('Failed to load invoices')
    }
  }

  const handleDeleteClick = (invoice: Invoice) => {
    setInvoiceToDelete(invoice)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!invoiceToDelete?.id) return

    try {
      const { error } = await supabase.from('invoices').delete().eq('id', invoiceToDelete.id)
      if (error) throw error
      setDeleteDialogOpen(false)
      setInvoiceToDelete(null)
      loadInvoices()
    } catch (error) {
      console.error('Error deleting invoice:', error)
      setErrorMsg('Failed to delete invoice')
      setDeleteDialogOpen(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setInvoiceToDelete(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success'
      case 'overdue':
        return 'error'
      case 'sent':
        return 'warning'
      default:
        return 'default'
    }
  }

  const handleExportPDF = async (invoice: Invoice) => {
    try {
      await exportInvoicePDF(invoice, companySettings || undefined)
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Failed to export PDF')
    }
  }

  return (
    <Container maxWidth="lg">
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <ReceiptLongIcon color="primary" />
          <Typography variant="h4" component="h1">Invoices</Typography>
        </Stack>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => router.push('/invoices/new')}>
          Create Invoice
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Invoice #</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No invoices found. Create your first invoice to get started.
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.invoice_number}</TableCell>
                  <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                  <TableCell>{invoice.client_name}</TableCell>
                  <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                  <TableCell>${invoice.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={invoice.status.toUpperCase()}
                      color={getStatusColor(invoice.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'inline-flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => router.push(`/invoices/${invoice.id}`)}
                        title="View"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleExportPDF(invoice)}
                        title="Export PDF"
                      >
                        <PdfIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => router.push(`/invoices/${invoice.id}/edit`)}
                        title="Edit"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(invoice)}
                        color="error"
                        title="Delete"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

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

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Invoice"
        message={`Are you sure you want to delete invoice ${invoiceToDelete?.invoice_number}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </Container>
  )
}

