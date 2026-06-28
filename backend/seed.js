require('dotenv').config({path: '.env'});
const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
  realtime: { transport: WebSocket }
});

async function seed() {
  const dummyVulcanizers = [
    {
      business_name: 'Ibadan Tyres & Co',
      phone: '+2348123456789',
      latitude: 7.3780, // slightly off from 7.3775
      longitude: 3.9480, // slightly off from 3.9470
      address: 'Bodija Market Rd, Ibadan',
      is_open: true,
      rating: 4.6,
      services: ['Tire Pump', 'Tube Patching', 'Wheel Alignment']
    },
    {
      business_name: 'Oyo State Auto Repair',
      phone: '+2348123456790',
      latitude: 7.3750, 
      longitude: 3.9450, 
      address: 'Ring Road, Ibadan',
      is_open: true,
      rating: 4.2,
      services: ['Tire Pump', 'Full Tire Replacement']
    },
    {
      business_name: 'Late Night Vulcanizer',
      phone: '+2348123456791',
      latitude: 7.3850, 
      longitude: 3.9350, 
      address: 'UI Gate Area, Ibadan',
      is_open: false,
      rating: 4.9,
      services: ['Emergency Repair']
    }
  ];

  const { data, error } = await supabase.from('vulcanizers').insert(dummyVulcanizers);

  if (error) {
    console.error("Error inserting data:", error);
  } else {
    console.log("Successfully seeded 3 vulcanizers near Ibadan!");
  }
}

seed();
