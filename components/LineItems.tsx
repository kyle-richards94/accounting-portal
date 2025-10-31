'use client'

import { LineItem } from '@/lib/types'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
  Button,
  Box,
} from '@mui/material'
import { Delete as DeleteIcon } from '@mui/icons-material'
import { v4 as uuidv4 } from 'uuid'

interface LineItemsProps {
  items: LineItem[]
  onChange: (items: LineItem[]) => void
}

export default function LineItems({ items, onChange }: LineItemsProps) {
  const calculateTotal = (item: Partial<LineItem>): number => {
    const quantity = item.quantity || 0
    const unitPrice = item.unit_price || 0
    const subtotal = quantity * unitPrice
    return item.gst ? subtotal * 1.1 : subtotal
  }

  const handleAddItem = () => {
    const newItem: LineItem = {
      id: uuidv4(),
      description: '',
      quantity: 1,
      unit_price: 0,
      gst: false,
      total: 0,
    }
    onChange([...items, newItem])
  }

  const handleRemoveItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id))
  }

  const handleUpdateItem = (id: string, field: keyof LineItem, value: any) => {
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value }
        updatedItem.total = calculateTotal(updatedItem)
        return updatedItem
      }
      return item
    })
    onChange(updatedItems)
  }

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

  const total = subtotal + gstAmount

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Description</TableCell>
            <TableCell align="right">Quantity</TableCell>
            <TableCell align="right">Unit Price</TableCell>
            <TableCell align="center">GST</TableCell>
            <TableCell align="right">Total</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  minRows={1}
                  maxRows={8}
                  value={item.description}
                  onChange={(e) =>
                    handleUpdateItem(item.id, 'description', e.target.value)
                  }
                  placeholder="Item description"
                />
              </TableCell>
              <TableCell align="right">
                <TextField
                  type="number"
                  size="small"
                  value={item.quantity}
                  onChange={(e) =>
                    handleUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)
                  }
                  sx={{ width: 80 }}
                />
              </TableCell>
              <TableCell align="right">
                <TextField
                  type="number"
                  size="small"
                  value={item.unit_price}
                  onChange={(e) =>
                    handleUpdateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)
                  }
                  sx={{ width: 100 }}
                />
              </TableCell>
              <TableCell align="center">
                <Checkbox
                  checked={item.gst}
                  onChange={(e) => handleUpdateItem(item.id, 'gst', e.target.checked)}
                />
              </TableCell>
              <TableCell align="right">
                <Typography sx={{ fontWeight: 'bold' }}>
                  ${item.total.toFixed(2)}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <IconButton
                  onClick={() => handleRemoveItem(item.id)}
                  color="error"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {items.length === 0 && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography color="text.secondary">No items yet. Click "Add Item" to get started.</Typography>
        </Box>
      )}

      <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Button variant="outlined" onClick={handleAddItem}>
          Add Item
        </Button>
        
        <Box sx={{ minWidth: 200 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Subtotal:</Typography>
            <Typography>${subtotal.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>GST:</Typography>
            <Typography>${gstAmount.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '2px solid #000' }}>
            <Typography variant="h6">Total:</Typography>
            <Typography variant="h6">${total.toFixed(2)}</Typography>
          </Box>
        </Box>
      </Box>
    </TableContainer>
  )
}
