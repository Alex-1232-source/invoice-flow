import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { BusinessProfile } from '@/types/database';
import { INDIAN_STATES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Building2, User, Settings as SettingsIcon } from 'lucide-react';
import { toast } from 'sonner';

const businessSchema = z.object({
  name: z.string().min(2, 'Business name is required').max(200),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format').optional().or(z.literal('')),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format').optional().or(z.literal('')),
  address_line1: z.string().max(200).optional().or(z.literal('')),
  address_line2: z.string().max(200).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, 'Invalid pincode').optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  bank_name: z.string().max(100).optional().or(z.literal('')),
  bank_account_number: z.string().max(30).optional().or(z.literal('')),
  bank_ifsc: z.string().max(20).optional().or(z.literal('')),
  invoice_prefix: z.string().max(10).optional().or(z.literal('')),
});

type BusinessFormData = z.infer<typeof businessSchema>;

export default function Settings() {
  const { profile, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);

  const form = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: '',
      gstin: '',
      pan: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      pincode: '',
      phone: '',
      email: '',
      bank_name: '',
      bank_account_number: '',
      bank_ifsc: '',
      invoice_prefix: 'INV',
    },
  });

  useEffect(() => {
    if (profile?.business_id) {
      fetchBusinessProfile();
    } else {
      setLoading(false);
    }
  }, [profile?.business_id]);

  const fetchBusinessProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('id', profile!.business_id)
        .single();

      if (error) throw error;

      setBusinessProfile(data as BusinessProfile);
      form.reset({
        name: data.name || '',
        gstin: data.gstin || '',
        pan: data.pan || '',
        address_line1: data.address_line1 || '',
        address_line2: data.address_line2 || '',
        city: data.city || '',
        state: data.state || '',
        pincode: data.pincode || '',
        phone: data.phone || '',
        email: data.email || '',
        bank_name: data.bank_name || '',
        bank_account_number: data.bank_account_number || '',
        bank_ifsc: data.bank_ifsc || '',
        invoice_prefix: data.invoice_prefix || 'INV',
      });
    } catch (error) {
      console.error('Error fetching business profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: BusinessFormData) => {
    setSaving(true);
    try {
      const businessData = {
        name: data.name,
        gstin: data.gstin || null,
        pan: data.pan || null,
        address_line1: data.address_line1 || null,
        address_line2: data.address_line2 || null,
        city: data.city || null,
        state: (data.state || null) as any,
        pincode: data.pincode || null,
        phone: data.phone || null,
        email: data.email || null,
        bank_name: data.bank_name || null,
        bank_account_number: data.bank_account_number || null,
        bank_ifsc: data.bank_ifsc || null,
        invoice_prefix: data.invoice_prefix || 'INV',
      };

      if (businessProfile) {
        const { error } = await supabase
          .from('business_profiles')
          .update(businessData)
          .eq('id', businessProfile.id);

        if (error) throw error;
        toast.success('Business profile updated successfully');
      } else {
        const { data: newBusiness, error: insertError } = await supabase
          .from('business_profiles')
          .insert([businessData])
          .select()
          .single();

        if (insertError) throw insertError;

        // Update user profile with business_id
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ business_id: newBusiness.id })
          .eq('id', user!.id);

        if (updateError) throw updateError;

        setBusinessProfile(newBusiness as BusinessProfile);
        toast.success('Business profile created successfully');
        
        // Refresh the page to update auth context
        window.location.reload();
      }
    } catch (error: any) {
      console.error('Error saving business profile:', error);
      toast.error(error.message || 'Failed to save business profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your business profile and preferences</p>
      </div>

      <Tabs defaultValue="business" className="space-y-4">
        <TabsList>
          <TabsTrigger value="business">
            <Building2 className="mr-2 h-4 w-4" />
            Business Profile
          </TabsTrigger>
          <TabsTrigger value="account">
            <User className="mr-2 h-4 w-4" />
            Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                This information will appear on your invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Business Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Your Company Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="gstin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>GSTIN</FormLabel>
                            <FormControl>
                              <Input placeholder="22AAAAA0000A1Z5" {...field} className="uppercase" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="pan"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PAN</FormLabel>
                            <FormControl>
                              <Input placeholder="AAAAA0000A" {...field} className="uppercase" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="business@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="+91 9876543210" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address_line1"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Address Line 1</FormLabel>
                            <FormControl>
                              <Input placeholder="Street address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address_line2"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Address Line 2</FormLabel>
                            <FormControl>
                              <Input placeholder="Apartment, suite, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="Mumbai" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select state" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {INDIAN_STATES.map((state) => (
                                  <SelectItem key={state.code} value={state.code}>
                                    {state.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="pincode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pincode</FormLabel>
                            <FormControl>
                              <Input placeholder="400001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="invoice_prefix"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Invoice Prefix</FormLabel>
                            <FormControl>
                              <Input placeholder="INV" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="mb-4 text-lg font-medium">Bank Details</h3>
                      <div className="grid gap-4 md:grid-cols-3">
                        <FormField
                          control={form.control}
                          name="bank_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bank Name</FormLabel>
                              <FormControl>
                                <Input placeholder="HDFC Bank" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="bank_account_number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Account Number</FormLabel>
                              <FormControl>
                                <Input placeholder="1234567890" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="bank_ifsc"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>IFSC Code</FormLabel>
                              <FormControl>
                                <Input placeholder="HDFC0001234" {...field} className="uppercase" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {businessProfile ? 'Update Profile' : 'Create Profile'}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your personal account details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
                <div className="grid gap-2">
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-muted-foreground">{profile?.full_name || 'Not set'}</p>
                </div>
                <div className="grid gap-2">
                  <p className="text-sm font-medium">Role</p>
                  <p className="capitalize text-muted-foreground">{profile?.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
