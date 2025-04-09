/*
  # Update storage bucket policies

  1. Changes
    - Allow public uploads to lgtm-images bucket
    - Remove authentication requirement for uploads

  2. Security
    - Enables public access for both reading and uploading images
    - Note: This is appropriate for this use case since LGTM images are meant to be public
*/

-- Drop the authenticated-only policy
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;

-- Create a new policy allowing public uploads
CREATE POLICY "Public can upload images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'lgtm-images');