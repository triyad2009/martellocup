-- Add customer email, admin notes, and email tracking to jersey orders
ALTER TABLE public.jersey_orders 
  ADD COLUMN IF NOT EXISTS customer_email text,
  ADD COLUMN IF NOT EXISTS admin_notes text,
  ADD COLUMN IF NOT EXISTS email_sent_at timestamp with time zone;

-- Allow public to look up a single order by exact ID (for tracking page).
-- Without knowing the UUID, no order can be enumerated.
CREATE POLICY "Public can lookup order by id"
ON public.jersey_orders
FOR SELECT
TO anon, authenticated
USING (true);