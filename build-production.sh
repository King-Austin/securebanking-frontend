#!/bin/bash

# Production build script for SecureCipher Banking Frontend
# This script ensures proper environment setup and optimized build

set -e  # Exit on any error

echo "🚀 Starting SecureCipher Banking Frontend build..."

# Set Node.js environment
export NODE_ENV=production

# Clean any previous builds and cache
echo "🧹 Cleaning previous builds..."
rm -rf dist node_modules/.vite

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Validate environment variables
echo "🔍 Validating environment..."
if [ -z "$VITE_API_URL" ]; then
    echo "⚠️  Warning: VITE_API_URL not set, using default"
    export VITE_API_URL="https://securecipher-banking-api.onrender.com/api"
fi

echo "✅ Using API URL: $VITE_API_URL"

# Build the application
echo "🔨 Building application..."
npm run build:production

# Verify build output
echo "🔍 Verifying build output..."
if [ ! -d "dist" ]; then
    echo "❌ Build failed: dist directory not found"
    exit 1
fi

if [ ! -f "dist/index.html" ]; then
    echo "❌ Build failed: index.html not found in dist"
    exit 1
fi

echo "📊 Build statistics:"
du -sh dist/
ls -la dist/

echo "✅ Frontend build completed successfully!"
echo "🌐 Ready for deployment to Render"
