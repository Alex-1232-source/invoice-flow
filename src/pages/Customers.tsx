import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '@/types/database';
import { INDIAN_STATES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { CustomerForm } from '@/components/forms/CustomerForm';

export default function Customers() {
  const { profile, canModify, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  useEffect(() => {
    if (profile?.business_id) {
      fetchCustomers();
    }
  }, [profile?.business_id]);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');

      if (error) throw error;
      setCustomers(data as Customer[]);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!customerToDelete) return;

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerToDelete.id);

      if (error) throw error;

      setCustomers(customers.filter(c => c.id !== customerToDelete.id));
      toast.success('Customer deleted successfully');
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      if (error.message?.includes('violates foreign key constraint')) {
        toast.error('Cannot delete customer with existing invoices');
      } else {
        toast.error('Failed to delete customer');
      }
    } finally {
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    }
  };

  const getStateName = (code: string | null) => {
    if (!code) return '-';
    return INDIAN_STATES.find(s => s.code === code)?.name || code;
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.gstin?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingCustomer(null);
    fetchCustomers();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground">Manage your customer database</p>
        </div>
        {canModify && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        )}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or GSTIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
          <CardDescription>
            {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          ) : filteredCustomers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>GSTIN</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Status</TableHead>
                  {canModify && <TableHead className="w-12"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {customer.gstin || '-'}
                    </TableCell>
                    <TableCell>{customer.email || '-'}</TableCell>
                    <TableCell>{customer.phone || '-'}</TableCell>
                    <TableCell>{getStateName(customer.state)}</TableCell>
                    <TableCell>
                      <Badge variant={customer.is_active ? 'default' : 'secondary'}>
                        {customer.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    {canModify && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingCustomer(customer);
                                setShowForm(true);
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            {isAdmin && (
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  setCustomerToDelete(customer);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">
                {searchQuery ? 'No customers match your search' : 'No customers yet'}
              </p>
              {canModify && !searchQuery && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setShowForm(true)}
                >
                  Add your first customer
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Form Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => {
        setShowForm(open);
        if (!open) setEditingCustomer(null);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            </DialogTitle>
            <DialogDescription>
              {editingCustomer
                ? 'Update customer information'
                : 'Add a new customer to your database'}
            </DialogDescription>
          </DialogHeader>
          <CustomerForm
            customer={editingCustomer}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowForm(false);
              setEditingCustomer(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{customerToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
