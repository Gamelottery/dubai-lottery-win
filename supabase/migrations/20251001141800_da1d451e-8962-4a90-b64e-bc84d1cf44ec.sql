-- Insert demo user accounts into auth.users (requires manual setup)
-- For now, let's create profiles directly for testing

-- First, let's insert some test profiles that can be linked later
-- We'll use fake UUIDs for testing (these should be replaced with real auth.users IDs)

-- Insert admin profile
INSERT INTO public.profiles (id, user_id, name, phone, balance, user_type)
VALUES 
  (gen_random_uuid(), gen_random_uuid(), 'Admin User', '09750397287', 100000, 'admin');

-- Insert regular users
INSERT INTO public.profiles (id, user_id, name, phone, balance, user_type)
VALUES 
  (gen_random_uuid(), gen_random_uuid(), 'Aung Aung', '09123456789', 50000, 'user'),
  (gen_random_uuid(), gen_random_uuid(), 'Mya Mya', '09987654321', 30000, 'user');