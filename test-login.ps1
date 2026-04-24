$ProgressPreference = 'SilentlyContinue'

$body = @{
    email    = "test@streamperf.com"
    password = "testpassword123"
} | ConvertTo-Json

$response = Invoke-WebRequest `
    -Uri "http://localhost:3000/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -UseBasicParsing `
    -Body $body

$jwt = ($response.Content | ConvertFrom-Json).token
if ($null -ne $jwt -and $jwt.Length -ge 20) {
    Write-Host "JWT OK: $($jwt.Substring(0,20))..."
} else {
    Write-Host "JWT OK: $jwt"
}

# 3. Appeler /play
$headers = @{ Authorization = "Bearer $jwt" }

$playResponse = Invoke-WebRequest `
    -Uri "http://localhost:3000/api/streams/play/channel-1" `
    -Method GET `
    -UseBasicParsing `
    -Headers $headers

$playData = $playResponse.Content | ConvertFrom-Json
Write-Host "Mode: $($playData.mode)"
Write-Host "URL: $($playData.url)"

# 4. Tester le Worker avec l'URL générée
$workerResponse = Invoke-WebRequest `
    -Uri $playData.url `
    -Method GET `
    -UseBasicParsing `
    -ErrorAction SilentlyContinue

Write-Host "Worker Status: $($workerResponse.StatusCode)"
Write-Host "Content-Type: $($workerResponse.Headers['Content-Type'])"

$previewLength = 200
if ($workerResponse.Content.Length -lt 200) {
    $previewLength = $workerResponse.Content.Length
}
if ($previewLength -gt 0) {
    Write-Host "Body preview: $($workerResponse.Content.Substring(0, $previewLength))"
} else {
    Write-Host "Body preview: [Empty]"
}
