
-- Authenticated users can upload to feed/ and avatars/ folders
CREATE POLICY "media auth user upload feed"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media'
  AND (
    (storage.foldername(name))[1] = 'feed'
    OR (storage.foldername(name))[1] = 'avatars'
  )
);

CREATE POLICY "media auth user delete own"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'media'
  AND owner = auth.uid()
);
