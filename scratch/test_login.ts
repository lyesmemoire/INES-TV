import fetch from 'node-fetch';

async function test() {
  try {
    // 1. Login
    const res = await fetch('http://localhost:3000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@INES TV.com', password: 'password123' })
    });
    
    if (!res.ok) {
      console.log('Login failed:', res.status, await res.text());
      return;
    }
    
    const data: any = await res.json();
    console.log('Login success, token:', data.token);
    
    // 2. Fetch Ads Summary
    const resAds = await fetch('http://localhost:3000/api/admin/ads-summary', {
      headers: { 'Authorization': `Bearer ${data.token}` }
    });
    
    console.log('Ads Summary Status:', resAds.status);
    console.log('Ads Summary Response:', await resAds.text());
    
  } catch (err) {
    console.error('Test error:', err);
  }
}

test();
