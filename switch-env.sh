#!/bin/bash

# Get current branch name
BRANCH=$(git branch --show-current)

echo "🔄 Current branch: $BRANCH"

if [ "$BRANCH" = "production" ]; then
    echo "📦 Switching to production environment (ghanish.in)..."
    cp .env.production .env.local
    echo "✅ Environment switched to production"
    echo "🚀 Run: npm run dev"
elif [ "$BRANCH" = "testing" ]; then
    echo "🧪 Switching to testing environment (menu4.xyz)..."
    cp .env.testing .env.local
    echo "✅ Environment switched to testing"
    echo "🚀 Run: npm run dev"
else
    echo "⚠️  Unknown branch: $BRANCH"
    echo "Available branches: production, testing"
    echo "Usage: ./switch-env.sh"
fi
