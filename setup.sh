#!/bin/bash

# Setup script for SecureCipher Banking Frontend
echo "🏦 Setting up SecureCipher Banking Frontend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📋 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update the .env file with your configuration"
else
    echo "✅ .env file already exists"
fi

# Run linting
echo "🔍 Running linter..."
npm run lint:fix

# Test build
echo "🔨 Testing build..."
npm run build

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Update .env file with your API URL"
echo "   2. Run 'npm run dev' to start development server"
echo "   3. Run 'npm run build:production' to build for production"
echo ""
echo "🚀 For deployment:"
echo "   1. Update environment variables for your target environment"
echo "   2. Follow the instructions in DEPLOYMENT.md"
echo ""
echo "Happy coding! 💻"
