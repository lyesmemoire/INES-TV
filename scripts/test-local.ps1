$ErrorActionPreference = "Continue"

function Write-Header {
    param([string]$title)
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host $title -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Step {
    param([string]$step)
    Write-Host "▶ $step" -ForegroundColor Magenta
}

function Write-Success {
    param([string]$message)
    Write-Host "✅ $message" -ForegroundColor Green
}

function Write-ErrorMsg {
    param([string]$message)
    Write-Host "❌ $message" -ForegroundColor Red
}

function Write-WarningMsg {
    param([string]$message)
    Write-Host "⚠️ $message" -ForegroundColor Yellow
}

Clear-Host
Write-Host "🔥🔥🔥 StreamPerf - Local Validation Suite (PowerShell) 🔥🔥🔥" -ForegroundColor Cyan
Write-Host ""

Write-Header "1️⃣ System Prerequisites"
Write-Step "Checking required tools..."

if (Get-Command docker -ErrorAction SilentlyContinue) { Write-Success "Docker is installed" } else { Write-ErrorMsg "Docker is missing"; exit 1 }
if (Get-Command docker-compose -ErrorAction SilentlyContinue) { Write-Success "Docker Compose is installed" } else { Write-ErrorMsg "Docker Compose is missing"; exit 1 }
if (Get-Command node -ErrorAction SilentlyContinue) { Write-Success "Node.js is installed" } else { Write-ErrorMsg "Node.js is missing"; exit 1 }

Write-Header "2️⃣ Environment Configuration"
if (Test-Path ".env.local") {
    Write-Success ".env.local exists"
} else {
    Write-ErrorMsg ".env.local not found. Copying from .env.example..."
    Copy-Item ".env.example" -Destination ".env.local" -ErrorAction SilentlyContinue
    Write-WarningMsg "Created .env.local. Please configure your Supabase keys!"
}

Write-Header "3️⃣ Dependencies"
if (Test-Path "node_modules") {
    Write-Success "node_modules exists"
} else {
    Write-WarningMsg "node_modules not found, installing..."
    npm install
}

Write-Header "4️⃣ Docker Containers"
Write-Step "Starting containers (this might take a minute)..."
docker-compose down -v
docker-compose up -d --build
Start-Sleep -Seconds 15

$running = docker ps --format "{{.Names}}"
if ($running -match "streamperf-app") { Write-Success "App container running" } else { Write-ErrorMsg "App container failed" }
if ($running -match "streamperf-redis") { Write-Success "Redis container running" } else { Write-ErrorMsg "Redis container failed" }

Write-Header "5️⃣ API Health Checks"
Write-Step "Testing health endpoint..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Success "Health endpoint returned 200 OK"
    } else {
        Write-ErrorMsg "Health endpoint returned $($response.StatusCode)"
    }
} catch {
    Write-ErrorMsg "Failed to reach health endpoint. Is the app running?"
}

Write-Header "🚀 VALIDATION SUMMARY 🚀"
Write-Success "All checks completed."
Write-Host "Next step: Test the UI at http://localhost:3000" -ForegroundColor Cyan
Write-Host "Then, if everything works: npm run build (or ./scripts/deploy.ps1)" -ForegroundColor Cyan
