-- Add name column to transactions table for withdrawal recipient name
ALTER TABLE public.transactions 
ADD COLUMN name text;