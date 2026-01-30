// Indian States with codes for GST
export const INDIAN_STATES = [
  { code: 'AN', name: 'Andaman and Nicobar Islands', stateCode: '35' },
  { code: 'AP', name: 'Andhra Pradesh', stateCode: '37' },
  { code: 'AR', name: 'Arunachal Pradesh', stateCode: '12' },
  { code: 'AS', name: 'Assam', stateCode: '18' },
  { code: 'BR', name: 'Bihar', stateCode: '10' },
  { code: 'CH', name: 'Chandigarh', stateCode: '04' },
  { code: 'CT', name: 'Chhattisgarh', stateCode: '22' },
  { code: 'DD', name: 'Daman and Diu', stateCode: '25' },
  { code: 'DL', name: 'Delhi', stateCode: '07' },
  { code: 'GA', name: 'Goa', stateCode: '30' },
  { code: 'GJ', name: 'Gujarat', stateCode: '24' },
  { code: 'HP', name: 'Himachal Pradesh', stateCode: '02' },
  { code: 'HR', name: 'Haryana', stateCode: '06' },
  { code: 'JH', name: 'Jharkhand', stateCode: '20' },
  { code: 'JK', name: 'Jammu and Kashmir', stateCode: '01' },
  { code: 'KA', name: 'Karnataka', stateCode: '29' },
  { code: 'KL', name: 'Kerala', stateCode: '32' },
  { code: 'LA', name: 'Ladakh', stateCode: '38' },
  { code: 'LD', name: 'Lakshadweep', stateCode: '31' },
  { code: 'MH', name: 'Maharashtra', stateCode: '27' },
  { code: 'ML', name: 'Meghalaya', stateCode: '17' },
  { code: 'MN', name: 'Manipur', stateCode: '14' },
  { code: 'MP', name: 'Madhya Pradesh', stateCode: '23' },
  { code: 'MZ', name: 'Mizoram', stateCode: '15' },
  { code: 'NL', name: 'Nagaland', stateCode: '13' },
  { code: 'OD', name: 'Odisha', stateCode: '21' },
  { code: 'PB', name: 'Punjab', stateCode: '03' },
  { code: 'PY', name: 'Puducherry', stateCode: '34' },
  { code: 'RJ', name: 'Rajasthan', stateCode: '08' },
  { code: 'SK', name: 'Sikkim', stateCode: '11' },
  { code: 'TN', name: 'Tamil Nadu', stateCode: '33' },
  { code: 'TS', name: 'Telangana', stateCode: '36' },
  { code: 'TR', name: 'Tripura', stateCode: '16' },
  { code: 'UK', name: 'Uttarakhand', stateCode: '05' },
  { code: 'UP', name: 'Uttar Pradesh', stateCode: '09' },
  { code: 'WB', name: 'West Bengal', stateCode: '19' },
] as const;

export type IndianStateCode = typeof INDIAN_STATES[number]['code'];

// GST Rates
export const GST_RATES = [
  { value: '0', label: '0%', rate: 0 },
  { value: '5', label: '5%', rate: 5 },
  { value: '12', label: '12%', rate: 12 },
  { value: '18', label: '18%', rate: 18 },
  { value: '28', label: '28%', rate: 28 },
] as const;

export type GstRateValue = typeof GST_RATES[number]['value'];

// Invoice Status
export const INVOICE_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  { value: 'sent', label: 'Sent', color: 'bg-blue-100 text-blue-800' },
  { value: 'paid', label: 'Paid', color: 'bg-green-100 text-green-800' },
  { value: 'partial', label: 'Partial', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'overdue', label: 'Overdue', color: 'bg-red-100 text-red-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-500' },
] as const;

export type InvoiceStatusValue = typeof INVOICE_STATUSES[number]['value'];

// Invoice Types
export const INVOICE_TYPES = [
  { value: 'tax_invoice', label: 'Tax Invoice' },
  { value: 'bill_of_supply', label: 'Bill of Supply' },
  { value: 'credit_note', label: 'Credit Note' },
  { value: 'debit_note', label: 'Debit Note' },
] as const;

export type InvoiceTypeValue = typeof INVOICE_TYPES[number]['value'];

// User Roles
export const USER_ROLES = [
  { value: 'admin', label: 'Admin', description: 'Full access to all features' },
  { value: 'accountant', label: 'Accountant', description: 'Can manage invoices and data' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access' },
] as const;

export type UserRoleValue = typeof USER_ROLES[number]['value'];

// Units
export const UNITS = [
  { value: 'NOS', label: 'Numbers (NOS)' },
  { value: 'PCS', label: 'Pieces (PCS)' },
  { value: 'KGS', label: 'Kilograms (KGS)' },
  { value: 'GMS', label: 'Grams (GMS)' },
  { value: 'LTR', label: 'Litres (LTR)' },
  { value: 'MTR', label: 'Metres (MTR)' },
  { value: 'SQM', label: 'Square Metres (SQM)' },
  { value: 'BOX', label: 'Box (BOX)' },
  { value: 'SET', label: 'Set (SET)' },
  { value: 'HRS', label: 'Hours (HRS)' },
  { value: 'DAYS', label: 'Days (DAYS)' },
] as const;
