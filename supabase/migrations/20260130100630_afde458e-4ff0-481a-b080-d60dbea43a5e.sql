-- =====================================================
-- GST INVOICE TRACKER - DATABASE SCHEMA
-- =====================================================

-- 1. Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'accountant', 'viewer');

-- 2. Indian states enum for GST
CREATE TYPE public.indian_state AS ENUM (
  'AN', 'AP', 'AR', 'AS', 'BR', 'CH', 'CT', 'DD', 'DL', 'GA',
  'GJ', 'HP', 'HR', 'JH', 'JK', 'KA', 'KL', 'LA', 'LD', 'MH',
  'ML', 'MN', 'MP', 'MZ', 'NL', 'OD', 'PB', 'PY', 'RJ', 'SK',
  'TN', 'TS', 'TR', 'UK', 'UP', 'WB'
);

-- 3. Invoice status enum
CREATE TYPE public.invoice_status AS ENUM ('draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled');

-- 4. Invoice type enum
CREATE TYPE public.invoice_type AS ENUM ('tax_invoice', 'bill_of_supply', 'credit_note', 'debit_note');

-- 5. GST rate enum
CREATE TYPE public.gst_rate AS ENUM ('0', '5', '12', '18', '28');

-- =====================================================
-- TABLES
-- =====================================================

-- Business Profile table (company details for invoices)
CREATE TABLE public.business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  gstin TEXT,
  pan TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state public.indian_state,
  pincode TEXT,
  phone TEXT,
  email TEXT,
  bank_name TEXT,
  bank_account_number TEXT,
  bank_ifsc TEXT,
  invoice_prefix TEXT DEFAULT 'INV',
  invoice_counter INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles table (user profiles linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role public.app_role NOT NULL DEFAULT 'viewer',
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles table (for complex role management)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Customers table
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  gstin TEXT,
  pan TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state public.indian_state,
  pincode TEXT,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendors table
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  gstin TEXT,
  pan TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state public.indian_state,
  pincode TEXT,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  hsn_sac_code TEXT,
  unit TEXT DEFAULT 'NOS',
  unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  gst_rate public.gst_rate NOT NULL DEFAULT '18',
  is_service BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices table
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE RESTRICT NOT NULL,
  invoice_number TEXT NOT NULL,
  invoice_type public.invoice_type NOT NULL DEFAULT 'tax_invoice',
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  place_of_supply public.indian_state,
  is_inter_state BOOLEAN DEFAULT FALSE,
  subtotal DECIMAL(12,2) DEFAULT 0,
  cgst_amount DECIMAL(12,2) DEFAULT 0,
  sgst_amount DECIMAL(12,2) DEFAULT 0,
  igst_amount DECIMAL(12,2) DEFAULT 0,
  total_tax DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) DEFAULT 0,
  amount_paid DECIMAL(12,2) DEFAULT 0,
  status public.invoice_status DEFAULT 'draft',
  notes TEXT,
  terms TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice items table
CREATE TABLE public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT,
  description TEXT NOT NULL,
  hsn_sac_code TEXT,
  quantity DECIMAL(12,3) NOT NULL DEFAULT 1,
  unit TEXT DEFAULT 'NOS',
  unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  taxable_amount DECIMAL(12,2) DEFAULT 0,
  gst_rate public.gst_rate NOT NULL DEFAULT '18',
  cgst_amount DECIMAL(12,2) DEFAULT 0,
  sgst_amount DECIMAL(12,2) DEFAULT 0,
  igst_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment records table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT,
  reference_number TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get user's business ID
CREATE OR REPLACE FUNCTION public.get_user_business_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT business_id FROM public.profiles WHERE id = auth.uid()
$$;

-- Get user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS public.app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- Check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Check if user can modify data (admin or accountant)
CREATE OR REPLACE FUNCTION public.can_modify_data()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'accountant')
  )
$$;

-- Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
$$;

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Business Profiles policies
CREATE POLICY "Users can view their business profile"
  ON public.business_profiles FOR SELECT
  TO authenticated
  USING (id = public.get_user_business_id());

CREATE POLICY "Admins can update their business profile"
  ON public.business_profiles FOR UPDATE
  TO authenticated
  USING (id = public.get_user_business_id() AND public.is_admin())
  WITH CHECK (id = public.get_user_business_id() AND public.is_admin());

CREATE POLICY "Admins can insert business profile"
  ON public.business_profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin() OR NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND business_id IS NOT NULL));

-- Profiles policies
CREATE POLICY "Users can view profiles in their business"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (business_id = public.get_user_business_id() OR id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "New users can insert their profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- User roles policies
CREATE POLICY "Users can view roles in their business"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = user_roles.user_id
      AND p.business_id = public.get_user_business_id()
    )
  );

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Customers policies
CREATE POLICY "Users can view customers in their business"
  ON public.customers FOR SELECT
  TO authenticated
  USING (business_id = public.get_user_business_id());

