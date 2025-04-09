/*
  # Create storage bucket for LGTM images

  1. Storage
    - Create a new public bucket for storing LGTM images
    - Enable public access to the bucket
*/

-- Create a new storage bucket for LGTM images
INSERT INTO storage.buckets (id, name, public)
VALUES ('lgtm-images', 'lgtm-images', true);

-- Set up security policies for the bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'lgtm-images');

CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'lgtm-images');