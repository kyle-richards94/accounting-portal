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
    paddingTop: 4,
    paddingBottom: 20,
  },
  headerWrap: {
    position: 'relative',
    height: 120,
    color: '#fff',
  },
  headerInner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 40,
    paddingTop: 24,
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
    marginTop: 8,
    marginBottom: 4,
    alignItems: 'stretch',
  },
  block: {
    width: '48%',
    flexDirection: 'column',
  },
  blockTitle: {
    color: '#1565C0',
    fontWeight: 'bold',
    fontSize: 11,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  blockContent: {
    padding: 8,
    backgroundColor: '#F5F7FA',
    borderRadius: 6,
    borderLeft: '3pt solid #1565C0',
    flexGrow: 1,
    minHeight: 80,
  },
  muted: {
    color: '#546E7A',
    fontSize: 9,
    marginTop: 3,
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
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
    marginTop: 6,
    border: '1pt solid #E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
    backgroundColor: '#1565C0',
    color: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontWeight: 'bold',
    fontSize: 10,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottom: '1pt solid #E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  tableRowAlt: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottom: '1pt solid #E0E0E0',
    backgroundColor: '#FAFBFC',
  },
  col1: { width: '44%', fontSize: 9 },
  col2: { width: '12%', textAlign: 'right', fontSize: 9 },
  col3: { width: '20%', textAlign: 'right', fontSize: 9 },
  col4: { width: '24%', textAlign: 'right', fontSize: 9, fontWeight: 'bold' },
  combinedFooter: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  totalsSection: {
    width: '48%',
    display: 'flex',
    marginRight: 6,
  },
  subtotalBox: {
    padding: 12,
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    border: '1pt solid #E0E0E0',
    flexGrow: 1,
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
    paddingVertical: 6,
    marginTop: 4,
    paddingTop: 8,
    borderTop: '2pt solid #1565C0',
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1565C0',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1565C0',
  },
  validitySection: {
    width: '48%',
    padding: 16,
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    border: '2pt solid #FFB300',
    display: 'flex',
    flexGrow: 1,
    marginLeft: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  validityLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F57C00',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  validityDate: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E65100',
    textAlign: 'center',
  },
  notesTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1565C0',
    marginTop: 12,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 9,
    color: '#546E7A',
    lineHeight: 1.4,
  },
  thankYou: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1565C0',
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
            <Path d="M0 0 H595 V95 C420 130 200 70 0 115 Z" fill="#1565C0" />
            <Path d="M0 0 H595 V70 C390 110 220 60 0 100 Z" fill="#0D47A1" />
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

          <View style={{ marginTop: 6, marginBottom: 4 }}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Estimate Date:</Text>
              <Text style={styles.infoValue}>{formatDate(estimate.date)}</Text>
            </View>
          </View>

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

          <View style={styles.combinedFooter}>
            <View style={styles.totalsSection}>
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

            <View style={styles.validitySection}>
              <Text style={styles.validityLabel}>Valid Until</Text>
              <Text style={styles.validityDate}>{formatDate(estimate.expiry_date)}</Text>
            </View>
          </View>

          {companySettings?.estimate_notes && (
            <View>
              <Text style={styles.notesTitle}>Notes</Text>
              <Text style={styles.notesText}>{companySettings.estimate_notes}</Text>
            </View>
          )}
        </View>
      </Page>
    </Document>
  )
}
