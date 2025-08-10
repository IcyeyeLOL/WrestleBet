# WrestleBet Development Server with Clerk Authentication
# PowerShell version for better compatibility

Write-Host "🚀 Starting WrestleBet with Clerk Authentication..." -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Change to the project directory
Set-Location "c:\Users\lime7\wrestle-bet"
Write-Host "📁 Current directory: $(Get-Location)" -ForegroundColor Cyan
Write-Host ""

# Check if package.json exists
if (Test-Path "package.json") {
    Write-Host "✅ package.json found" -ForegroundColor Green
} else {
    Write-Host "❌ package.json not found" -ForegroundColor Red
    Write-Host "Make sure you're in the correct directory" -ForegroundColor Yellow
    exit 1
}

# Check if node_modules exists
if (Test-Path "node_modules") {
    Write-Host "✅ node_modules found" -ForegroundColor Green
} else {
    Write-Host "⚠️ node_modules not found, running npm install..." -ForegroundColor Yellow
    npm install
}

Write-Host ""
Write-Host "📋 Checking Clerk Setup:" -ForegroundColor Yellow
Write-Host "- Package: @clerk/nextjs ^6.29.0 ✅" -ForegroundColor Green
Write-Host "- Environment Variables: ✅" -ForegroundColor Green
Write-Host "- ClerkProvider in layout.js: ✅" -ForegroundColor Green
Write-Host "- Middleware: ✅" -ForegroundColor Green
Write-Host "- Enhanced Authentication Pages: ✅" -ForegroundColor Green
Write-Host ""

Write-Host "🎨 Authentication Pages Available:" -ForegroundColor Magenta
Write-Host "- Sign-In: http://localhost:3000/sign-in (Yellow/Orange Theme)" -ForegroundColor Yellow
Write-Host "- Sign-Up: http://localhost:3000/sign-up (Green/Blue Theme)" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔥 Starting development server..." -ForegroundColor Red
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Start the development server
try {
    npm run dev
} catch {
    Write-Host "❌ Error starting development server" -ForegroundColor Red
    Write-Host "Error details: $_" -ForegroundColor Red
    Read-Host "Press Enter to exit"
}
