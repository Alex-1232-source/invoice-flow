import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, IndianRupee, TrendingUp, FileText } from 'lucide-react';

interface GstSummary {
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalTax: number;
  totalSales: number;
}

export default function Reports() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [gstSummary, setGstSummary] = useState<GstSummary>({
    totalCgst: 0,
    totalSgst: 0,
    totalIgst: 0,
    totalTax: 0,
    totalSales: 0,
  });

  useEffect(() => {
    if (profile?.business_id) {
      fetchReportData();
    }
  }, [profile?.business_id]);

  const fetchReportData = async () => {
    try {
      const { data: invoices } = await supabase
        .from('invoices')
        .select('subtotal, cgst_amount, sgst_amount, igst_amount, total_tax, total_amount, status')
        .neq('status', 'cancelled');

      if (invoices) {
        const summary = invoices.reduce(
          (acc, inv) => ({
            totalCgst: acc.totalCgst + Number(inv.cgst_amount || 0),
            totalSgst: acc.totalSgst + Number(inv.sgst_amount || 0),
            totalIgst: acc.totalIgst + Number(inv.igst_amount || 0),
            totalTax: acc.totalTax + Number(inv.total_tax || 0),
            totalSales: acc.totalSales + Number(inv.total_amount || 0),
          }),
          { totalCgst: 0, totalSgst: 0, totalIgst: 0, totalTax: 0, totalSales: 0 }
        );
        setGstSummary(summary);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground">GST summaries and business analytics</p>
      </div>

      <Tabs defaultValue="gst" className="space-y-4">
        <TabsList>
          <TabsTrigger value="gst">GST Summary</TabsTrigger>
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
        </TabsList>

        <TabsContent value="gst" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CGST Collected</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-2xl font-bold">{formatCurrency(gstSummary.totalCgst)}</div>
                )}
                <p className="text-xs text-muted-foreground">Central GST</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">SGST Collected</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-2xl font-bold">{formatCurrency(gstSummary.totalSgst)}</div>
                )}
                <p className="text-xs text-muted-foreground">State GST</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">IGST Collected</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-2xl font-bold">{formatCurrency(gstSummary.totalIgst)}</div>
                )}
                <p className="text-xs text-muted-foreground">Integrated GST</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tax</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-2xl font-bold">{formatCurrency(gstSummary.totalTax)}</div>
                )}
                <p className="text-xs text-muted-foreground">All GST combined</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>GST Breakdown</CardTitle>
              <CardDescription>Summary of GST collected across all invoices</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">CGST (Central GST)</p>
                      <p className="text-sm text-muted-foreground">Intra-state transactions</p>
                    </div>
                    <p className="text-xl font-bold">{formatCurrency(gstSummary.totalCgst)}</p>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">SGST (State GST)</p>
                      <p className="text-sm text-muted-foreground">Intra-state transactions</p>
                    </div>
                    <p className="text-xl font-bold">{formatCurrency(gstSummary.totalSgst)}</p>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">IGST (Integrated GST)</p>
                      <p className="text-sm text-muted-foreground">Inter-state transactions</p>
                    </div>
                    <p className="text-xl font-bold">{formatCurrency(gstSummary.totalIgst)}</p>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
                    <div>
                      <p className="font-semibold">Total GST Liability</p>
                    </div>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(gstSummary.totalTax)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Summary</CardTitle>
              <CardDescription>Overview of your sales performance</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-32 w-full" />
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-2 text-lg font-semibold">Total Sales</p>
                    <p className="text-3xl font-bold text-primary">{formatCurrency(gstSummary.totalSales)}</p>
                    <p className="text-sm text-muted-foreground">All invoices (excluding cancelled)</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
