#!/bin/bash
# filepath: /home/siamax/Desktop/freelancer-client-info-grabber/run_or_deploy.sh

set -e

# Check if dependencies are already installed
if [ ! -d "node_modules" ]; then
    echo "First run detected. Installing dependencies..."
    npm i
    if [ $? -ne 0 ]; then
        echo "Failed to install dependencies."
        exit 1
    fi
    echo "Dependencies installed successfully!"
fi

# Display menu
menu() {
    echo "Choose an option:"
    echo "1) Start dev server (npm run dev)"
    echo "2) Deploy to GitHub Pages (npm run deploy)"
    echo "3) Run lint and depcheck"
    read -p "Enter your choice [1-3]: " choice

    case "$choice" in
        2) deploy ;;
        3) lint ;;
        *) dev ;;
    esac
}

# Deploy to GitHub Pages
deploy() {
    echo "Deploying to GitHub Pages..."
    npm run deploy
    if [ $? -ne 0 ]; then
        echo "Deployment failed."
        exit 1
    fi
    echo "Successfully deployed to GitHub Pages!"
    echo "Opening GitHub Pages site in your default browser..."
    sleep 5
    xdg-open https://ibrahimahtsham.github.io/freelancer-client-info-grabber/ || 
    open https://ibrahimahtsham.github.io/freelancer-client-info-grabber/ ||
    echo "Could not open browser automatically. Visit: https://ibrahimahtsham.github.io/freelancer-client-info-grabber/"
}

# Run lint and depcheck
lint() {
    echo "Running ESLint..."
    npm run lint
    echo
    echo "Running depcheck..."
    npx depcheck
}

# Start development server
dev() {
    echo "Starting dev server..."
    npm run dev
}

# Start the main menu
menu