import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Restrict CORS to specific frontend domain in production
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
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

app.listen(port, () => {
  console.log(`Backend API running at http://localhost:${port}`);
});
