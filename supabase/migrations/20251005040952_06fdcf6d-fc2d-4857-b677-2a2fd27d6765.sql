-- Add foreign key relationship between bets and profiles
ALTER TABLE bets 
ADD CONSTRAINT bets_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(user_id) 
ON DELETE CASCADE;