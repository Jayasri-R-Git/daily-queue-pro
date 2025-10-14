-- Create enum for reservation status
CREATE TYPE public.reservation_status AS ENUM ('pending', 'completed');

-- Create reservations table with linked list structure
CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  reason TEXT NOT NULL,
  status reservation_status NOT NULL DEFAULT 'pending',
  next_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  CONSTRAINT unique_datetime UNIQUE (reservation_date, reservation_time)
);

-- Enable RLS
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read reservations (for public kiosk use)
CREATE POLICY "Anyone can view reservations"
  ON public.reservations
  FOR SELECT
  USING (true);

-- Allow anyone to create reservations
CREATE POLICY "Anyone can create reservations"
  ON public.reservations
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update reservations (mark as done)
CREATE POLICY "Anyone can update reservations"
  ON public.reservations
  FOR UPDATE
  USING (true);

-- Create index for faster date/time sorting
CREATE INDEX idx_reservations_datetime ON public.reservations(reservation_date, reservation_time);
CREATE INDEX idx_reservations_status ON public.reservations(status);

-- Create function to get sorted reservations (linked list order)
CREATE OR REPLACE FUNCTION public.get_sorted_reservations()
RETURNS TABLE (
  id UUID,
  name TEXT,
  reservation_date DATE,
  reservation_time TIME,
  reason TEXT,
  status reservation_status,
  next_id UUID,
  created_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.name,
    r.reservation_date,
    r.reservation_time,
    r.reason,
    r.status,
    r.next_id,
    r.created_at,
    r.completed_at
  FROM public.reservations r
  ORDER BY r.reservation_date ASC, r.reservation_time ASC;
END;
$$;