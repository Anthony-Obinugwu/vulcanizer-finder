-- Create the storage bucket for contributors
INSERT INTO storage.buckets (id, name, public) 
VALUES ('contributors', 'contributors', true)
ON CONFLICT (id) DO NOTHING;

-- Set up policies for public access
-- Anyone can view the images
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'contributors');

-- Note: We do not need an upload policy for the frontend since the backend will upload
-- using the service role key which bypasses RLS policies entirely.
