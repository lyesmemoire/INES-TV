$ProgressPreference = 'SilentlyContinue'

Write-Host "`nTest 1: GET /api/live-channels"
$res1 = Invoke-WebRequest -Uri "http://localhost:3000/api/live-channels" -UseBasicParsing -ErrorAction SilentlyContinue
Write-Host "Status: $($res1.StatusCode)"
$channelsData = $res1.Content | ConvertFrom-Json
$hasStreamUrl = $channelsData.channels | Where-Object { $null -ne $_.streamUrl }
if ($hasStreamUrl) { Write-Host "❌ ECHEC: streamUrl trouvé !" } else { Write-Host "✅ OK: Aucun streamUrl exposé." }
$previewChannel = $channelsData.channels[0]
Write-Host "Premier channel: channelId=$($previewChannel.channelId), name=$($previewChannel.name)`n"

Write-Host "Test 2: GET /api/streams/play/channel-1 (Sans Auth)"
$res2 = Invoke-WebRequest -Uri "http://localhost:3000/api/streams/play/channel-1" -UseBasicParsing -ErrorAction SilentlyContinue 
Write-Host "Status: $($res2.StatusCode)"
Write-Host "Response: $($res2.Content)`n"

Write-Host "Test 3: POST /api/auth/login + GET /play avec JWT_PREMIUM"
$body = @{ email = "test@streamperf.com"; password = "testpassword123" } | ConvertTo-Json
$resAuth = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
$jwt = ($resAuth.Content | ConvertFrom-Json).token

$headers = @{ "Authorization" = "Bearer $jwt" }
$res3 = Invoke-WebRequest -Uri "http://localhost:3000/api/streams/play/channel-1" -Headers $headers -UseBasicParsing -ErrorAction SilentlyContinue
Write-Host "Status: $($res3.StatusCode)"
Write-Host "Response: $($res3.Content)`n"
