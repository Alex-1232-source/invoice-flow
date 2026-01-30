import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Vendor } from '@/types/database';
import { INDIAN_STATES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const vendorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format').optional().or(z.literal('')),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format').optional().or(z.literal('')),
  address_line1: z.string().max(200).optional().or(z.literal('')),
  address_line2: z.string().max(200).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, 'Invalid pincode').optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  is_active: z.boolean(),
});

type VendorFormData = z.infer<typeof vendorSchema>;

interface VendorFormProps {
  vendor?: Vendor | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function VendorForm({ vendor, onSuccess, onCancel }: VendorFormProps) {
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: vendor?.name || '',
      gstin: vendor?.gstin || '',
      pan: vendor?.pan || '',
      address_line1: vendor?.address_line1 || '',
      address_line2: vendor?.address_line2 || '',
      city: vendor?.city || '',
      state: vendor?.state || '',
      pincode: vendor?.pincode || '',
      phone: vendor?.phone || '',
      email: vendor?.email || '',
      is_active: vendor?.is_active ?? true,
    },
  });

  const onSubmit = async (data: VendorFormData) => {
    if (!profile?.business_id) {
      toast.error('Please set up your business profile first');
      return;
    }

    setIsLoading(true);
    try {
      const vendorData = {
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
        is_active: data.is_active,
        business_id: profile.business_id,
      };

      if (vendor) {
        const { error } = await supabase
          .from('vendors')
          .update(vendorData)
          .eq('id', vendor.id);

        if (error) throw error;
        toast.success('Vendor updated successfully');
      } else {
        const { error } = await supabase
          .from('vendors')
          .insert([vendorData]);

        if (error) throw error;
        toast.success('Vendor added successfully');
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving vendor:', error);
      toast.error(error.message || 'Failed to save vendor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Vendor Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter vendor name" {...field} />
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
                  <Input type="email" placeholder="vendor@example.com" {...field} />
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
                  <Input placeholder="City" {...field} />
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
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Active Status</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Inactive vendors won't appear in dropdowns
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {vendor ? 'Update Vendor' : 'Add Vendor'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
