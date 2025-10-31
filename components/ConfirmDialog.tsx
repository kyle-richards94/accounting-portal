'use client'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
} from '@mui/material'
import { Warning as WarningIcon } from '@mui/icons-material'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  confirmColor?: 'error' | 'primary' | 'secondary' | 'success' | 'info' | 'warning'
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  confirmColor = 'error',
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <WarningIcon color={confirmColor} sx={{ fontSize: 28 }} />
          <span>{title}</span>
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: 'text.primary' }}>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} variant="outlined" color="inherit">
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={confirmColor}
          autoFocus
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

