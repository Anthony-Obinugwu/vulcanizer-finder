const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn('Supabase credentials missing. API will return mock data.');
}

app.post('/api/vulcanizers/nearby', async (req, res) => {
  const { latitude, longitude, radius_km = 10 } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'Latitude and longitude are required.' });
  }

  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('get_nearest_vulcanizers', {
        user_lat: latitude,
        user_lon: longitude,
        radius_km: radius_km
      });

      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error('Error fetching vulcanizers:', error);
      res.status(500).json({ error: 'Failed to fetch vulcanizers' });
    }
  } else {
    // Return mock data for development
    const mockData = [
      {
        id: '1',
        business_name: 'Mike Vulcanizer',
        rating: 4.7,
        is_open: true,
        distance_meters: 400,
        services: ['Tire Pump', 'Tire Repair', 'Tube Replacement'],
        latitude: latitude + 0.003,
        longitude: longitude + 0.003,
        phone: '+2348000000001'
      },
      {
        id: '2',
        business_name: 'Goodluck Tyres',
        rating: 4.5,
        is_open: true,
        distance_meters: 800,
        services: ['Tire Repair', 'Wheel Alignment'],
        latitude: latitude - 0.005,
        longitude: longitude - 0.005,
        phone: '+2348000000002'
      },
      {
        id: '3',
        business_name: 'Kings Vulcanizing',
        rating: 4.2,
        is_open: false,
        distance_meters: 1200,
        services: ['Tire Pump'],
        latitude: latitude + 0.008,
        longitude: longitude - 0.002,
        phone: '+2348000000003'
      }
    ];
    // Sort mock data by distance
    mockData.sort((a, b) => a.distance_meters - b.distance_meters);
    
    // Simulate network delay
    setTimeout(() => res.json(mockData), 500);
  }
});

app.listen(port, () => {
  console.log(`Vulcanizer Finder API running on port ${port}`);
});
