require('dotenv').config({path: '.env'});
const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
  realtime: { transport: WebSocket }
});

async function seed() {
  const dummyArtisans = [
    {
      business_name: 'Oga Chinedu Tyres',
      phone: '+2348123456789',
      latitude: 6.5240,
      longitude: 3.3785,
      address: 'Yaba Market Rd, Lagos',
      is_open: true,
      rating: 4.6,
      services: ['Tire Pump', 'Tube Patching', 'Wheel Alignment'],
      category: 'vulcanizer',
      mobility_type: 'STATIC'
    },
    {
      business_name: 'Musa Mobile Tailor',
      phone: '+2348123456790',
      latitude: 6.5260, 
      longitude: 3.3770, 
      address: 'Herbert Macaulay Way, Yaba',
      is_open: true,
      rating: 4.8,
      services: ['Trouser Hemming', 'Shirt Adjustment'],
      category: 'tailor',
      mobility_type: 'MOBILE',
      sound_signal: 'Iron scissors clicking'
    },
    {
      business_name: 'Goodluck Cobbler',
      phone: '+2348123456791',
      latitude: 6.5230, 
      longitude: 3.3810, 
      address: 'Unilag Gate Area, Lagos',
      is_open: true,
      rating: 4.9,
      services: ['Shoe Polishing', 'Heel Repair'],
      category: 'cobbler',
      mobility_type: 'STATIC'
    },
    {
      business_name: 'Aboki Nails',
      phone: '+2348123456792',
      latitude: 6.5225, 
      longitude: 3.3795, 
      address: 'Sabo Roundabout, Yaba',
      is_open: true,
      rating: 4.5,
      services: ['Manicure', 'Pedicure'],
      category: 'nail_cutter',
      mobility_type: 'MOBILE',
      sound_signal: 'Metal clinking'
    },
    {
      business_name: 'Fresh Fade Barbers',
      phone: '+2348123456793',
      latitude: 6.5280, 
      longitude: 3.3820, 
      address: 'Akoka, Lagos',
      is_open: true,
      rating: 4.7,
      services: ['Haircut', 'Beard Trim'],
      category: 'barber',
      mobility_type: 'STATIC'
    }
  ];

  console.log("Clearing old data...");
  await supabase.from('artisan_hotspots').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('artisans').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log("Inserting new artisans...");
  const { data: insertedArtisans, error } = await supabase.from('artisans').insert(dummyArtisans).select();

  if (error) {
    console.error("Error inserting artisans:", error);
    return;
  }
  
  const mobileTailor = insertedArtisans.find(a => a.business_name === 'Musa Mobile Tailor');
  const nailCutter = insertedArtisans.find(a => a.business_name === 'Aboki Nails');
  
  const dummyHotspots = [];

  if (mobileTailor) {
    dummyHotspots.push(
      {
        artisan_id: mobileTailor.id,
        location_name: 'Yaba Tech Gate',
        location: 'POINT(3.3765 6.5275)',
        start_time: '08:00:00',
        end_time: '12:00:00',
        days_active: ['Mon', 'Wed', 'Fri']
      },
      {
        artisan_id: mobileTailor.id,
        location_name: 'E-Center Mall',
        location: 'POINT(3.3790 6.5255)',
        start_time: '13:00:00',
        end_time: '17:00:00',
        days_active: ['Mon', 'Wed', 'Fri']
      }
    );
  }

  if (nailCutter) {
    dummyHotspots.push(
      {
        artisan_id: nailCutter.id,
        location_name: 'Ozone Cinemas',
        location: 'POINT(3.3805 6.5235)',
        start_time: '09:00:00',
        end_time: '18:00:00',
        days_active: ['Tue', 'Thu', 'Sat']
      }
    );
  }
    
  if (dummyHotspots.length > 0) {
    const { error: hotspotError } = await supabase.from('artisan_hotspots').insert(dummyHotspots);
    if (hotspotError) {
      console.error("Error inserting hotspots:", hotspotError);
    } else {
       console.log("Successfully seeded mobile hotspots!");
    }
  }

  console.log("✅ Successfully seeded rich dummy data in Lagos!");
}

seed();
