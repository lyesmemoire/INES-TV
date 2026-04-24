# 🧹 DEEP CLEAN GRADLE CACHES
# Resolves "Unsupported class file major version 70" errors by purging corrupted JVM/metasdata caches.

Write-Host "🛑 Stopping Gradle Daemons..." -ForegroundColor Cyan
Set-Location tv
.\gradlew.bat --stop
Set-Location ../mobile/android
.\gradlew.bat --stop
Set-Location ../..

Write-Host "🗑️ Purging Global Gradle Caches..." -ForegroundColor Red
$gradleCache = "$env:USERPROFILE\.gradle\caches"
if (Test-Path $gradleCache) {
    Remove-Item -Recurse -Force $gradleCache
    Write-Host "✅ Global cache purged." -ForegroundColor Green
}

Write-Host "🗑️ Cleaning Local Build Folders..." -ForegroundColor Yellow
$folders = @(
    "mobile/android/.gradle",
    "mobile/android/app/build",
    "tv/.gradle",
    "tv/app/build"
)

foreach ($folder in $folders) {
    if (Test-Path $folder) {
        Remove-Item -Recurse -Force $folder
        Write-Host "✅ Cleaned: $folder"
    }
}

Write-Host "✨ Deep clean complete. Please restart your IDE and trigger a fresh build." -ForegroundColor Green
