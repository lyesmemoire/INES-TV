Write-Host "💣 FULL ENV RESET START" -ForegroundColor Red

# Kill all Java / Gradle processes
Get-Process java -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process gradle -ErrorAction SilentlyContinue | Stop-Process -Force

# Stop Gradle daemons safely
if (Test-Path "mobile/android/gradlew.bat") {
    $currentDir = Get-Location
    Set-Location mobile/android
    ./gradlew --stop
    Set-Location $currentDir
}
if (Test-Path "tv/gradlew.bat") {
    $currentDir = Get-Location
    Set-Location tv
    ./gradlew --stop
    Set-Location $currentDir
}

# Remove global Gradle cache
Write-Host "🧹 Deleting GLOBAL Gradle cache..."
Remove-Item -Recurse -Force "$env:USERPROFILE\.gradle" -ErrorAction SilentlyContinue

# Remove project caches
Write-Host "🧹 Cleaning project builds..."
Remove-Item -Recurse -Force "mobile/android/.gradle" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "mobile/android/build" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "tv/.gradle" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "tv/build" -ErrorAction SilentlyContinue

# Remove node modules
Write-Host "🧹 Removing node_modules..."
Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "mobile/node_modules" -ErrorAction SilentlyContinue

# 🔥 CRITICAL: Remove VS Code + Antigravity Java cache
Write-Host "🔥 Removing Java Language Server cache..."
Remove-Item -Recurse -Force "$env:APPDATA\Code\User\globalStorage\redhat.java" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$env:APPDATA\Antigravity\User\globalStorage\redhat.java" -ErrorAction SilentlyContinue

# Reset ENV (session only)
Remove-Item Env:JAVA_HOME -ErrorAction SilentlyContinue

Write-Host "✅ RESET COMPLETE" -ForegroundColor Green
