#!/bin/bash

# ImmoConnect Setup Script
echo "🏠 Setting up ImmoConnect - Marketplace Immobilière Bidirectionnelle"
echo "=================================================================="

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

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Create environment files
echo "⚙️ Creating environment files..."

# Frontend env
if [ ! -f "frontend/.env.local" ]; then
    cp frontend/env.example frontend/.env.local
    echo "✅ Created frontend/.env.local"
else
    echo "⚠️ frontend/.env.local already exists"
fi

# Backend env
if [ ! -f "backend/.env" ]; then
    cp backend/env.example backend/.env
    echo "✅ Created backend/.env"
else
    echo "⚠️ backend/.env already exists"
fi

# Create logs directory
mkdir -p backend/logs
echo "✅ Created logs directory"

# Create uploads directory
mkdir -p backend/uploads
echo "✅ Created uploads directory"

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Configure your environment variables in:"
echo "   - frontend/.env.local"
echo "   - backend/.env"
echo ""
echo "2. Set up your PostgreSQL database and update DATABASE_URL in backend/.env"
echo ""
echo "3. Run database migrations:"
echo "   cd backend && npm run db:push"
echo ""
echo "4. Start the development servers:"
echo "   npm run dev"
echo ""
echo "🌐 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo ""
echo "📚 Documentation: README.md"
