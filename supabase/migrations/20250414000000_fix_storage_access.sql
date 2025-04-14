-- 既存のRLSポリシーを無効化してから再設定します
BEGIN;

-- ストレージバケットのセキュリティを設定
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーをすべて削除
DROP POLICY IF EXISTS "Allow public read access to lgtm-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to lgtm-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads to lgtm-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to delete from lgtm-images" ON storage.objects;

-- 新しいポリシーを作成：公開読み取りアクセス
CREATE POLICY "Allow public read access to lgtm-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'lgtm-images');

-- 新しいポリシーを作成：匿名ユーザーのアップロード許可
CREATE POLICY "Allow public uploads to lgtm-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'lgtm-images');

-- 新しいポリシーを作成：管理者による削除権限
CREATE POLICY "Allow admins to delete from lgtm-images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'lgtm-images' AND
  (EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email IN ('admin@example.com')))
);

COMMIT;
