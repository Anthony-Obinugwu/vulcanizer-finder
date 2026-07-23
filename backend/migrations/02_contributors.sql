-- Create contributors table
CREATE TABLE IF NOT EXISTS contributors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Note: We do not need RLS for public read access since we're using service roles or anon keys,
-- but if RLS is enabled, you would need to add a policy for reading.
-- ALTER TABLE contributors ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public read access" ON contributors FOR SELECT USING (true);
