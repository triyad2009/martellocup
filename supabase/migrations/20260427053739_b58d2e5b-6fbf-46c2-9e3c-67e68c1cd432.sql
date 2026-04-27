-- Jersey products (admin-managed catalog)
CREATE TABLE public.jersey_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text,
  price numeric NOT NULL DEFAULT 0,
  delivery_charge numeric NOT NULL DEFAULT 0,
  available_sizes text[] NOT NULL DEFAULT ARRAY['S','M','L','XL','XXL']::text[],
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.jersey_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jersey products public read" ON public.jersey_products
  FOR SELECT USING (is_active OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));
CREATE POLICY "jersey products admin all" ON public.jersey_products
  FOR ALL USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'))
  WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));
CREATE TRIGGER jersey_products_updated_at BEFORE UPDATE ON public.jersey_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Jersey orders
CREATE TABLE public.jersey_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.jersey_products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  delivery_address text NOT NULL,
  jersey_print_name text NOT NULL,
  jersey_number integer,
  size text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  delivery_charge numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.jersey_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit jersey order" ON public.jersey_orders
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view jersey orders" ON public.jersey_orders
  FOR SELECT USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update jersey orders" ON public.jersey_orders
  FOR UPDATE USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete jersey orders" ON public.jersey_orders
  FOR DELETE USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'admin'));
CREATE TRIGGER jersey_orders_updated_at BEFORE UPDATE ON public.jersey_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Link payment_submissions to jersey orders
ALTER TABLE public.payment_submissions
  ADD COLUMN jersey_order_id uuid REFERENCES public.jersey_orders(id) ON DELETE SET NULL;