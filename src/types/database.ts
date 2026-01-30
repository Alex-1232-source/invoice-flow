// Custom database types for the GST Invoice Tracker

export interface BusinessProfile {
  id: string;
  name: string;
  gstin: string | null;
  pan: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  phone: string | null;
  email: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
  bank_ifsc: string | null;
  invoice_prefix: string;
  invoice_counter: number;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'accountant' | 'viewer';
  business_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  business_id: string;
  name: string;
  gstin: string | null;
  pan: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  id: string;
  business_id: string;
  name: string;
  gstin: string | null;
  pan: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  hsn_sac_code: string | null;
  unit: string;
  unit_price: number;
  gst_rate: '0' | '5' | '12' | '18' | '28';
  is_service: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  business_id: string;
  customer_id: string;
  invoice_number: string;
  invoice_type: 'tax_invoice' | 'bill_of_supply' | 'credit_note' | 'debit_note';
  invoice_date: string;
  due_date: string | null;
  place_of_supply: string | null;
  is_inter_state: boolean;
  subtotal: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  total_tax: number;
  total_amount: number;
  amount_paid: number;
  status: 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  notes: string | null;
  terms: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  customer?: Customer;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id: string | null;
  description: string;
  hsn_sac_code: string | null;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_percent: number;
  taxable_amount: number;
  gst_rate: '0' | '5' | '12' | '18' | '28';
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  total_amount: number;
  created_at: string;
  product?: Product;
}

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_date: string;
  payment_method: string | null;
  reference_number: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

// Form types for creating/updating
export type BusinessProfileFormData = Omit<BusinessProfile, 'id' | 'created_at' | 'updated_at'>;
export type CustomerFormData = Omit<Customer, 'id' | 'business_id' | 'created_at' | 'updated_at'>;
export type VendorFormData = Omit<Vendor, 'id' | 'business_id' | 'created_at' | 'updated_at'>;
export type ProductFormData = Omit<Product, 'id' | 'business_id' | 'created_at' | 'updated_at'>;
export type InvoiceFormData = Omit<Invoice, 'id' | 'business_id' | 'created_at' | 'updated_at' | 'customer'>;
export type InvoiceItemFormData = Omit<InvoiceItem, 'id' | 'created_at' | 'product'>;
export type PaymentFormData = Omit<Payment, 'id' | 'created_at'>;
