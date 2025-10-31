import { Document, Page, Text, View, StyleSheet, Svg, Path } from '@react-pdf/renderer'
import { Estimate, CompanySettings } from '@/lib/types'
import { format } from 'date-fns'

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 40,
    paddingTop: 24,
    paddingBottom: 50,
  },
  headerWrap: {
    position: 'relative',
    height: 140,
    color: '#fff',
  },
  headerInner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 40,
    paddingTop: 30,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  number: {
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
    marginBottom: 12,
  },
  block: {
    width: '48%',
  },
  blockTitle: {
    color: '#0288D1',
    fontWeight: 'bold',
    fontSize: 11,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  blockContent: {
    padding: 12,
    backgroundColor: '#F5F7FA',
    borderRadius: 6,
    borderLeft: '3pt solid #0288D1',
  },
  muted: {
    color: '#546E7A',
    fontSize: 9,
    marginTop: 3,
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F5F7FA',
    borderRadius: 4,
  },
  infoLabel: {
    width: 100,
    fontWeight: 'bold',
    color: '#263238',
    fontSize: 10,
  },
  infoValue: {
    flex: 1,
    color: '#546E7A',
    fontSize: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  table: {
    marginTop: 20,
    border: '1pt solid #E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0288D1',
    color: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontWeight: 'bold',
    fontSize: 10,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottom: '1pt solid #E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  tableRowAlt: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottom: '1pt solid #E0E0E0',
    backgroundColor: '#FAFBFC',
  },
  col1: { width: '44%', fontSize: 9 },
  col2: { width: '12%', textAlign: 'right', fontSize: 9 },
  col3: { width: '20%', textAlign: 'right', fontSize: 9 },
  col4: { width: '24%', textAlign: 'right', fontSize: 9, fontWeight: 'bold' },
  subtotalWrap: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  subtotalBox: {
    width: 280,
    padding: 16,
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    border: '1pt solid #E0E0E0',
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  subtotalLabel: {
    fontSize: 10,
    color: '#546E7A',
  },
  subtotalValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#263238',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginTop: 8,
    paddingTop: 12,
    borderTop: '2pt solid #0288D1',
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0288D1',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0288D1',
  },
  footer: {
    marginTop: 32,
    paddingTop: 16,
    borderTop: '1pt solid #E0E0E0',
  },
  footerTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0288D1',
    marginBottom: 8,
  },
  footerText: {
    fontSize: 9,
    color: '#546E7A',
    marginBottom: 4,
  },
  validityNotice: {
    marginTop: 32,
    textAlign: 'center',
    fontSize: 10,
    color: '#546E7A',
    padding: 12,
    backgroundColor: '#FFF9E6',
    borderRadius: 6,
    border: '1pt solid #FFD54F',
  },
})

interface EstimatePDFProps {
  estimate: Estimate
  companySettings?: CompanySettings
}

export default function EstimatePDF({ estimate, companySettings }: EstimatePDFProps) {
  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'dd MMM yyyy')
    } catch {
      return date
    }
  }

  const currency = (n: number) => `$${n.toFixed(2)}`

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerWrap}>
          <Svg style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 150 }} viewBox="0 0 595 150">
            <Path d="M0 0 H595 V95 C420 130 200 70 0 115 Z" fill="#0288D1" />
            <Path d="M0 0 H595 V70 C390 110 220 60 0 100 Z" fill="#01579B" />
          </Svg>
          <View style={styles.headerInner}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>ESTIMATE</Text>
              <View>
                <Text style={styles.number}>{estimate.estimate_number}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.sectionRow}>
            <View style={styles.block}>
              <Text style={styles.blockTitle}>For</Text>
              <View style={styles.blockContent}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#263238', marginBottom: 4 }}>
                  {estimate.client_name}
                </Text>
                <Text style={styles.muted}>{estimate.client_address}</Text>
              </View>
            </View>
            <View style={styles.block}>
              <Text style={styles.blockTitle}>From</Text>
              <View style={styles.blockContent}>
                {companySettings ? (
                  <View>
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#263238', marginBottom: 4 }}>
                      {companySettings.company_name}
                    </Text>
                    {companySettings.abn && <Text style={styles.muted}>ABN: {companySettings.abn}</Text>}
                    <Text style={styles.muted}>{companySettings.address}</Text>
                    {companySettings.phone && <Text style={styles.muted}>Phone: {companySettings.phone}</Text>}
                    {companySettings.email && <Text style={styles.muted}>Email: {companySettings.email}</Text>}
                  </View>
                ) : (
                  <Text style={styles.muted}>Company details not set</Text>
                )}
              </View>
            </View>
          </View>

          <View style={{ marginTop: 16, marginBottom: 8 }}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Estimate Date:</Text>
              <Text style={styles.infoValue}>{formatDate(estimate.date)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Expiry Date:</Text>
              <Text style={styles.infoValue}>{formatDate(estimate.expiry_date)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status:</Text>
              <Text style={[styles.infoValue, { textTransform: 'uppercase', fontWeight: 'bold', color: '#0288D1' }]}>
                {estimate.status}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#263238', marginTop: 8, marginBottom: 12 }}>
            Estimate Details
          </Text>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>DESCRIPTION</Text>
              <Text style={styles.col2}>QTY</Text>
              <Text style={styles.col3}>UNIT PRICE</Text>
              <Text style={styles.col4}>AMOUNT</Text>
            </View>
            {estimate.line_items.map((item, index) => (
              <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={styles.col1}>{item.description}</Text>
                <Text style={styles.col2}>{item.quantity}</Text>
                <Text style={styles.col3}>{currency(item.unit_price)}</Text>
                <Text style={styles.col4}>{currency(item.total)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.subtotalWrap}>
            <View style={styles.subtotalBox}>
              <View style={styles.subtotalRow}>
                <Text style={styles.subtotalLabel}>Subtotal:</Text>
                <Text style={styles.subtotalValue}>{currency(estimate.subtotal)}</Text>
              </View>
              <View style={styles.subtotalRow}>
                <Text style={styles.subtotalLabel}>GST (10%):</Text>
                <Text style={styles.subtotalValue}>{currency(estimate.gst)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>TOTAL:</Text>
                <Text style={styles.totalValue}>{currency(estimate.total)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.validityNotice}>
            <Text style={{ fontWeight: 'bold', marginBottom: 4, color: '#F57C00' }}>Validity Notice</Text>
            <Text>This estimate is valid until {formatDate(estimate.expiry_date)}</Text>
          </View>

          {companySettings && (
            <View style={styles.footer}>
              <Text style={styles.footerTitle}>Contact Information</Text>
              {companySettings.phone && (
                <Text style={styles.footerText}>Phone: {companySettings.phone}</Text>
              )}
              {companySettings.email && (
                <Text style={styles.footerText}>Email: {companySettings.email}</Text>
              )}
              <Text style={[styles.footerText, { marginTop: 8, fontStyle: 'italic' }]}>
                We look forward to working with you!
              </Text>
            </View>
          )}
        </View>
      </Page>
    </Document>
  )
}
