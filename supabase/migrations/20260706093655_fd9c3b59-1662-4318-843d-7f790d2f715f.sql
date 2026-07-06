
-- Fix search_path so SECURITY DEFINER functions can find pgcrypto (gen_salt, crypt, digest, gen_random_bytes)
ALTER FUNCTION public.admin_create_portal_credential(TEXT,TEXT,TEXT,TEXT) SET search_path = public, extensions;
ALTER FUNCTION public.admin_set_portal_credential_active(UUID,BOOLEAN) SET search_path = public, extensions;
ALTER FUNCTION public.portal_login(TEXT,TEXT,TEXT) SET search_path = public, extensions;
ALTER FUNCTION public.portal_validate_token(TEXT) SET search_path = public, extensions;
ALTER FUNCTION public.portal_list_income(TEXT) SET search_path = public, extensions;
