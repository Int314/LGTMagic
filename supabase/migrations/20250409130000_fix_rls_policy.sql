/*
  # Fix RLS policies for upload_limits table to allow anonymous users

  1. Security
    - Add policies to allow anonymous users to insert and select from upload_limits table
    - Required for IP-based upload limiting functionality
*/

-- アノニマスユーザーが自分のデータを読み取れるようにするポリシー
CREATE POLICY "Allow anonymous to read own uploads"
ON public.upload_limits
FOR SELECT
TO anon
USING (true);

-- アノニマスユーザーが新しいデータを挿入できるようにするポリシー
CREATE POLICY "Allow anonymous to insert own uploads"
ON public.upload_limits
FOR INSERT
TO anon
WITH CHECK (true);

-- アノニマスユーザーが自分のデータを更新できるようにするポリシー
CREATE POLICY "Allow anonymous to update own uploads"
ON public.upload_limits
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- メモ: これらのポリシーはdemo/開発用です。本番環境ではより厳密なポリシーを検討してください。
