-- ============================================================================
-- STORAGE POLICIES FOR TRUEBITE
-- ============================================================================

-- Create the food-scans storage bucket
-- 10MB file size limit (10485760 bytes)
-- Allowed MIME types: image/jpeg, image/png, image/webp
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'food-scans',
    'food-scans',
    TRUE,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 1. INSERT Policy
-- Users can upload files to their own folder (folder name = user_id)
CREATE POLICY "Users can upload scan images" ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'food-scans' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 2. SELECT Policy
-- Users can view files in their own folder
CREATE POLICY "Users can view their own scan images" ON storage.objects
FOR SELECT
USING (
    bucket_id = 'food-scans' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. DELETE Policy
-- Users can delete files in their own folder
CREATE POLICY "Users can delete their own scan images" ON storage.objects
FOR DELETE
USING (
    bucket_id = 'food-scans' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);
