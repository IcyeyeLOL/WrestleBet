@echo off
REM Build Fix Script for WrestleBet (Windows)
REM This script addresses common Next.js build issues

echo 🔧 WrestleBet Build Fix Script
echo ==============================

REM 1. Clear build cache
echo 1. Clearing build cache...
if exist .next rmdir /s /q .next
if exist out rmdir /s /q out
echo ✅ Build cache cleared

REM 2. Clear npm cache
echo 2. Clearing npm cache...
npm cache clean --force
echo ✅ NPM cache cleared

REM 3. Reinstall dependencies
echo 3. Reinstalling dependencies...
if exist node_modules rmdir /s /q node_modules
npm install --legacy-peer-deps
echo ✅ Dependencies reinstalled

REM 4. Type check
echo 4. Running TypeScript check...
npx tsc --noEmit
if %errorlevel% equ 0 (
    echo ✅ TypeScript check passed
) else (
    echo ❌ TypeScript errors found
    pause
    exit /b 1
)

REM 5. Lint check
echo 5. Running ESLint check...
npm run lint
if %errorlevel% equ 0 (
    echo ✅ ESLint check passed
) else (
    echo ⚠️  ESLint warnings found (continuing...)
)

REM 6. Build test
echo 6. Testing build...
npm run build
if %errorlevel% equ 0 (
    echo ✅ Build successful!
    echo.
    echo 🎉 All checks passed! Your project is ready for deployment.
) else (
    echo ❌ Build failed. Check the error messages above.
    pause
    exit /b 1
)

echo.
echo 📋 Next Steps:
echo 1. Set environment variables in your deployment platform
echo 2. Use the variables from env-template.txt
echo 3. Deploy your application
pause
