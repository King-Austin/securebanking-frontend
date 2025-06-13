#!/bin/bash

# Build script for Render deployment
echo "🚀 Starting Render deployment build..."

# Set Node.js environment
export NODE_ENV=production

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Build the application
echo "🔨 Building application..."
npm run build:production

# Create a simple health check endpoint
echo "✅ Creating health check..."
echo '<!DOCTYPE html><html><body><h1>OK</h1></body></html>' > dist/health.html

echo "🎉 Build completed successfully!"
echo "📁 Build output is in the 'dist' directory"
