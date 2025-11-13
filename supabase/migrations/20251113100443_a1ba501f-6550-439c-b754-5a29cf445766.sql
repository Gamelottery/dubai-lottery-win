-- Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Admins can view all notifications
CREATE POLICY "Admins can view all notifications"
ON public.notifications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id::text = auth.uid()::text
    AND profiles.user_type = 'admin'
  )
);

-- Admins can update notifications (mark as read)
CREATE POLICY "Admins can update notifications"
ON public.notifications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id::text = auth.uid()::text
    AND profiles.user_type = 'admin'
  )
);

-- Create function to send notification on new user registration
CREATE OR REPLACE FUNCTION public.notify_admin_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (type, title, message, user_id)
  VALUES (
    'new_user',
    'အသုံးပြုသူအသစ်',
    'အသုံးပြုသူအသစ် ' || NEW.name || ' (' || NEW.phone || ') အကောున့်ဖွင့်ပြီးပါပြီ',
    NEW.user_id
  );
  RETURN NEW;
END;
$$;

-- Trigger to notify admins when new profile is created
CREATE TRIGGER on_profile_created_notify_admin
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_new_user();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;