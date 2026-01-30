import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Customer, Product, BusinessProfile } from '@/types/database';
import { INDIAN_STATES, GST_RATES, INVOICE_TYPES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface InvoiceLineItem {
  id: string;
  product_id: string;
  description: string;
  hsn_sac_code: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_percent: number;
  gst_rate: string;
  taxable_amount: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  total_amount: number;
}

export default function InvoiceCreate() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);

  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [invoiceType, setInvoiceType] = useState<string>('tax_invoice');
  const [invoiceDate, setInvoiceDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');

  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    createEmptyLineItem(),
  ]);

  const [isInterState, setIsInterState] = useState(false);

  useEffect(() => {
    if (profile?.business_id) {
      fetchData();
    }
  }, [profile?.business_id]);

  const fetchData = async () => {
    try {
      const [customersRes, productsRes, businessRes] = await Promise.all([
        supabase.from('customers').select('*').eq('is_active', true).order('name'),
        supabase.from('products').select('*').eq('is_active', true).order('name'),
        supabase.from('business_profiles').select('*').eq('id', profile!.business_id).single(),
      ]);

      if (customersRes.data) setCustomers(customersRes.data as Customer[]);
      if (productsRes.data) setProducts(productsRes.data as Product[]);
      if (businessRes.data) setBusinessProfile(businessRes.data as BusinessProfile);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  function createEmptyLineItem(): InvoiceLineItem {
    return {
      id: crypto.randomUUID(),
      product_id: '',
      description: '',
      hsn_sac_code: '',
      quantity: 1,
      unit: 'NOS',
      unit_price: 0,
      discount_percent: 0,
      gst_rate: '18',
      taxable_amount: 0,
      cgst_amount: 0,
      sgst_amount: 0,
      igst_amount: 0,
      total_amount: 0,
    };
  }

  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomer(customerId);
    const customer = customers.find(c => c.id === customerId);
    if (customer && businessProfile) {
      const interState = customer.state !== businessProfile.state;
      setIsInterState(interState);
      recalculateAllItems(lineItems, interState);
    }
  };

  const handleProductChange = (itemId: string, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setLineItems(items =>
      items.map(item => {
        if (item.id === itemId) {
          const newItem = {
            ...item,
            product_id: productId,
            description: product.name,
            hsn_sac_code: product.hsn_sac_code || '',
            unit: product.unit,
            unit_price: product.unit_price,
            gst_rate: product.gst_rate,
          };
          return calculateLineItem(newItem, isInterState);
        }
        return item;
      })
    );
  };

  const handleLineItemChange = (itemId: string, field: keyof InvoiceLineItem, value: any) => {
    setLineItems(items =>
      items.map(item => {
        if (item.id === itemId) {
          const newItem = { ...item, [field]: value };
          return calculateLineItem(newItem, isInterState);
        }
        return item;
      })
    );
  };

  const calculateLineItem = (item: InvoiceLineItem, interState: boolean): InvoiceLineItem => {
    const baseAmount = item.quantity * item.unit_price;
    const discountAmount = (baseAmount * item.discount_percent) / 100;
    const taxableAmount = baseAmount - discountAmount;
    const gstRate = Number(item.gst_rate);

    let cgst = 0, sgst = 0, igst = 0;
    if (interState) {
      igst = (taxableAmount * gstRate) / 100;
    } else {
      cgst = (taxableAmount * gstRate) / 200;
      sgst = (taxableAmount * gstRate) / 200;
    }

    return {
      ...item,
      taxable_amount: taxableAmount,
      cgst_amount: cgst,
      sgst_amount: sgst,
      igst_amount: igst,
      total_amount: taxableAmount + cgst + sgst + igst,
    };
  };

  const recalculateAllItems = (items: InvoiceLineItem[], interState: boolean) => {
    setLineItems(items.map(item => calculateLineItem(item, interState)));
  };

  const addLineItem = () => {
    setLineItems([...lineItems, createEmptyLineItem()]);
  };

  const removeLineItem = (itemId: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== itemId));
    }
  };

  const calculateTotals = () => {
    return lineItems.reduce(
      (acc, item) => ({
        subtotal: acc.subtotal + item.taxable_amount,
        cgst: acc.cgst + item.cgst_amount,
        sgst: acc.sgst + item.sgst_amount,
        igst: acc.igst + item.igst_amount,
        totalTax: acc.totalTax + item.cgst_amount + item.sgst_amount + item.igst_amount,
        total: acc.total + item.total_amount,
      }),
      { subtotal: 0, cgst: 0, sgst: 0, igst: 0, totalTax: 0, total: 0 }
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const generateInvoiceNumber = async () => {
    if (!businessProfile) return 'INV-001';
    const prefix = businessProfile.invoice_prefix || 'INV';
    const counter = businessProfile.invoice_counter || 1;
    return `${prefix}-${String(counter).padStart(3, '0')}`;
  };

  const handleSubmit = async () => {
    if (!selectedCustomer) {
      toast.error('Please select a customer');
      return;
    }
    if (lineItems.every(item => !item.description)) {
      toast.error('Please add at least one line item');
      return;
    }

    setSaving(true);
    try {
      const customer = customers.find(c => c.id === selectedCustomer);
      const invoiceNumber = await generateInvoiceNumber();
      const totals = calculateTotals();

      const invoiceData = {
        business_id: profile!.business_id,
        customer_id: selectedCustomer,
        invoice_number: invoiceNumber,
        invoice_type: invoiceType as any,
        invoice_date: invoiceDate,
        due_date: dueDate || null,
        place_of_supply: (customer?.state || null) as any,
        is_inter_state: isInterState,
        subtotal: totals.subtotal,
        cgst_amount: totals.cgst,
        sgst_amount: totals.sgst,
        igst_amount: totals.igst,
        total_tax: totals.totalTax,
        total_amount: totals.total,
        notes: notes || null,
        terms: terms || null,
        created_by: user!.id,
        status: 'draft' as any,
      };

      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([invoiceData])
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Insert line items
      const itemsData = lineItems
        .filter(item => item.description)
        .map(item => ({
          invoice_id: invoice.id,
          product_id: item.product_id || null,
          description: item.description,
          hsn_sac_code: item.hsn_sac_code || null,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          discount_percent: item.discount_percent,
          taxable_amount: item.taxable_amount,
          gst_rate: item.gst_rate as any,
          cgst_amount: item.cgst_amount,
          sgst_amount: item.sgst_amount,
          igst_amount: item.igst_amount,
          total_amount: item.total_amount,
        }));

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsData as any);

      if (itemsError) throw itemsError;

      // Update invoice counter
      await supabase
        .from('business_profiles')
        .update({ invoice_counter: (businessProfile?.invoice_counter || 1) + 1 })
        .eq('id', profile!.business_id);

      toast.success('Invoice created successfully');
      navigate('/invoices');
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      toast.error(error.message || 'Failed to create invoice');
    } finally {
      setSaving(false);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/invoices')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create Invoice</h1>
          <p className="text-muted-foreground">Generate a new GST-compliant invoice</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Customer *</Label>
                  <Select value={selectedCustomer} onValueChange={handleCustomerChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Invoice Type</Label>
                  <Select value={invoiceType} onValueChange={setInvoiceType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INVOICE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Invoice Date</Label>
                  <Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
              </div>

              {isInterState && (
                <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
                  Inter-state transaction - IGST will be applied
                </div>
              )}
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Line Items</CardTitle>
              <Button variant="outline" size="sm" onClick={addLineItem}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Product/Service</TableHead>
                      <TableHead>HSN/SAC</TableHead>
                      <TableHead className="w-20">Qty</TableHead>
                      <TableHead className="w-24">Rate</TableHead>
                      <TableHead className="w-20">GST %</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Select value={item.product_id} onValueChange={(v) => handleProductChange(item.id, v)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.hsn_sac_code}
                            onChange={(e) => handleLineItemChange(item.id, 'hsn_sac_code', e.target.value)}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            value={item.quantity}
                            onChange={(e) => handleLineItemChange(item.id, 'quantity', Number(e.target.value))}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => handleLineItemChange(item.id, 'unit_price', Number(e.target.value))}
                          />
                        </TableCell>
                        <TableCell>
                          <Select value={item.gst_rate} onValueChange={(v) => handleLineItemChange(item.id, 'gst_rate', v)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {GST_RATES.map((rate) => (
                                <SelectItem key={rate.value} value={rate.value}>
                                  {rate.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.total_amount)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLineItem(item.id)}
                            disabled={lineItems.length === 1}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Notes to customer..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Terms & Conditions</Label>
                <Textarea
                  placeholder="Payment terms, warranty info, etc."
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>
                {isInterState ? (
                  <div className="flex justify-between text-sm">
                    <span>IGST</span>
                    <span>{formatCurrency(totals.igst)}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>CGST</span>
                      <span>{formatCurrency(totals.cgst)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>SGST</span>
                      <span>{formatCurrency(totals.sgst)}</span>
                    </div>
                  </>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-lg">{formatCurrency(totals.total)}</span>
                </div>
              </div>

              <Button className="w-full" onClick={handleSubmit} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Invoice
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
