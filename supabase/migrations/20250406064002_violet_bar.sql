/*
  # Update storage bucket policies for public read access

  1. Changes
    - Add policy for public read access to lgtm-images bucket
    - Ensure all users can view uploaded images

  2. Security
    - Enables public read access for viewing images
    - Maintains existing upload policies
*/

-- Create a new policy allowing public read access
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'lgtm-images');

-- Ensure the bucket itself is publicly accessible
UPDATE storage.buckets
SET public = true
WHERE id = 'lgtm-images';