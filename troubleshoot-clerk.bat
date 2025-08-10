@echo off
echo 🔧 WrestleBet Clerk Troubleshooting...
echo ========================================
cd /d "c:\Users\lime7\wrestle-bet"

echo 📁 Current directory: %cd%
echo.

echo 📦 Checking package.json...
if exist package.json (
  echo ✅ package.json found
) else (
  echo ❌ package.json not found
  goto end
)

echo.
echo 🔑 Checking environment files...
if exist .env.local (
  echo ✅ .env.local found
) else (
  echo ❌ .env.local not found
)

if exist .env (
  echo ✅ .env found
) else (
  echo ❌ .env not found
)

echo.
echo 📋 Checking key files...
if exist "app\layout.js" (
  echo ✅ layout.js found
) else (
  echo ❌ layout.js not found
)

if exist "middleware.ts" (
  echo ✅ middleware.ts found
) else (
  echo ❌ middleware.ts not found
)

if exist "app\components\ClerkTestComponent.jsx" (
  echo ✅ ClerkTestComponent.jsx found
) else (
  echo ❌ ClerkTestComponent.jsx not found
)

echo.
echo 🧪 Running environment check...
node check-clerk-env.js

echo.
echo 📝 Attempting to clear Next.js cache...
if exist .next (
  rd /s /q .next
  echo ✅ Cleared .next directory
)

echo.
echo 🚀 Starting development server...
npm run dev

:end
pause