CREATE POLICY "Admin and accountant can insert customers"
  ON public.customers FOR INSERT
  TO authenticated
  WITH CHECK (business_id = public.get_user_business_id() AND public.can_modify_data());

CREATE POLICY "Admin and accountant can update customers"
  ON public.customers FOR UPDATE
  TO authenticated
  USING (business_id = public.get_user_business_id() AND public.can_modify_data())
  WITH CHECK (business_id = public.get_user_business_id() AND public.can_modify_data());

CREATE POLICY "Admin can delete customers"
  ON public.customers FOR DELETE
  TO authenticated
  USING (business_id = public.get_user_business_id() AND public.is_admin());

-- Vendors policies
CREATE POLICY "Users can view vendors in their business"
  ON public.vendors FOR SELECT
  TO authenticated
  USING (business_id = public.get_user_business_id());

CREATE POLICY "Admin and accountant can insert vendors"
  ON public.vendors FOR INSERT
  TO authenticated
  WITH CHECK (business_id = public.get_user_business_id() AND public.can_modify_data());

CREATE POLICY "Admin and accountant can update vendors"
  ON public.vendors FOR UPDATE
  TO authenticated
  USING (business_id = public.get_user_business_id() AND public.can_modify_data())
  WITH CHECK (business_id = public.get_user_business_id() AND public.can_modify_data());

CREATE POLICY "Admin can delete vendors"
  ON public.vendors FOR DELETE
  TO authenticated
  USING (business_id = public.get_user_business_id() AND public.is_admin());

-- Products policies
CREATE POLICY "Users can view products in their business"
  ON public.products FOR SELECT
  TO authenticated
  USING (business_id = public.get_user_business_id());

CREATE POLICY "Admin and accountant can insert products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (business_id = public.get_user_business_id() AND public.can_modify_data());

CREATE POLICY "Admin and accountant can update products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (business_id = public.get_user_business_id() AND public.can_modify_data())
  WITH CHECK (business_id = public.get_user_business_id() AND public.can_modify_data());

CREATE POLICY "Admin can delete products"
  ON public.products FOR DELETE
  TO authenticated
  USING (business_id = public.get_user_business_id() AND public.is_admin());

-- Invoices policies
CREATE POLICY "Users can view invoices in their business"
  ON public.invoices FOR SELECT
  TO authenticated
  USING (business_id = public.get_user_business_id());

CREATE POLICY "Admin and accountant can insert invoices"
  ON public.invoices FOR INSERT
  TO authenticated
  WITH CHECK (business_id = public.get_user_business_id() AND public.can_modify_data());

CREATE POLICY "Admin and accountant can update invoices"
  ON public.invoices FOR UPDATE
  TO authenticated
  USING (business_id = public.get_user_business_id() AND public.can_modify_data())
  WITH CHECK (business_id = public.get_user_business_id() AND public.can_modify_data());

CREATE POLICY "Admin can delete invoices"
  ON public.invoices FOR DELETE
  TO authenticated
  USING (business_id = public.get_user_business_id() AND public.is_admin());

-- Invoice items policies
CREATE POLICY "Users can view invoice items for their invoices"
  ON public.invoice_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.business_id = public.get_user_business_id()
    )
  );

CREATE POLICY "Admin and accountant can insert invoice items"
  ON public.invoice_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.business_id = public.get_user_business_id()
    ) AND public.can_modify_data()
  );

CREATE POLICY "Admin and accountant can update invoice items"
  ON public.invoice_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.business_id = public.get_user_business_id()
    ) AND public.can_modify_data()
  );

CREATE POLICY "Admin can delete invoice items"
  ON public.invoice_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.business_id = public.get_user_business_id()
    ) AND public.is_admin()
  );

-- Payments policies
CREATE POLICY "Users can view payments for their invoices"
  ON public.payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = payments.invoice_id
      AND invoices.business_id = public.get_user_business_id()
    )
  );

CREATE POLICY "Admin and accountant can insert payments"
  ON public.payments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = payments.invoice_id
      AND invoices.business_id = public.get_user_business_id()
    ) AND public.can_modify_data()
  );

CREATE POLICY "Admin and accountant can update payments"
  ON public.payments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = payments.invoice_id
      AND invoices.business_id = public.get_user_business_id()
    ) AND public.can_modify_data()
  );

CREATE POLICY "Admin can delete payments"
  ON public.payments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = payments.invoice_id
      AND invoices.business_id = public.get_user_business_id()
    ) AND public.is_admin()
  );

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
CREATE TRIGGER update_business_profiles_updated_at
  BEFORE UPDATE ON public.business_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- PROFILE CREATION TRIGGER
-- =====================================================

-- Automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'admin'
  );
  
  -- Also add to user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'admin');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();