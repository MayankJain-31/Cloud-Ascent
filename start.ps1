# Cloud Ascent - one-command local launcher (Windows PowerShell).
# Starts the backend serving the frontend at http://localhost:PORT (default 8080).
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $root "backend")

# 1) Require Node.js 18+
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js is not installed. Install the LTS from https://nodejs.org and re-run." -ForegroundColor Red
  exit 1
}
$major = [int](node -p "process.versions.node.split('.')[0]")
if ($major -lt 18) {
  Write-Host "Node.js 18+ required (found $(node -v)). Please upgrade." -ForegroundColor Red
  exit 1
}

$port = if ($env:PORT) { $env:PORT } else { "8080" }

# 2) Create backend/.env with a freshly generated secret if it doesn't exist.
if (-not (Test-Path ".env")) {
  Write-Host "First run: creating backend/.env with a generated session secret..."
  $secret = node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  @(
    "NODE_ENV=development",
    "PORT=$port",
    "JWT_SECRET=$secret",
    "CORS_ORIGINS=http://localhost:$port",
    "DB_PATH=./data/cloud-ascent.db",
    "SERVE_FRONTEND=1"
  ) | Set-Content -Path ".env" -Encoding ASCII
  Write-Host "  backend/.env created (do not commit this file)."
}

# 3) Install dependencies the first time.
if (-not (Test-Path "node_modules")) {
  Write-Host "Installing backend dependencies (first run only)..."
  npm install --omit=dev
}

# 4) Launch.
Write-Host ""
Write-Host "Starting Cloud Ascent - open http://localhost:$port" -ForegroundColor Green
Write-Host "   (press Ctrl+C to stop)"
Write-Host ""
$env:SERVE_FRONTEND = "1"
$env:PORT = $port
npm start
