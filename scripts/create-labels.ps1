# Requires: gh CLI, authenticated (`gh auth login`)
# Usage: .\scripts\create-labels.ps1
# Run from repo root. Creates role-* and type-* labels if missing.

$ErrorActionPreference = "Stop"

$labels = @(
    @{ name = "role-backend";  color = "0052CC"; description = "Backend board" },
    @{ name = "role-frontend"; color = "1D76DB"; description = "Frontend board" },
    @{ name = "role-database"; color = "5319E7"; description = "Database board" },
    @{ name = "role-qa";       color = "0E8A16"; description = "QA board" },
    @{ name = "role-design";   color = "B60205"; description = "Design board" },
    @{ name = "role-devops";   color = "FBCA04"; description = "DevOps board" },
    @{ name = "role-product";  color = "C2E0C6"; description = "Product board" },
    @{ name = "role-platform"; color = "D4C5F9"; description = "Platform / full-stack board" },
    @{ name = "type-bug";        color = "D73A4A"; description = "Defect" },
    @{ name = "type-feature";    color = "A2EEEF"; description = "New capability" },
    @{ name = "type-spike";      color = "FEF2C0"; description = "Research / spike" },
    @{ name = "type-tech-debt";  color = "EDEDED"; description = "Technical debt" },
    @{ name = "type-chore";      color = "F9D0C4"; description = "Chore / maintenance" }
)

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Error "Install GitHub CLI: https://cli.github.com/"
}

foreach ($l in $labels) {
    gh label create $l.name --color $l.color --description $l.description 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Skip (exists?): $($l.name)"
    }
}

Write-Host "Done. Verify under Repo Settings > Labels."
