# Fix Next.js webpack cache issues - PowerShell version
Write-Host "🧹 Fixing Next.js webpack cache issues..." -ForegroundColor Yellow

# Stop any running development server
Write-Host "Stopping development server..." -ForegroundColor Cyan
try {
    Get-Process -Name "node" -ErrorAction Stop | Stop-Process -Force
    Write-Host "✅ Node.js processes stopped" -ForegroundColor Green
} catch {
    Write-Host "⚠️ No Node.js processes found" -ForegroundColor Yellow
}

# Clear Next.js build cache
Write-Host "Clearing .next directory..." -ForegroundColor Cyan
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "✅ .next directory cleared" -ForegroundColor Green
} else {
    Write-Host "⚠️ .next directory not found" -ForegroundColor Yellow
}

# Clear npm cache
Write-Host "Clearing npm cache..." -ForegroundColor Cyan
npm cache clean --force
Write-Host "✅ npm cache cleared" -ForegroundColor Green

# Clear node_modules cache (optional)
Write-Host "Clearing node_modules cache..." -ForegroundColor Cyan
if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force "node_modules\.cache"
    Write-Host "✅ Node modules cache cleared" -ForegroundColor Green
} else {
    Write-Host "⚠️ Node modules cache not found" -ForegroundColor Yellow
}

# Restart development server
Write-Host "🚀 Starting development server..." -ForegroundColor Cyan
npm run dev

Write-Host "✅ Webpack cache fix complete!" -ForegroundColor Green
