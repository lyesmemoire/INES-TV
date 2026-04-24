Write-Host "NUCLEAR FIX START" -ForegroundColor Red

# Kill all Java / Gradle processes
Write-Host "Killing Java and Gradle processes..." -ForegroundColor Yellow
Get-Process java -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process gradle -ErrorAction SilentlyContinue | Stop-Process -Force

# Stop Gradle daemons
Write-Host "Stopping Gradle daemons..." -ForegroundColor Yellow
$androidPath = Join-Path $PSScriptRoot "..\mobile\android"
$tvPath = Join-Path $PSScriptRoot "..\tv"

if (Test-Path (Join-Path $androidPath "gradlew.bat")) {
    Push-Location $androidPath
    .\gradlew.bat --stop
    Pop-Location
}
if (Test-Path (Join-Path $tvPath "gradlew.bat")) {
    Push-Location $tvPath
    .\gradlew.bat --stop
    Pop-Location
}

# Delete global Gradle cache
Write-Host "Deleting global Gradle cache..." -ForegroundColor Yellow
$gradleCache = Join-Path $env:USERPROFILE ".gradle"
if (Test-Path $gradleCache) {
    Remove-Item -Recurse -Force $gradleCache
    Write-Host "  -> Deleted: $gradleCache" -ForegroundColor Gray
} else {
    Write-Host "  -> Not found (skipped): $gradleCache" -ForegroundColor Gray
}

# Delete local build artifacts
Write-Host "Deleting local build artifacts..." -ForegroundColor Yellow
$toDelete = @(
    "mobile\android\.gradle",
    "mobile\android\build",
    "mobile\node_modules",
    "node_modules"
)
$root = Join-Path $PSScriptRoot ".."
foreach ($rel in $toDelete) {
    $p = Join-Path $root $rel
    if (Test-Path $p) {
        Remove-Item -Recurse -Force $p
        Write-Host "  -> Deleted: $p" -ForegroundColor Gray
    } else {
        Write-Host "  -> Not found (skipped): $p" -ForegroundColor Gray
    }
}

# Delete VS Code / Antigravity Java extension cache
Write-Host "Deleting VS Code / Antigravity Java extension cache..." -ForegroundColor Yellow
$javaCaches = @(
    "$env:APPDATA\Code\User\globalStorage\redhat.java",
    "$env:APPDATA\Antigravity\User\globalStorage\redhat.java"
)
foreach ($c in $javaCaches) {
    if (Test-Path $c) {
        Remove-Item -Recurse -Force $c
        Write-Host "  -> Deleted: $c" -ForegroundColor Gray
    } else {
        Write-Host "  -> Not found (skipped): $c" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "CLEAN DONE" -ForegroundColor Green
Write-Host "Next steps: cd mobile && npm install && cd android && .\gradlew assembleRelease" -ForegroundColor Cyan
