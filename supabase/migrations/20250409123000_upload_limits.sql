/*
  # Create upload limits table for IP-based rate limiting

  1. Storage
    - Create a new table for tracking upload counts by IP address
    - Enable RLS policies for security
*/

-- Create table for tracking uploads by IP address
CREATE TABLE IF NOT EXISTS public.upload_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address TEXT NOT NULL,
    upload_date DATE NOT NULL DEFAULT CURRENT_DATE,
    upload_count INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(ip_address, upload_date)
);

-- Enable row level security
ALTER TABLE public.upload_limits ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting records
CREATE POLICY "Allow service role to manage upload_limits"
ON public.upload_limits
TO service_role
USING (true)
WITH CHECK (true);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_upload_limits_updated_at
BEFORE UPDATE ON public.upload_limits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
