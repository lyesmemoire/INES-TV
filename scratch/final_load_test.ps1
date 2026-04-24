# 🚀 FINAL PRODUCTION STRESS TEST (v5)
# 1. Start Cluster
$process = Start-Process -FilePath "cmd.exe" -ArgumentList "/c npx tsx cluster.ts" -PassThru -NoNewWindow
Write-Host "Wait for Workers to initialize..."
Start-Sleep -Seconds 20

# 2. Hammer with Autocannon
Write-Host "Starting Load Test (1000 Concurrency)..."
npx autocannon -c 1000 -d 30 --renderStatusCodes http://localhost:3000/api/ads/request

# 3. Cleanup
Stop-Process -Id $process.Id -Force
Write-Host "✅ Stress Test Complete."
