# Start Jekyll in development mode.
$env:JEKYLL_ENV = "development"
Write-Host "JEKYLL_ENV=$env:JEKYLL_ENV"
try {
    Write-Host "Starting Jekyll dev server (development mode)..."
    bundle exec jekyll serve
} finally {
    Write-Host "JEKYLL_ENV=$env:JEKYLL_ENV"
}
