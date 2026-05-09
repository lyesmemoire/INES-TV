import 'dotenv/config';

async function testModule(path: string) {
  console.log(`[Diagnostic] Testing: ${path}...`);
  try {
    await import(path);
    console.log(`[Diagnostic] ✓ ${path} OK`);
  } catch (err: any) {
    console.error(`[Diagnostic] ✗ ${path} FAILED:`);
    console.error(err.stack || err.message);
  }
}

async function run() {
  console.log('\n=== INES TV Backend Diagnostics ===\n');

  // Test critical core files
  await testModule('./server/services/db.js');
  await testModule('./server/middleware/auth.js');
  await testModule('./server/middleware/geo.js');
  await testModule('./server/services/security.service.js');
  
  // Test routers
  await testModule('./server/routes/channels.js');
  await testModule('./server/routes/health.js');
  await testModule('./server/routes/auth.js');
  await testModule('./server/routes/favorites.js');
  await testModule('./server/routes/history.js');
  await testModule('./server/routes/recommendations.js');
  await testModule('./server/routes/m3u.js');
  await testModule('./server/routes/admin.js');
  await testModule('./server/routes/ads.js');
  await testModule('./server/routes/streams.js');
  await testModule('./server/routes/adsTracking.js');
  await testModule('./server/routes/admin/security.js');
  await testModule('./server/routes/admin/metrics.js');

  console.log('\nDiagnostics Complete.');
}

run();
