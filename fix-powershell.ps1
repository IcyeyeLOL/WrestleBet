# Fix PowerShell Execution Policy for Vercel CLI
Write-Host "🔧 Fixing PowerShell Execution Policy..." -ForegroundColor Yellow

# Set execution policy to allow local scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

Write-Host "✅ Execution Policy Updated!" -ForegroundColor Green
Write-Host "Now you can run: vercel --version" -ForegroundColor Cyan
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
