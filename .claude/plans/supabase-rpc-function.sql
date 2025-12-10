-- Supabase RPC Function for Geographical Course Search
-- Run this in the Supabase SQL Editor

CREATE OR REPLACE FUNCTION get_courses_near_location(
  user_lat DOUBLE PRECISION,
  user_lon DOUBLE PRECISION,
  max_distance_miles INTEGER DEFAULT 100,
  search_term TEXT DEFAULT NULL,
  page_number INTEGER DEFAULT 1,
  page_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  location JSON,
  distance_miles DOUBLE PRECISION,
  active BOOLEAN,
  image_url TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  addr_line_1 TEXT,
  addr_line_2 TEXT,
  description TEXT,
  amenities TEXT[],
  holes INTEGER,
  rating DOUBLE PRECISION,
  site_url TEXT,
  facebook TEXT,
  instagram TEXT,
  operating_hours JSON,
  timezone TEXT,
  booking_window_days INTEGER,
  max_tee_players INTEGER,
  tee_slot_interval INTEGER,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
AS $$
  WITH courses_with_distance AS (
    SELECT
      c.id,
      c.name,
      c.city,
      c.state,
      c.country,
      c.location,
      (
        3958.8 * acos(
          LEAST(1.0,
            cos(radians(user_lat)) * cos(radians((c.location->>'latitude')::DOUBLE PRECISION)) *
            cos(radians((c.location->>'longitude')::DOUBLE PRECISION) - radians(user_lon)) +
            sin(radians(user_lat)) * sin(radians((c.location->>'latitude')::DOUBLE PRECISION))
          )
        )
      ) AS distance_miles,
      c.active,
      c.image_url,
      c.phone,
      c.email,
      c.address,
      c.addr_line_1,
      c.addr_line_2,
      c.description,
      c.amenities,
      c.holes,
      c.rating,
      c.site_url,
      c.facebook,
      c.instagram,
      c.operating_hours,
      c.timezone,
      c.booking_window_days,
      c.max_tee_players,
      c.tee_slot_interval,
      c.created_at
    FROM courses c
    WHERE
      c.active = true
      AND c.location IS NOT NULL
      AND (c.location->>'latitude') IS NOT NULL
      AND (c.location->>'longitude') IS NOT NULL
      AND (search_term IS NULL OR c.name ILIKE '%' || search_term || '%')
  )
  SELECT
    cwd.id,
    cwd.name,
    cwd.city,
    cwd.state,
    cwd.country,
    cwd.location,
    cwd.distance_miles,
    cwd.active,
    cwd.image_url,
    cwd.phone,
    cwd.email,
    cwd.address,
    cwd.addr_line_1,
    cwd.addr_line_2,
    cwd.description,
    cwd.amenities,
    cwd.holes,
    cwd.rating,
    cwd.site_url,
    cwd.facebook,
    cwd.instagram,
    cwd.operating_hours,
    cwd.timezone,
    cwd.booking_window_days,
    cwd.max_tee_players,
    cwd.tee_slot_interval,
    cwd.created_at
  FROM courses_with_distance cwd
  WHERE cwd.distance_miles <= max_distance_miles
  ORDER BY cwd.distance_miles ASC
  LIMIT page_limit
  OFFSET (page_number - 1) * page_limit;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_courses_near_location TO authenticated;
GRANT EXECUTE ON FUNCTION get_courses_near_location TO anon;
