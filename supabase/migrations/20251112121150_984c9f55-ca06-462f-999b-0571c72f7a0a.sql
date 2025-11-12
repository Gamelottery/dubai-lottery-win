-- Enable full replica identity for profiles table to capture all column changes
ALTER TABLE public.profiles REPLICA IDENTITY FULL;