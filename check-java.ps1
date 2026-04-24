# StreamPerf Java Diagnostic (Phase 49)
# Verifies if JDK 17 is correctly set up.

$expectedVersion = "17."
$adoptiumPath = "C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot"
$debugLogPath = "C:\Users\elitebook\Downloads\zip\debug-4cc7ca.log"
$debugRunId = "run-2"

Write-Host "--- Java Environment Audit ---"

# 1. Check JAVA_HOME
$javaHome = [System.Environment]::GetEnvironmentVariable("JAVA_HOME", "User")
if (!$javaHome) { $javaHome = [System.Environment]::GetEnvironmentVariable("JAVA_HOME", "Machine") }
#region agent log
Add-Content -Path $debugLogPath -Value (@{
    sessionId = "4cc7ca"; runId = $debugRunId; hypothesisId = "H6";
    location = "check-java.ps1:12"; message = "java env snapshot";
    data = @{ javaHome = $javaHome; pwd = (Get-Location).Path }; timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
} | ConvertTo-Json -Compress)
#endregion

if ($javaHome -like "*jdk-17*") {
    Write-Host "[OK] JAVA_HOME points to JDK 17: $javaHome"
} else {
    Write-Host "[WARN] JAVA_HOME is not pinned to JDK 17. Fixing locally..."
    [System.Environment]::SetEnvironmentVariable("JAVA_HOME", $adoptiumPath, "User")
}

# 2. Check for Path Conflicts
$uPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
$mPath = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
$pathEntries = ($uPath + ";" + $mPath).Split(';')

$badOnes = $pathEntries | Where-Object { ($_ -like "*Oracle\Java\javapath*") -or ($_ -like "*RedHat\java*") }

if ($badOnes) {
    Write-Host "!!! CONFLICTS DETECTED !!!"
    foreach ($b in $badOnes) { Write-Host "  - Found: $b" }
    Write-Host "Action Required: Remove these entries from your System Environment Variables."
} else {
    Write-Host "[OK] No conflicting Java versions found in Path."
}

# 3. Final Verification
try {
    $ver = & java -version 2>&1
    $verStr = [string]$ver
    #region agent log
    Add-Content -Path $debugLogPath -Value (@{
        sessionId = "4cc7ca"; runId = $debugRunId; hypothesisId = "H7";
        location = "check-java.ps1:35"; message = "java -version";
        data = @{ javaVersionRaw = $verStr }; timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
    } | ConvertTo-Json -Compress)
    #endregion
    if ($verStr -match "version .17\.") {
        Write-Host "--- SUCCESS: JDK 17 is ACTIVE ---"
        Write-Host $verStr
    } else {
        Write-Host "--- ERROR: JDK 17 NOT DETECTED ---"
        Write-Host $verStr
    }
} catch {
    #region agent log
    Add-Content -Path $debugLogPath -Value (@{
        sessionId = "4cc7ca"; runId = $debugRunId; hypothesisId = "H7";
        location = "check-java.ps1:48"; message = "java command failed";
        data = @{ error = $_.Exception.Message }; timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
    } | ConvertTo-Json -Compress)
    #endregion
    Write-Host "--- ERROR: Java command not found ---"
}

try {
    $tvVersion = & .\tv\gradlew.bat -version 2>&1
    #region agent log
    Add-Content -Path $debugLogPath -Value (@{
        sessionId = "4cc7ca"; runId = $debugRunId; hypothesisId = "H8";
        location = "check-java.ps1:57"; message = "tv gradle version";
        data = @{ tvGradleVersionRaw = [string]$tvVersion }; timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
    } | ConvertTo-Json -Compress)
    #endregion
} catch {
    #region agent log
    Add-Content -Path $debugLogPath -Value (@{
        sessionId = "4cc7ca"; runId = $debugRunId; hypothesisId = "H8";
        location = "check-java.ps1:65"; message = "tv gradle version failed";
        data = @{ error = $_.Exception.Message }; timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
    } | ConvertTo-Json -Compress)
    #endregion
}
