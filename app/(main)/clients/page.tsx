'use client'

import { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  IconButton,
  Alert,
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { supabase } from '@/lib/supabase'
import { Client } from '@/lib/types'

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    address: '',
    email: '',
    phone: '',
    abn: '',
    notes: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setClients(data || [])
    } catch (error) {
      console.error('Error loading clients:', error)
      setError('Failed to load clients')
    }
  }

  const handleOpenDialog = (client?: Client) => {
    if (client) {
      setEditingClient(client)
      setFormData(client)
    } else {
      setEditingClient(null)
      setFormData({
        name: '',
        address: '',
        email: '',
        phone: '',
        abn: '',
        notes: '',
      })
    }
    setOpenDialog(true)
    setError('')
    setSuccess('')
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingClient(null)
    setFormData({
      name: '',
      address: '',
      email: '',
      phone: '',
      abn: '',
      notes: '',
    })
  }

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      setError('Client name is required')
      return
    }

    try {
      if (editingClient) {
        // Update existing client
        const { error } = await supabase
          .from('clients')
          .update({
            name: formData.name,
            address: formData.address,
            email: formData.email,
            phone: formData.phone,
            abn: formData.abn,
            notes: formData.notes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingClient.id)

        if (error) throw error
        setSuccess('Client updated successfully')
      } else {
        // Create new client
        const { error } = await supabase.from('clients').insert([formData])

        if (error) throw error
        setSuccess('Client created successfully')
      }

      handleCloseDialog()
      loadClients()
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error saving client:', error)
      setError('Failed to save client')
    }
  }

  const handleDelete = async (client: Client) => {
    if (!confirm(`Are you sure you want to delete ${client.name}?`)) {
      return
    }

    try {
      const { error } = await supabase.from('clients').delete().eq('id', client.id)

      if (error) throw error
      setSuccess('Client deleted successfully')
      loadClients()
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error deleting client:', error)
      setError('Failed to delete client')
    }
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Clients
        </Typography>
        <Button variant="contained" onClick={() => handleOpenDialog()}>
          Add Client
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Address</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No clients found. Click "Add Client" to create one.
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.email || '-'}</TableCell>
                  <TableCell>{client.phone || '-'}</TableCell>
                  <TableCell>{client.address || '-'}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenDialog(client)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(client)} size="small">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingClient ? 'Edit Client' : 'Add Client'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
            />
            <TextField
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              fullWidth
            />
            <TextField
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="ABN"
              value={formData.abn}
              onChange={(e) => setFormData({ ...formData, abn: e.target.value })}
              fullWidth
            />
            <TextField
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              multiline
              rows={2}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingClient ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

