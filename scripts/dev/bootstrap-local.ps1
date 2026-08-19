[CmdletBinding()]
param(
    [string]$ApiPassword,
    [string]$WorkerPassword,
    [string]$OpsPassword,
    [string]$AuthPepper,
    [switch]$OverwriteEnv
)

$ErrorActionPreference = 'Stop'

function New-HexSecret {
    param([int]$Bytes)

    $buffer = New-Object byte[] $Bytes
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try {
        $rng.GetBytes($buffer)
    }
    finally {
        $rng.Dispose()
    }

    return -join ($buffer | ForEach-Object { $_.ToString('x2') })
}

if ([string]::IsNullOrWhiteSpace($ApiPassword)) {
    $ApiPassword = New-HexSecret -Bytes 24
}
if ([string]::IsNullOrWhiteSpace($WorkerPassword)) {
    $WorkerPassword = New-HexSecret -Bytes 24
}
if ([string]::IsNullOrWhiteSpace($OpsPassword)) {
    $OpsPassword = New-HexSecret -Bytes 24
}
if ([string]::IsNullOrWhiteSpace($AuthPepper)) {
    $AuthPepper = New-HexSecret -Bytes 32
}

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$ComposeFile = Join-Path $RepoRoot 'docker-compose.dev.yml'
$MigrationsDir = Join-Path $RepoRoot 'supabase\migrations'
$ProvisionSql = Join-Path $RepoRoot 'scripts\dev\provision-local-runtime.sql'
$ApiEnv = Join-Path $RepoRoot 'apps\api\.env'
$GeneratedEnv = Join-Path $RepoRoot 'apps\api\.env.bootstrap'

Push-Location $RepoRoot
try {
    Write-Host '=== Starting PostgreSQL 15 ==='
    & docker compose -f $ComposeFile up -d postgres
    if ($LASTEXITCODE -ne 0) {
        throw 'docker compose up failed'
    }

    Write-Host '=== Waiting for PostgreSQL ==='
    $ready = $false
    for ($attempt = 1; $attempt -le 30; $attempt++) {
        & docker compose -f $ComposeFile exec -T postgres pg_isready -U postgres -d api_dian *> $null
        if ($LASTEXITCODE -eq 0) {
            $ready = $true
            break
        }
        Start-Sleep -Seconds 1
    }
    if (-not $ready) {
        throw 'PostgreSQL did not become ready within 30 seconds'
    }

    Write-Host '=== Applying versioned migrations ==='
    $migrations = Get-ChildItem -Path $MigrationsDir -Filter '*.sql' | Sort-Object Name
    foreach ($migration in $migrations) {
        if ($migration.Length -eq 0) {
            continue
        }
        Write-Host "Applying $($migration.Name)"
        Get-Content $migration.FullName -Raw |
            & docker compose -f $ComposeFile exec -T postgres psql \
                -U postgres -d api_dian -v ON_ERROR_STOP=1
        if ($LASTEXITCODE -ne 0) {
            throw "Migration failed: $($migration.Name)"
        }
    }

    Write-Host '=== Provisioning least-privilege local logins ==='
    Get-Content $ProvisionSql -Raw |
        & docker compose -f $ComposeFile exec -T postgres psql \
            -U postgres -d api_dian -v ON_ERROR_STOP=1 \
            --set=api_password=$ApiPassword \
            --set=worker_password=$WorkerPassword \
            --set=ops_password=$OpsPassword
    if ($LASTEXITCODE -ne 0) {
        throw 'Local runtime role provisioning failed'
    }

    $envContent = @"
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://api_dian_dev:$ApiPassword@localhost:5432/api_dian
DATABASE_POOL_MAX=5
AUTH_PEPPER=$AuthPepper
WORKER_DATABASE_URL=postgresql://api_dian_worker_dev:$WorkerPassword@localhost:5432/api_dian
WORKER_ID=worker-local-1
WORKER_LEASE_SECONDS=30
WORKER_MUTATION_PAUSE_SECONDS=5
WORKER_RECONCILE_RETRY_SECONDS=5
WORKER_RECONCILE_MAX_ATTEMPTS=5
WORKER_IDLE_MS=250
FAKE_PROVIDER_SCENARIO=ACCEPT
OPS_DATABASE_URL=postgresql://api_dian_ops_dev:$OpsPassword@localhost:5432/api_dian
"@

    $targetEnv = $ApiEnv
    if ((Test-Path $ApiEnv) -and -not $OverwriteEnv) {
        $targetEnv = $GeneratedEnv
        Write-Warning "apps/api/.env already exists; generated credentials were written to $GeneratedEnv instead. Review it before replacing .env."
    }

    Set-Content -Path $targetEnv -Value $envContent -Encoding UTF8

    Write-Host ''
    Write-Host 'Local database bootstrap completed.'
    Write-Host "Runtime environment: $targetEnv"
    Write-Host 'API login:    api_dian_dev -> app_api only'
    Write-Host 'Worker login: api_dian_worker_dev -> app_worker only'
    Write-Host 'Ops login:    api_dian_ops_dev -> app_ops + app_ops_control only'
    Write-Host ''
    Write-Host 'Start API:'
    Write-Host '  cd apps/api; npm ci; npm run start:dev'
    Write-Host 'Start fake worker in another PowerShell:'
    Write-Host '  cd apps/api; $env:DATABASE_URL=$env:WORKER_DATABASE_URL; npm run start:worker'
}
finally {
    Pop-Location
}
