-- 1. Rename table and adjust sequences if necessary
ALTER TABLE vulcanizers RENAME TO artisans;

-- 2. Add new columns for Street Artisan Finder
ALTER TABLE artisans
ADD COLUMN category TEXT DEFAULT 'vulcanizer',
ADD COLUMN mobility_type TEXT DEFAULT 'STATIC',
ADD COLUMN sound_signal TEXT,
ADD COLUMN is_active_today BOOLEAN DEFAULT true,
ADD COLUMN last_ping_location geography(Point, 4326),
ADD COLUMN last_ping_time TIMESTAMPTZ;

-- 3. Backfill existing data
UPDATE artisans 
SET category = 'vulcanizer', mobility_type = 'STATIC';

-- 4. Create Hotspots Table for Mobile Artisans
CREATE TABLE artisan_hotspots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id UUID REFERENCES artisans(id) ON DELETE CASCADE,
  location_name TEXT,
  location geography(Point, 4326) NOT NULL,
  start_time TIME,
  end_time TIME,
  days_active JSONB DEFAULT '[]'::jsonb
);

-- 5. Create Routes Table (Optional, for future use)
CREATE TABLE artisan_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id UUID REFERENCES artisans(id) ON DELETE CASCADE,
  route_name TEXT,
  path_geometry geography(LineString, 4326) NOT NULL
);

-- 6. Create indexes for spatial queries
CREATE INDEX idx_artisans_location ON artisans USING GIST ((st_setsrid(st_makepoint(longitude, latitude), 4326)::geography));
CREATE INDEX idx_artisans_last_ping ON artisans USING GIST (last_ping_location);
CREATE INDEX idx_hotspots_location ON artisan_hotspots USING GIST (location);
CREATE INDEX idx_artisans_category ON artisans(category);

-- 7. Drop old RPC and create new aggregated RPC
DROP FUNCTION IF EXISTS find_nearby_vulcanizers(float, float, float);

CREATE OR REPLACE FUNCTION find_nearby_artisans(
  user_lat float, 
  user_lng float, 
  radius_km float,
  filter_category text DEFAULT NULL,
  filter_mobility text DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  business_name TEXT,
  owner_name TEXT,
  phone TEXT,
  latitude FLOAT,
  longitude FLOAT,
  address TEXT,
  is_open BOOLEAN,
  rating FLOAT,
  services JSONB,
  category TEXT,
  mobility_type TEXT,
  sound_signal TEXT,
  distance_km FLOAT,
  hotspots JSONB
) AS $$
DECLARE
  user_point geography := st_setsrid(st_makepoint(user_lng, user_lat), 4326)::geography;
  radius_m float := radius_km * 1000;
BEGIN
  RETURN QUERY
  WITH nearby_static AS (
    SELECT 
      a.id,
      st_distance(st_setsrid(st_makepoint(a.longitude, a.latitude), 4326)::geography, user_point) / 1000 AS dist
    FROM artisans a
    WHERE a.mobility_type = 'STATIC'
      AND st_dwithin(st_setsrid(st_makepoint(a.longitude, a.latitude), 4326)::geography, user_point, radius_m)
  ),
  nearby_mobile_hotspots AS (
    SELECT 
      ah.artisan_id AS id,
      st_distance(ah.location, user_point) / 1000 AS dist,
      jsonb_agg(
        jsonb_build_object(
          'id', ah.id,
          'location_name', ah.location_name,
          'start_time', ah.start_time,
          'end_time', ah.end_time,
          'lat', st_y(ah.location::geometry),
          'lng', st_x(ah.location::geometry)
        )
      ) AS active_hotspots
    FROM artisan_hotspots ah
    WHERE st_dwithin(ah.location, user_point, radius_m)
    GROUP BY ah.artisan_id, ah.location
  ),
  nearby_mobile_ping AS (
    SELECT 
      a.id,
      st_distance(a.last_ping_location, user_point) / 1000 AS dist
    FROM artisans a
    WHERE a.mobility_type = 'MOBILE'
      AND a.last_ping_location IS NOT NULL
      AND st_dwithin(a.last_ping_location, user_point, radius_m)
  ),
  combined_ids AS (
    SELECT ns.id, ns.dist, '[]'::jsonb AS hotspots FROM nearby_static ns
    UNION ALL
    SELECT nmh.id, nmh.dist, nmh.active_hotspots FROM nearby_mobile_hotspots nmh
    UNION ALL
    SELECT nmp.id, nmp.dist, '[]'::jsonb AS hotspots FROM nearby_mobile_ping nmp
  ),
  unique_nearby AS (
    SELECT 
      c.id, 
      MIN(c.dist) AS min_dist,
      jsonb_agg(elements) FILTER (WHERE elements IS NOT NULL) AS all_hotspots
    FROM combined_ids c
    LEFT JOIN LATERAL jsonb_array_elements(c.hotspots) AS elements ON true
    GROUP BY c.id
  )
  SELECT 
    a.id,
    a.business_name,
    a.owner_name,
    a.phone,
    a.latitude,
    a.longitude,
    a.address,
    a.is_open,
    a.rating,
    -- Convert string array to JSONB if it was a character varying[] type, or just pass it if it's already JSONB.
    -- Assuming services is text[] in old DB based on seed, let's coerce to jsonb:
    to_jsonb(a.services) AS services,
    a.category,
    a.mobility_type,
    a.sound_signal,
    u.min_dist AS distance_km,
    COALESCE(u.all_hotspots, '[]'::jsonb) AS hotspots
  FROM unique_nearby u
  JOIN artisans a ON a.id = u.id
  WHERE (filter_category IS NULL OR filter_category = 'all' OR a.category = filter_category)
    AND (filter_mobility IS NULL OR filter_mobility = 'all' OR a.mobility_type = filter_mobility)
  ORDER BY u.min_dist ASC;
END;
$$ LANGUAGE plpgsql;
