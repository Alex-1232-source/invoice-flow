import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Product } from '@/types/database';
import { GST_RATES, UNITS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  description: z.string().max(500).optional().or(z.literal('')),
  hsn_sac_code: z.string().max(20).optional().or(z.literal('')),
  unit: z.string().min(1, 'Please select a unit'),
  unit_price: z.coerce.number().min(0, 'Price must be positive'),
  gst_rate: z.enum(['0', '5', '12', '18', '28']),
  is_service: z.boolean(),
  is_active: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      hsn_sac_code: product?.hsn_sac_code || '',
      unit: product?.unit || 'NOS',
      unit_price: product?.unit_price || 0,
      gst_rate: product?.gst_rate || '18',
      is_service: product?.is_service ?? false,
      is_active: product?.is_active ?? true,
    },
  });

  const isService = form.watch('is_service');

  const onSubmit = async (data: ProductFormData) => {
    if (!profile?.business_id) {
      toast.error('Please set up your business profile first');
      return;
    }

    setIsLoading(true);
    try {
      const productData = {
        name: data.name,
        description: data.description || null,
        hsn_sac_code: data.hsn_sac_code || null,
        unit: data.unit,
        unit_price: data.unit_price,
        gst_rate: data.gst_rate as any,
        is_service: data.is_service,
        is_active: data.is_active,
        business_id: profile.business_id,
      };

      if (product) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (error) throw error;
        toast.success('Product updated successfully');
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        toast.success('Product added successfully');
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error(error.message || 'Failed to save product');
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
                <FormLabel>Product/Service Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product or service name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Brief description of the product/service"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_service"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4 md:col-span-2">
                <div className="space-y-0.5">
                  <FormLabel>Is this a Service?</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Services use SAC codes, Products use HSN codes
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

          <FormField
            control={form.control}
            name="hsn_sac_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{isService ? 'SAC Code' : 'HSN Code'}</FormLabel>
                <FormControl>
                  <Input placeholder={isService ? '998311' : '8471'} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {UNITS.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
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
            name="unit_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit Price (₹) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gst_rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GST Rate *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select GST rate" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {GST_RATES.map((rate) => (
                      <SelectItem key={rate.value} value={rate.value}>
                        {rate.label}
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
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Active Status</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Inactive products won't appear in dropdowns
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
            {product ? 'Update Product' : 'Add Product'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
