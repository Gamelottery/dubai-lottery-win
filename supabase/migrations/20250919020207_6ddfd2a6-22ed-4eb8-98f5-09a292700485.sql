-- Fix security issues

-- 1. Add RLS policies for tables that don't have them
CREATE POLICY "Anyone can read KL Lottery"
ON public."KL Lottery"
FOR SELECT
USING (true);

CREATE POLICY "Anyone can read MM2D"
ON public."MM2D"
FOR SELECT
USING (true);

CREATE POLICY "Anyone can read Myanmar lotterymm"  
ON public."Myanmar lotterymm"
FOR SELECT
USING (true);

CREATE POLICY "Anyone can read Test"
ON public."Test"
FOR SELECT
USING (true);

-- 2. Fix function search path
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, phone, balance, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    0,
    'user'
  );
  RETURN NEW;
END;
$$;