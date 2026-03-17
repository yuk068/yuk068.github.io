param (
    [string]$msg = "Production build: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
)

# 1. Set environment to production and Build
$env:JEKYLL_ENV="production"
Write-Host "--- Step 1: Building for Production ---" -ForegroundColor Cyan
bundle exec jekyll build

# 2. Navigate to the _site folder
if (Test-Path "_site") {
    Push-Location _site
    Write-Host "--- Step 2: Pushing _site to GitHub ---" -ForegroundColor Green
    
    # 3. Git commands inside _site
    git add .
    git commit -m "$msg"
    git push origin main
    
    # 4. Return to the main project directory
    Pop-Location
} else {
    Write-Warning "Error: _site folder not found! Build might have failed."
}

# 5. Reset environment back to development
$env:JEKYLL_ENV="development"
Write-Host "--- Done! Deployment complete. ---" -ForegroundColor Yellow
