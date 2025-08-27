@echo off
echo 🚀 Deploying Wrestle-Bet to Vercel...
echo.

echo 📦 Installing Vercel CLI globally...
call npm install -g vercel

echo.
echo 🔐 Starting Vercel deployment...
echo Note: You'll be prompted to login and configure your project
echo.

call vercel --prod

echo.
echo ✅ Deployment complete!
echo Check your Vercel dashboard for the live URL
pause
