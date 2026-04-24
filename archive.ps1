$source = "C:\Users\elitebook\Downloads\zip"
$tempBase = "C:\Users\elitebook\Downloads\temp_clean_archive"
$destination = "C:\Users\elitebook\Downloads\OTT_SaaS_Player_V3_Production_Ready.zip"

if (Test-Path $tempBase) { Remove-Item -Recurse -Force $tempBase }

Write-Host "Step 1: Mirroring source with exclusions..."
$xd = @("node_modules", ".next", ".gradle", "build", "dist", ".vscode", ".cursor")
$xf = @("*.log", "*.tmp", "*.zip", "archive.ps1")

$robocopyArgs = @($source, $tempBase, "/E", "/COPY:DAT", "/DCOPY:DAT", "/XD") + $xd + @("/XF") + $xf + @("/R:0", "/W:0", "/MT:8")
$process = Start-Process robocopy -ArgumentList $robocopyArgs -Wait -NoNewWindow -PassThru

Write-Host "Step 2: Compressing clean subdirectory..."
Compress-Archive -Path "$tempBase\*" -DestinationPath $destination -Force

Write-Host "Step 3: Cleaning up..."
Remove-Item -Recurse -Force $tempBase

Write-Host "Step 4: Verifying..."
if (Test-Path $destination) {
    $size = (Get-Item $destination).Length / 1MB
    Write-Host "Archive created: $destination"
    Write-Host "Size: $('{0:N2}' -f $size) MB"
    $hash = Get-FileHash -Path $destination -Algorithm SHA256
    Write-Host "SHA256 Hash: $($hash.Hash)"
} else {
    Write-Error "Failed to create archive."
}
