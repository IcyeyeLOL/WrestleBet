#!/usr/bin/env bash
# webpack-cache-fix.bat - Fix Next.js webpack cache issues

echo "🧹 Fixing Next.js webpack cache issues..."

# Stop any running development server
echo "Stopping development server..."
taskkill /f /im node.exe 2>nul || echo "No Node.js processes found"

# Clear Next.js build cache
echo "Clearing .next directory..."
if exist .next (
    rmdir /s /q .next
    echo "✅ .next directory cleared"
) else (
    echo "⚠️ .next directory not found"
)

# Clear npm cache
echo "Clearing npm cache..."
npm cache clean --force

# Clear temporary files (optional)
echo "Clearing temp files..."
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo "✅ Node modules cache cleared"
)

# Restart development server
echo "🚀 Starting development server..."
npm run dev

echo "✅ Webpack cache fix complete!"
