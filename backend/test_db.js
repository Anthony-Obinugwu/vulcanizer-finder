require('dotenv').config({path: '.env'});
const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
  realtime: { transport: WebSocket }
});

async function run() {
  const { data, error } = await supabase.from('vulcanizers').select('*');
  console.log("Data:", data);
  console.log("Error:", error);
}
run();
