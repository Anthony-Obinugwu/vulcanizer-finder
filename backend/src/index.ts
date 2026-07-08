import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Restrict CORS to specific frontend domain in production
// We remove any trailing slashes just in case it was accidentally included in the dashboard
const rawFrontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const frontendUrl = rawFrontendUrl.replace(/\/$/, '');
const allowedOrigins = [frontendUrl];

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

const supabaseUrl = process.env.SUPABASE_URL || '';
// Use the service role key to bypass RLS since we verify the admin pin in our backend
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: { transport: WebSocket as any }
});

app.get('/api/vulcanizers/nearby', async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Missing lat or lng query parameters.' });
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);
    // Default radius is 5km if not provided
    const radius_km = radius ? parseFloat(radius as string) : 5;

    // Call the PostGIS RPC function created in Supabase
    const { data, error } = await supabase.rpc('find_nearby_vulcanizers', {
      user_lat: latitude,
      user_lng: longitude,
      radius_km: radius_km
    });

    if (error) {
      console.error('Supabase RPC Error:', error);
      return res.status(500).json({ error: 'Database query failed.' });
    }

    res.json(data);
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/vulcanizers', async (req, res) => {
  try {
    const adminPin = req.headers['x-admin-pin'];
    
    if (!process.env.ADMIN_PIN) {
      return res.status(500).json({ error: 'Server misconfiguration: ADMIN_PIN not set.' });
    }

    if (adminPin !== process.env.ADMIN_PIN) {
      return res.status(401).json({ error: 'Unauthorized: Invalid Admin PIN' });
    }

    const { business_name, owner_name, phone, latitude, longitude, address, services } = req.body;

    if (!business_name || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Missing required fields: business_name, latitude, or longitude.' });
    }

    const { data, error } = await supabase.from('vulcanizers').insert([{
      business_name,
      owner_name,
      phone,
      latitude,
      longitude,
      address,
      services: services || [],
      is_open: true,
      verified: false,
      rating: 0.0
    }]).select();

    if (error) {
      console.error('Supabase Insert Error:', error);
      return res.status(500).json({ error: 'Failed to insert into database.' });
    }

    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.listen(port, () => {
  console.log(`Backend API running at http://localhost:${port}`);
});
