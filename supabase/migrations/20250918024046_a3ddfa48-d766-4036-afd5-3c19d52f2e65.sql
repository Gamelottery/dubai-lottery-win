-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  user_type TEXT NOT NULL DEFAULT 'user' CHECK (user_type IN ('user', 'vip', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table for deposits/withdrawals
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  method TEXT,
  reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bets table for betting history
CREATE TABLE public.bets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  number TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  draw_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost')),
  winning_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lottery results table
CREATE TABLE public.lottery_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  draw_time TEXT NOT NULL,
  result_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lottery_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Anyone can create profile"
ON public.profiles FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id::text = auth.uid()::text 
    AND user_type = 'admin'
  )
);

-- RLS Policies for transactions
CREATE POLICY "Users can view their own transactions" 
ON public.transactions FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own transactions" 
ON public.transactions FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Admins can view all transactions"
ON public.transactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id::text = auth.uid()::text 
    AND user_type = 'admin'
  )
);

CREATE POLICY "Admins can update all transactions"
ON public.transactions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id::text = auth.uid()::text 
    AND user_type = 'admin'
  )
);

-- RLS Policies for bets
CREATE POLICY "Users can view their own bets" 
ON public.bets FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own bets" 
ON public.bets FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Admins can view all bets"
ON public.bets FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id::text = auth.uid()::text 
    AND user_type = 'admin'
  )
);

-- RLS Policies for lottery results
CREATE POLICY "Anyone can view lottery results"
ON public.lottery_results FOR SELECT
USING (true);

CREATE POLICY "Admins can manage lottery results"
ON public.lottery_results FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id::text = auth.uid()::text 
    AND user_type = 'admin'
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert demo data
INSERT INTO public.profiles (user_id, name, phone, balance, user_type) VALUES
  ('11111111-1111-1111-1111-111111111111', 'မြန်မာလူ', '09123456789', 50000, 'user'),
  ('22222222-2222-2222-2222-222222222222', 'VIP ဖောက်သည်', '09987654321', 100000, 'vip'),
  ('33333333-3333-3333-3333-333333333333', 'Admin', '09750397287', 500000, 'admin');

-- Insert sample lottery results
INSERT INTO public.lottery_results (draw_time, result_number) VALUES
  ('12:01 PM', '45'),
  ('4:30 PM', '23'),
  ('7:00 PM', '67');