# ImmoConnect Setup Script for Windows
Write-Host "🏠 Setting up ImmoConnect - Marketplace Immobilière Bidirectionnelle" -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Check Node.js version
$version = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
if ($version -lt 18) {
    Write-Host "❌ Node.js version 18+ is required. Current version: $nodeVersion" -ForegroundColor Red
    exit 1
}

# Install root dependencies
Write-Host "📦 Installing root dependencies..." -ForegroundColor Yellow
npm install

# Install frontend dependencies
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
Set-Location ..

# Install backend dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
Set-Location ..

# Create environment files
Write-Host "⚙️ Creating environment files..." -ForegroundColor Yellow

# Frontend env
if (!(Test-Path "frontend/.env.local")) {
    Copy-Item "frontend/env.example" "frontend/.env.local"
    Write-Host "✅ Created frontend/.env.local" -ForegroundColor Green
} else {
    Write-Host "⚠️ frontend/.env.local already exists" -ForegroundColor Yellow
}

# Backend env
if (!(Test-Path "backend/.env")) {
    Copy-Item "backend/env.example" "backend/.env"
    Write-Host "✅ Created backend/.env" -ForegroundColor Green
} else {
    Write-Host "⚠️ backend/.env already exists" -ForegroundColor Yellow
}

# Create directories
New-Item -ItemType Directory -Force -Path "backend/logs" | Out-Null
Write-Host "✅ Created logs directory" -ForegroundColor Green

New-Item -ItemType Directory -Force -Path "backend/uploads" | Out-Null
Write-Host "✅ Created uploads directory" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Configure your environment variables in:" -ForegroundColor White
Write-Host "   - frontend/.env.local" -ForegroundColor Gray
Write-Host "   - backend/.env" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Set up your PostgreSQL database and update DATABASE_URL in backend/.env" -ForegroundColor White
Write-Host ""
Write-Host "3. Run database migrations:" -ForegroundColor White
Write-Host "   cd backend && npm run db:push" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Start the development servers:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 URLs:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend API: http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation: README.md" -ForegroundColor Cyan
