import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Restrict CORS to specific frontend domain in production
// We remove any trailing slashes just in case it was accidentally included in the dashboard
const rawFrontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const frontendUrl = rawFrontendUrl.replace(/\/$/, '');
const allowedOrigins = [
  frontendUrl,
  'https://www.thesenpcs.com',
  'https://thesenpcs.com',
  'https://vulcanizer-finder.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    console.error(`[CORS BLOCK] Origin '${origin}' is not allowed. Expected: '${frontendUrl}'`);
    var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  }
}));

app.use(express.json());

// Rate limiter for the Admin creation route (max 5 requests per 15 minutes)
const adminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

const supabaseUrl = process.env.SUPABASE_URL || '';
// Use the service role key to bypass RLS since we verify the admin pin in our backend
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: { transport: WebSocket as any }
});

app.get('/api/artisans/nearby', async (req, res) => {
  try {
    const { lat, lng, radius, category, mobility } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Missing lat or lng query parameters.' });
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ error: 'Invalid lat or lng. Must be numbers.' });
    }

    // Default radius is 5km if not provided
    const radius_km = radius ? parseFloat(radius as string) : 5;

    // Call the PostGIS RPC function created in Supabase
    const { data, error } = await supabase.rpc('find_nearby_artisans', {
      user_lat: latitude,
      user_lng: longitude,
      radius_km: radius_km,
      filter_category: category || 'all',
      filter_mobility: mobility || 'all'
    });

    if (error) {
      console.error('Supabase RPC Error:', error);
      return res.status(500).json({ error: 'Database query failed.', details: error });
    }

    res.json(data);
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/artisans', adminRateLimiter, async (req, res) => {
  try {
    const adminPin = req.headers['x-admin-pin'] as string | undefined;
    
    if (!process.env.ADMIN_PIN) {
      return res.status(500).json({ error: 'Server misconfiguration: ADMIN_PIN not set.' });
    }

    if (!adminPin || adminPin.length !== process.env.ADMIN_PIN.length) {
      return res.status(401).json({ error: 'Unauthorized: Invalid Admin PIN' });
    }

    const isMatch = crypto.timingSafeEqual(
      Buffer.from(adminPin),
      Buffer.from(process.env.ADMIN_PIN)
    );

    if (!isMatch) {
      return res.status(401).json({ error: 'Unauthorized: Invalid Admin PIN' });
    }

    const { business_name, owner_name, phone, latitude, longitude, address, services, category, mobility_type, sound_signal, hotspots, rating } = req.body;

    const parsedLat = parseFloat(latitude);
    const parsedLng = parseFloat(longitude);

    if (!business_name || isNaN(parsedLat) || isNaN(parsedLng)) {
      return res.status(400).json({ error: 'Missing or invalid required fields: business_name, latitude, or longitude.' });
    }

    const { data: artisanData, error: artisanError } = await supabase.from('artisans').insert([{
      business_name,
      owner_name,
      phone,
      latitude: parsedLat,
      longitude: parsedLng,
      address,
      services: services || [],
      category: category || 'vulcanizer',
      mobility_type: mobility_type || 'STATIC',
      sound_signal: sound_signal || null,
      is_open: true,
      verified: false,
      rating: rating !== undefined ? parseFloat(rating) : 0.0
    }]).select().single();

    if (artisanError) {
      console.error('Supabase Insert Error:', artisanError);
      return res.status(500).json({ error: 'Failed to insert into database.', details: artisanError });
    }

    if (mobility_type === 'MOBILE' && hotspots && Array.isArray(hotspots) && hotspots.length > 0) {
      const hotspotsToInsert = [];
      
      for (const h of hotspots) {
        const hLat = parseFloat(h.lat);
        const hLng = parseFloat(h.lng);
        
        if (!isNaN(hLat) && !isNaN(hLng) && h.location_name && h.start_time && h.end_time) {
          hotspotsToInsert.push({
            artisan_id: artisanData.id,
            location_name: h.location_name,
            location: `POINT(${hLng} ${hLat})`,
            start_time: h.start_time,
            end_time: h.end_time,
            days_active: h.days_active || []
          });
        }
      }
      
      if (hotspotsToInsert.length > 0) {
        const { error: hotspotError } = await supabase.from('artisan_hotspots').insert(hotspotsToInsert);
        
        if (hotspotError) {
           console.error('Supabase Hotspot Insert Error:', hotspotError);
        }
      }
    }

    res.status(201).json({ success: true, data: artisanData });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.listen(port, () => {
  console.log(`Backend API running at http://localhost:${port}`);
});
