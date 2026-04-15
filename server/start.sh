#!/bin/bash
set -e

echo "🔄 Seeding admin user..."
node seed.js

echo "🚀 Starting server..."
npm start
