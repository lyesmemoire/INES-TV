// Quick parser test with sample M3U data
function parseM3U(content) {
  const lines = content.split("\n");
  const channels = [];
  let current = null;
  for (let line of lines) {
    line = line.trim();
    if (line.startsWith("#EXTINF")) {
      const name = line.split(",")[1];
      current = { name };
    }
    if (line.startsWith("http") && current) {
      current.url = line;
      current.type = "M3U8";
      channels.push(current);
      current = null;
    }
  }
  return channels;
}

const sample = `#EXTM3U
#EXTINF:-1,France 24
https://stream.france24.com/live.m3u8
#EXTINF:-1,BBC News
https://bbc.stream/live.m3u8
#EXTINF:-1 tvg-logo="logo.png" group-title="Sports",beIN Sports 1
https://bein1.stream/hls.m3u8
#EXTINF:-1 tvg-id="TV5" tvg-name="TV5Monde" tvg-logo="https://logo.tv5.png" group-title="French",TV5 Monde
https://tv5monde.stream/live.m3u8`;

const result = parseM3U(sample);
console.log("✅ Parser test - Parsed:", result.length, "channels\n");
result.forEach((ch, i) => console.log(`  [${i}]`, JSON.stringify(ch)));

console.log("\n--- SCHEMA COMPARISON ---");
console.log("Parser output fields:", Object.keys(result[0]));
console.log("Supabase 'streams' table: { name, url, type } → ✅ MATCH");
console.log("Supabase 'Channel' table: { id, name, logo, category, streamUrl, isActive } → ❌ MISMATCH");
console.log("\n⚠️  PROBLEM: M3U imports go to 'streams' table but homepage reads from 'Channel' table!");
