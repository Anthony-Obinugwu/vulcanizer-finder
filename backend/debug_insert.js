const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
  realtime: { transport: WebSocket }
});

async function testInsert() {
  const { data, error } = await supabase.from('artisans').insert([{
    business_name: 'Debug Artisan',
    owner_name: 'Tester',
    phone: '08012345678',
    latitude: 6.5244,
    longitude: 3.3792,
    address: 'Test Address',
    services: ['Tire Pump'],
    category: 'vulcanizer',
    mobility_type: 'STATIC',
    sound_signal: null,
    is_open: true,
    verified: false,
    rating: 0.0
  }]).select().single();

  if (error) {
    console.error('Supabase Insert Error:', error);
  } else {
    console.log('Success:', data);
  }
}

testInsert();
