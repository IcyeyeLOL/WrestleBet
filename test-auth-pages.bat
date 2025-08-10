@echo off
echo 🚀 Testing WrestleBet Sign-In/Sign-Up Pages
echo ==========================================
cd /d "c:\Users\lime7\wrestle-bet"

echo 📁 Current directory: %cd%
echo.

echo 📝 Checking created files:
if exist "app\sign-in\[[...sign-in]]\page.jsx" (
    echo ✅ Sign-in page created
) else (
    echo ❌ Sign-in page missing
)

if exist "app\sign-up\[[...sign-up]]\page.jsx" (
    echo ✅ Sign-up page created  
) else (
    echo ❌ Sign-up page missing
)

echo.
echo 🔑 Environment variables added:
echo - NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
echo - NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
echo - NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
echo - NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

echo.
echo 🛡️ Middleware configured for public routes:
echo - / (home page - public)
echo - /sign-in/* (sign-in pages - public)
echo - /sign-up/* (sign-up pages - public)
echo - /api/webhooks/* (webhooks - public)

echo.
echo 🔒 Protected routes:
echo - /account/* (requires authentication)
echo - /bets/* (requires authentication)

echo.
echo 🎯 Test these URLs when server starts:
echo - http://localhost:3000/sign-in (dedicated sign-in page)
echo - http://localhost:3000/sign-up (dedicated sign-up page)
echo - Header sign-in button (should redirect to /sign-in)

echo.
echo 🚀 Starting development server...
npm run dev

pause
