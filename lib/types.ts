export interface CompanySettings {
  id?: string;
  company_name: string;
  abn: string;
  address: string;
  phone?: string;
  email?: string;
  bank_bsb?: string;
  bank_account?: string;
  bank_account_name?: string;
  notes?: string;
  invoice_notes?: string;
  estimate_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Client {
  id?: string;
  name: string;
  address?: string;
  email?: string;
  phone?: string;
  abn?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  gst: boolean;
  total: number;
}

export interface Invoice {
  id?: string;
  invoice_number: string;
  date: string;
  client_name: string;
  client_address: string;
  due_date: string;
  payment_terms?: 'net_15' | 'net_30' | 'custom';
  line_items: LineItem[];
  subtotal: number;
  gst: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  created_at?: string;
  updated_at?: string;
}

export interface Estimate {
  id?: string;
  estimate_number: string;
  date: string;
  client_name: string;
  client_address: string;
  expiry_date: string;
  line_items: LineItem[];
  subtotal: number;
  gst: number;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  created_at?: string;
  updated_at?: string;
}
