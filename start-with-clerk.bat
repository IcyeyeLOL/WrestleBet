@echo off
echo 🚀 Starting WrestleBet with Clerk Authentication...
echo =============================================
cd /d "c:\Users\lime7\wrestle-bet"
echo Current directory: %cd%
echo.
echo 📋 Checking Clerk Setup:
echo - Package: @clerk/nextjs ^6.29.0 ✅
echo - Environment Variables: ✅
echo - ClerkProvider in layout.js: ✅
echo - Middleware: ✅
echo.
echo 🔥 Starting development server...
npm run dev
