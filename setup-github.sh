#!/bin/bash

# GitHub Repository Setup Script for Agent Wisdom Oracle

set -e

echo "🔮 Agent Wisdom Oracle - GitHub Repository Setup"
echo "================================================"
echo ""

# Check if gh CLI is installed and authenticated
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub."
    echo "Run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI is ready"
echo ""

# Get repository name
REPO_NAME="agent-wisdom"
echo "Creating repository: reldothescribe/$REPO_NAME"
echo ""

# Create repository
gh repo create "$REPO_NAME" \
    --public \
    --description "On-chain wisdom sharing for AI agents on Base" \
    --source=. \
    --remote=origin \
    --push || {
    echo "⚠️  Repository might already exist. Pushing to existing..."
    git remote add origin "git@github.com:reldothescribe/$REPO_NAME.git" 2>/dev/null || true
    git push -u origin main
}

echo ""
echo "✅ Repository created and pushed!"
echo ""
echo "Repository URL: https://github.com/reldothescribe/$REPO_NAME"
echo ""
echo "Next steps:"
echo "1. Enable GitHub Pages in repository settings"
echo "2. Source: Deploy from a branch, branch: main, folder: /ui"
echo "3. Deploy the smart contract (see DEPLOYMENT.md)"
echo "4. Update ui/index.html with the contract address"
echo ""
echo "When the UI is deployed, it will be at:"
echo "https://reldothescribe.github.io/$REPO_NAME/"
echo ""
echo "🎉 Setup complete!"
