const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: { transport: WebSocket }
});

async function test() {
  console.log("Testing Supabase fetch...");
  try {
    const { data, error } = await supabase.from('artisans').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error("Supabase Error:", error);
    } else {
      console.log("Supabase Data fetched, count:", data.length);
    }
  } catch (err) {
    console.error("Caught Exception:", err);
  }
}

test();
