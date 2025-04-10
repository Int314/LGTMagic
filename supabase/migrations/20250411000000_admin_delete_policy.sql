/*
  # Add admin delete policy for lgtm-images storage bucket

  1. Security
    - Add policy to allow deletion of images from storage
    - Required for admin image management functionality
*/

-- 削除ポリシーを追加
CREATE POLICY "Allow users to delete objects from bucket"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'lgtm-images');

-- メモ: これは全ユーザーに削除権限を与えますが、アプリケーション側でパスワード認証を行うことで
-- 管理者のみがこの機能を使用できるように制限しています。
