import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { EventSource } = require('eventsource');

const url = 'http://localhost:3000/api/metrics/stream?api_key=production_stress_test_key';
const key = process.env.OPS_API_KEY || 'production_stress_test_key';

console.log("Connecting to:", url);
console.log("With key:", key);

const es = new EventSource(url, {
  headers: {
    'x-api-key': key
  }
});

es.onopen = () => console.log("Connection opened");
es.onmessage = (e: any) => {
  console.log("Message:", e.data);
  process.exit(0);
};
es.onerror = (e: any) => {
  console.error('Error:', e.message || e);
  process.exit(1);
};

setTimeout(() => {
  console.log('Timeout');
  process.exit(1);
}, 15000);
