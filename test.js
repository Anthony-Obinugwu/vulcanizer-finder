require('dotenv').config({path: './backend/.env'});
const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
  realtime: { transport: WebSocket }
});

async function run() {
  const { data, error } = await supabase.rpc('find_nearby_vulcanizers', {
      user_lat: 6.52,
      user_lng: 3.37,
      radius_km: 10
  });
  console.log("Data:", data);
  console.log("Error:", error);
}
run();
