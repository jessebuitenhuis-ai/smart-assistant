#!/bin/bash

# Docker PostgreSQL Setup Script for Smart Assistant
# This script sets up the PostgreSQL database using Docker

set -e  # Exit on any error

echo "🚀 Setting up Docker PostgreSQL for Smart Assistant..."
echo

# Check if Docker is installed and running
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is available and running"

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install docker-compose first."
    exit 1
fi

echo "✅ docker-compose is available"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp env.template .env
    echo "✅ Created .env file"
else
    echo "✅ .env file already exists"
fi

# Stop any existing containers
echo "🛑 Stopping any existing containers..."
docker-compose down --remove-orphans || true

# Start PostgreSQL container
echo "🐘 Starting PostgreSQL container..."
docker-compose up -d postgres

# Wait for PostgreSQL to be healthy
echo "⏳ Waiting for PostgreSQL to be ready..."
timeout=60
counter=0

while [ $counter -lt $timeout ]; do
    if docker-compose exec -T postgres pg_isready -U postgres -d smart_assistant &> /dev/null; then
        echo "✅ PostgreSQL is ready!"
        break
    fi
    
    echo -n "."
    sleep 2
    counter=$((counter + 2))
done

if [ $counter -ge $timeout ]; then
    echo "❌ PostgreSQL failed to start within ${timeout} seconds"
    echo "Check logs with: npm run docker:logs"
    exit 1
fi

# Run Prisma setup
echo "🔧 Setting up Prisma..."
npm run prisma:generate
npm run prisma:push

echo
echo "🎉 Docker PostgreSQL setup complete!"
echo
echo "📋 What's available:"
echo "   • PostgreSQL: localhost:5432"
echo "   • Database: smart_assistant"
echo "   • Username: postgres"
echo "   • Password: postgres"
echo
echo "🔧 Useful commands:"
echo "   • View logs: npm run docker:logs"
echo "   • Stop database: npm run docker:down"
echo "   • Start pgAdmin: npm run docker:pgadmin (http://localhost:5050)"
echo "   • Prisma Studio: npm run prisma:studio (http://localhost:5555)"
echo "   • Start your app: npm start"
echo
echo "📖 For more information, see DOCKER_SETUP.md"
