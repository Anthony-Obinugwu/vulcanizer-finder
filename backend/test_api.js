const API_URL = 'http://localhost:3001';
const ADMIN_PIN = '2006';

async function runTests() {
  console.log('🚀 Starting API Comprehensive Tests...');

  try {
    // 1. Create a STATIC Artisan (Vulcanizer)
    console.log('\n--- 1. Testing STATIC Artisan Creation ---');
    const staticRes = await fetch(`${API_URL}/api/artisans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-pin': ADMIN_PIN
      },
      body: JSON.stringify({
        business_name: 'Test Static Vulcanizer',
        owner_name: 'Tester',
        phone: '08012345678',
        latitude: 6.5244,
        longitude: 3.3792, // Central Lagos
        address: 'Test Address',
        services: ['Tire Pump'],
        category: 'vulcanizer',
        mobility_type: 'STATIC'
      })
    });
    const staticData = await staticRes.json();
    if (!staticRes.ok) throw new Error(`Static Creation Failed: ${JSON.stringify(staticData)}`);
    console.log('✅ STATIC Artisan created successfully.');

    // 2. Create a MOBILE Artisan (Barber) with hotspots
    console.log('\n--- 2. Testing MOBILE Artisan Creation ---');
    const mobileRes = await fetch(`${API_URL}/api/artisans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-pin': ADMIN_PIN
      },
      body: JSON.stringify({
        business_name: 'Test Mobile Barber',
        owner_name: 'Mobile Tester',
        phone: '08087654321',
        latitude: 6.5300,
        longitude: 3.3800, // Slightly offset
        address: 'Wandering',
        services: ['Haircut'],
        category: 'barber',
        mobility_type: 'MOBILE',
        sound_signal: 'Bell',
        hotspots: [
          { location_name: 'Hotspot A', lat: 6.5250, lng: 3.3790, start_time: '08:00', end_time: '12:00' }
        ]
      })
    });
    const mobileData = await mobileRes.json();
    if (!mobileRes.ok) throw new Error(`Mobile Creation Failed: ${JSON.stringify(mobileData)}`);
    console.log('✅ MOBILE Artisan and hotspots created successfully.');

    // 3. Fetch Nearby Artisans (Default Filter)
    console.log('\n--- 3. Testing Nearby Fetch (All Categories) ---');
    const fetchRes1 = await fetch(`${API_URL}/api/artisans/nearby?lat=6.5244&lng=3.3792&radius=5`);
    const fetch1Data = await fetchRes1.json();
    if (!fetchRes1.ok) throw new Error(`Fetch Nearby Failed: ${JSON.stringify(fetch1Data)}`);
    
    const hasStatic = fetch1Data.some(a => a.business_name === 'Test Static Vulcanizer');
    const hasMobile = fetch1Data.some(a => a.business_name === 'Test Mobile Barber');
    
    if (hasStatic && hasMobile) {
      console.log(`✅ Fetch returned both Test STATIC and MOBILE artisans. Total results: ${fetch1Data.length}`);
    } else {
      throw new Error('Fetch Nearby missing created test artisans.');
    }

    // 4. Fetch Nearby Artisans (Category Filter: barber)
    console.log('\n--- 4. Testing Nearby Fetch (Filter: Barber) ---');
    const fetchRes2 = await fetch(`${API_URL}/api/artisans/nearby?lat=6.5244&lng=3.3792&radius=5&category=barber`);
    const fetch2Data = await fetchRes2.json();
    if (!fetchRes2.ok) throw new Error(`Fetch Filtered Failed: ${JSON.stringify(fetch2Data)}`);
    
    const allBarbers = fetch2Data.every(a => a.category === 'barber');
    if (fetch2Data.length > 0 && allBarbers) {
      console.log(`✅ Category filter works. Returned ${fetch2Data.length} barbers.`);
    } else {
      throw new Error('Category filtering failed or returned non-barbers.');
    }

    // 5. Check Mobile Artisan Hotspots Format
    console.log('\n--- 5. Testing Hotspots Format for Mobile Artisan ---');
    const testMobile = fetch2Data.find(a => a.business_name === 'Test Mobile Barber');
    if (testMobile && Array.isArray(testMobile.hotspots) && testMobile.hotspots.length > 0) {
      console.log('✅ Mobile Artisan contains formatted hotspots JSON array:', testMobile.hotspots.map(h => h.location_name));
    } else {
      throw new Error('Mobile Artisan missing hotspots array.');
    }

    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! The APIs and Database logic are solid.');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    process.exit(1);
  }
}

runTests();
