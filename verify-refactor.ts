import 'dotenv/config';
import { lockStreamSession } from './server/services/streamSessionLock.service.js';
import { signStreamUrl } from './server/services/signedStreamUrl.service.js';

async function test() {
    console.log('--- Testing Session Lock ---');
    const user1 = 'user123';
    const cid1 = 'chan1';
    const plan = 'PRO'; // limit 5

    // 1. Acquire first lock
    const lock1 = await lockStreamSession(user1, cid1, plan);
    console.log('Lock 1 (New):', lock1); // Expected: true

    // 2. Refresh same lock
    const lock2 = await lockStreamSession(user1, cid1, plan);
    console.log('Lock 2 (Same Stream):', lock2); // Expected: true

    // 3. Try different stream (within limit)
    const lock3 = await lockStreamSession(user1, 'chan2', plan);
    console.log('Lock 3 (New Stream - within limit):', lock3); // Expected: true

    console.log('\n--- Testing URL Signing ---');
    const ip1 = '1.1.1.1';
    const nonce = 'test-nonce-123';
    
    const signed = signStreamUrl(user1, cid1, ip1, nonce);
    console.log('Signed Data:', signed);
}

test().catch(console.error);
