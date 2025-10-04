-- Make receipts bucket public so images can be viewed
UPDATE storage.buckets 
SET public = true 
WHERE id = 'receipts';