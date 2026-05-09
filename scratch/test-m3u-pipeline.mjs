// Test the complete M3U pipeline: fetch → parse → verify schema

const M3U_URL = "https://t.freetv.fun/m3u/playlist_ipv6.m3u";

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

async function main() {
  console.log("=== M3U PIPELINE TEST ===\n");
  
  // 1. FETCH
  console.log("1. Fetching M3U from:", M3U_URL);
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    
    const res = await fetch(M3U_URL, { signal: controller.signal });
    clearTimeout(timeout);
    
    if (!res.ok) {
      console.error("   ❌ HTTP Error:", res.status);
      return;
    }
    const text = await res.text();
    console.log("   ✅ Fetched:", text.length, "bytes");
    console.log("   First 200 chars:", text.substring(0, 200));
    
    // 2. PARSE
    console.log("\n2. Parsing M3U...");
    const channels = parseM3U(text);
    console.log("   ✅ Parsed:", channels.length, "channels");
    
    if (channels.length === 0) {
      console.error("   ❌ NO CHANNELS FOUND! Parser may have a bug.");
      console.log("   Raw lines sample:");
      text.split("\n").slice(0, 30).forEach((l, i) => console.log(`     [${i}] ${l.substring(0,120)}`));
      return;
    }
    
    // 3. SHOW SAMPLES
    console.log("\n3. Sample channels (first 5):");
    channels.slice(0, 5).forEach((ch, i) => {
      console.log(`   [${i}] name: "${ch.name}" | url: ${ch.url?.substring(0,80)}... | type: ${ch.type}`);
    });
    
    // 4. CHECK SCHEMA vs what Supabase Channel table expects
    console.log("\n4. Schema check:");
    console.log("   Parser outputs: { name, url, type }");
    console.log("   Supabase 'Channel' table expects: { id, name, logo, category, status, streamUrl, isActive, description }");
    console.log("   Supabase 'streams' table expects: { name, url, type }");
    console.log("");
    
    const sample = channels[0];
    const hasName = !!sample.name;
    const hasUrl = !!sample.url;
    const hasType = !!sample.type;
    
    console.log("   ✅ name:", hasName ? "OK" : "MISSING");
    console.log("   ✅ url:", hasUrl ? "OK" : "MISSING");
    console.log("   ✅ type:", hasType ? "OK" : "MISSING");
    
    // 5. KEY FINDING
    console.log("\n5. ⚠️  ARCHITECTURE ANALYSIS:");
    console.log("   - M3U bulk import writes to table: 'streams'");
    console.log("   - Homepage reads from table: 'Channel' (via getChannelsFromDB)");
    console.log("   - These are DIFFERENT tables!");
    console.log("   - The 'streams' table fields: { name, url, type }");
    console.log("   - The 'Channel' table fields: { id, name, logo, category, status, streamUrl, isActive }");
    console.log("   → MISMATCH: imported M3U channels won't appear on homepage unless synced to 'Channel' table");
    
    console.log("\n=== DONE ===");
    
  } catch (err) {
    console.error("   ❌ Fetch failed:", err.message);
    if (err.name === "AbortError") {
      console.log("   (timeout - the server may not support IPv4 or is slow)");
    }
  }
}

main();
