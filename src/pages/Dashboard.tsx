import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  Users,
  IndianRupee,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { INVOICE_STATUSES } from '@/lib/constants';

interface DashboardStats {
  totalInvoices: number;
  totalCustomers: number;
  totalRevenue: number;
  pendingAmount: number;
  recentInvoices: any[];
  overdueCount: number;
}

export default function Dashboard() {
  const { profile, canModify } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalInvoices: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    pendingAmount: 0,
    recentInvoices: [],
    overdueCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.business_id) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [profile?.business_id]);

  const fetchDashboardData = async () => {
    try {
      // Fetch invoices
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('*, customer:customers(name)')
        .order('created_at', { ascending: false })
        .limit(5);

      if (invoicesError) throw invoicesError;

      // Fetch customers count
      const { count: customersCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      // Calculate stats from invoices
      const { data: allInvoices } = await supabase
        .from('invoices')
        .select('total_amount, amount_paid, status');

      const totalRevenue = allInvoices?.reduce((sum, inv) => sum + Number(inv.amount_paid || 0), 0) || 0;
      const pendingAmount = allInvoices?.reduce((sum, inv) => {
        if (inv.status !== 'paid' && inv.status !== 'cancelled') {
          return sum + (Number(inv.total_amount || 0) - Number(inv.amount_paid || 0));
        }
        return sum;
      }, 0) || 0;
      const overdueCount = allInvoices?.filter(inv => inv.status === 'overdue').length || 0;

      setStats({
        totalInvoices: allInvoices?.length || 0,
        totalCustomers: customersCount || 0,
        totalRevenue,
        pendingAmount,
        recentInvoices: invoices || [],
        overdueCount,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  const getStatusBadge = (status: string) => {
    const statusConfig = INVOICE_STATUSES.find(s => s.value === status);
    return (
      <Badge className={statusConfig?.color || 'bg-gray-100 text-gray-800'}>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  // Show onboarding if no business profile
  if (!loading && !profile?.business_id) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mb-2 text-2xl font-bold">Welcome to GST Invoice Tracker</h2>
          <p className="mb-6 text-muted-foreground">
            Set up your business profile to start creating invoices and managing your billing.
          </p>
          <Button onClick={() => navigate('/settings')} size="lg">
            Set Up Business Profile
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your business</p>
        </div>
        {canModify && (
          <Button onClick={() => navigate('/invoices/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalInvoices}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                <p className="text-xs text-muted-foreground">Active customers</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Collected</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">Total payments received</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(stats.pendingAmount)}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.overdueCount > 0 && (
                    <span className="text-destructive">
                      {stats.overdueCount} overdue
                    </span>
                  )}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>Your latest invoices</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/invoices')}>
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : stats.recentInvoices.length > 0 ? (
            <div className="space-y-4">
              {stats.recentInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50 cursor-pointer"
                  onClick={() => navigate(`/invoices/${invoice.id}`)}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{invoice.invoice_number}</span>
                      {getStatusBadge(invoice.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {invoice.customer?.name} • {formatDistanceToNow(new Date(invoice.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(invoice.total_amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">No invoices yet</p>
              {canModify && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate('/invoices/new')}
                >
                  Create your first invoice
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {canModify && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="cursor-pointer transition-colors hover:bg-muted/50" onClick={() => navigate('/invoices/new')}>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Create Invoice</h3>
                <p className="text-sm text-muted-foreground">Generate a new GST invoice</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-colors hover:bg-muted/50" onClick={() => navigate('/customers')}>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Manage Customers</h3>
                <p className="text-sm text-muted-foreground">Add or edit customer details</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-colors hover:bg-muted/50" onClick={() => navigate('/reports')}>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">View Reports</h3>
                <p className="text-sm text-muted-foreground">GST summary and analytics</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
