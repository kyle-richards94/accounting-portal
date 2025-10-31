'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CompanySettings, Estimate, Invoice } from '@/lib/types'

type DataContextValue = {
  invoices: Invoice[]
  estimates: Estimate[]
  settings: CompanySettings | null
  loading: boolean
  error?: string | null
  refresh: () => Promise<void>
}

const DataContext = createContext<DataContextValue | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [settings, setSettings] = useState<CompanySettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAll = async () => {
    setLoading(true)
    setError(null)
    try {
      const [invRes, estRes, setRes] = await Promise.all([
        supabase.from('invoices').select('*').order('created_at', { ascending: false }),
        supabase.from('estimates').select('*').order('created_at', { ascending: false }),
        supabase.from('company_settings').select('*').maybeSingle(),
      ])

      if (invRes.error) throw invRes.error
      if (estRes.error) throw estRes.error

      setInvoices(invRes.data || [])
      setEstimates(estRes.data || [])
      setSettings((setRes as any).data || null)
    } catch (e: any) {
      console.error('Initial data load failed:', e)
      setError(e?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo(
    () => ({ invoices, estimates, settings, loading, error, refresh: loadAll }),
    [invoices, estimates, settings, loading, error]
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useDataContext(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useDataContext must be used within DataProvider')
  return ctx
}


