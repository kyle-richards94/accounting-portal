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
  Snackbar,
  Alert,
} from '@mui/material'
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon, PictureAsPdf as PdfIcon } from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Estimate, CompanySettings } from '@/lib/types'
import { exportEstimatePDF } from '@/lib/pdf'
import { useDataContext } from '@/lib/dataContext'
import ConfirmDialog from '@/components/ConfirmDialog'

export default function EstimatesPage() {
  const router = useRouter()
  const { estimates: ctxEstimates, settings: ctxSettings, loading: ctxLoading, refresh } = useDataContext()
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [loading, setLoading] = useState(true)
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [estimateToDelete, setEstimateToDelete] = useState<Estimate | null>(null)

  useEffect(() => {
    setEstimates(ctxEstimates)
    setCompanySettings(ctxSettings || null)
    setLoading(ctxLoading)
  }, [ctxEstimates, ctxSettings, ctxLoading])

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

  const loadEstimates = async () => {
    try {
      await refresh()
    } catch (error) {
      console.error('Error loading estimates:', error)
      setErrorMsg('Failed to load estimates')
    }
  }

  const handleDeleteClick = (estimate: Estimate) => {
    setEstimateToDelete(estimate)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!estimateToDelete?.id) return

    try {
      const { error } = await supabase.from('estimates').delete().eq('id', estimateToDelete.id)
      if (error) throw error
      setDeleteDialogOpen(false)
      setEstimateToDelete(null)
      loadEstimates()
    } catch (error) {
      console.error('Error deleting estimate:', error)
      setErrorMsg('Failed to delete estimate')
      setDeleteDialogOpen(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setEstimateToDelete(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'success'
      case 'rejected':
        return 'error'
      case 'expired':
        return 'error'
      case 'sent':
        return 'warning'
      default:
        return 'default'
    }
  }

  const handleExportPDF = async (estimate: Estimate) => {
    try {
      await exportEstimatePDF(estimate, companySettings || undefined)
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Failed to export PDF')
    }
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Estimates
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push('/estimates/new')}
        >
          Create Estimate
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Estimate #</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Expiry Date</TableCell>
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
            ) : estimates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No estimates found. Create your first estimate to get started.
                </TableCell>
              </TableRow>
            ) : (
              estimates.map((estimate) => (
                <TableRow key={estimate.id}>
                  <TableCell>{estimate.estimate_number}</TableCell>
                  <TableCell>{new Date(estimate.date).toLocaleDateString()}</TableCell>
                  <TableCell>{estimate.client_name}</TableCell>
                  <TableCell>{new Date(estimate.expiry_date).toLocaleDateString()}</TableCell>
                  <TableCell>${estimate.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={estimate.status.toUpperCase()}
                      color={getStatusColor(estimate.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'inline-flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => router.push(`/estimates/${estimate.id}`)}
                        title="View"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleExportPDF(estimate)}
                        title="Export PDF"
                      >
                        <PdfIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => router.push(`/estimates/${estimate.id}/edit`)}
                        title="Edit"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(estimate)}
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
        title="Delete Estimate"
        message={`Are you sure you want to delete estimate ${estimateToDelete?.estimate_number}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </Container>
  )
}

