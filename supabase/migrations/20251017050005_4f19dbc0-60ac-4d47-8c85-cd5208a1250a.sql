-- Add end_date column to reservations table to support multi-day reservations
ALTER TABLE public.reservations 
ADD COLUMN end_date DATE;

-- Set default end_date to reservation_date for existing records
UPDATE public.reservations 
SET end_date = reservation_date 
WHERE end_date IS NULL;