echo "--- 1. Testing PLAY (Anonymous) ---"
$playResult = Invoke-WebRequest -Uri "http://localhost:3000/api/streams/play/channel-1" -Method GET -UseBasicParsing
$playResult.Content

echo "`n--- 2. Testing HEARTBEAT ---"
$hbBody = @{ userId="anon-127.0.0.1" } | ConvertTo-Json
$hbResult = Invoke-WebRequest -Uri "http://localhost:3000/api/streams/heartbeat" -Method POST -ContentType "application/json" -Body $hbBody -UseBasicParsing
$hbResult.Content

echo "`n--- 3. Testing STOP ---"
$stopBody = @{ userId="anon-127.0.0.1" } | ConvertTo-Json
$stopResult = Invoke-WebRequest -Uri "http://localhost:3000/api/streams/stop" -Method POST -ContentType "application/json" -Body $stopBody -UseBasicParsing
$stopResult.Content
