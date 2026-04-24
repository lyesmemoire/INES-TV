import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const ES = require('eventsource');
console.log("Type:", typeof ES);
console.log("Keys:", Object.keys(ES));
console.log("ES:", ES);
if (ES.EventSource) console.log("Has ES.EventSource");
