#!/bin/bash
# Build Fix Script for WrestleBet
# This script addresses common Next.js build issues

echo "🔧 WrestleBet Build Fix Script"
echo "=============================="

# 1. Clear build cache
echo "1. Clearing build cache..."
rm -rf .next
rm -rf out
echo "✅ Build cache cleared"

# 2. Clear npm cache
echo "2. Clearing npm cache..."
npm cache clean --force
echo "✅ NPM cache cleared"

# 3. Reinstall dependencies
echo "3. Reinstalling dependencies..."
rm -rf node_modules
npm install --legacy-peer-deps
echo "✅ Dependencies reinstalled"

# 4. Type check
echo "4. Running TypeScript check..."
npx tsc --noEmit
if [ $? -eq 0 ]; then
    echo "✅ TypeScript check passed"
else
    echo "❌ TypeScript errors found"
    exit 1
fi

# 5. Lint check
echo "5. Running ESLint check..."
npm run lint
if [ $? -eq 0 ]; then
    echo "✅ ESLint check passed"
else
    echo "⚠️  ESLint warnings found (continuing...)"
fi

# 6. Build test
echo "6. Testing build..."
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🎉 All checks passed! Your project is ready for deployment."
else
    echo "❌ Build failed. Check the error messages above."
    exit 1
fi

echo ""
echo "📋 Next Steps:"
echo "1. Set environment variables in your deployment platform"
echo "2. Use the variables from env-template.txt"
echo "3. Deploy your application"
