#!/bin/bash
set -e

# Install dependencies locally (ignore workspaces)
npm install --no-workspaces --legacy-peer-deps

# Generate Prisma client
npx prisma generate

# Build TypeScript
npx tsc

echo "Build completed successfully!"

