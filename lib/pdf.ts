import { pdf } from '@react-pdf/renderer'
import { createElement } from 'react'
import { Invoice, Estimate, CompanySettings } from '@/lib/types'

export async function exportInvoicePDF(
  invoice: Invoice,
  companySettings?: CompanySettings
): Promise<void> {
  const { default: InvoicePDF } = await import('@/components/InvoicePDF')
  const doc = createElement(InvoicePDF, { invoice, companySettings }) as any
  const blob = await pdf(doc).toBlob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `Invoice-${invoice.invoice_number}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function exportEstimatePDF(
  estimate: Estimate,
  companySettings?: CompanySettings
): Promise<void> {
  const { default: EstimatePDF } = await import('@/components/EstimatePDF')
  const doc = createElement(EstimatePDF, { estimate, companySettings }) as any
  const blob = await pdf(doc).toBlob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `Estimate-${estimate.estimate_number}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
