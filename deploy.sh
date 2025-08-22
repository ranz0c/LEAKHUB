#!/bin/bash

# LeakHub Deployment Script
# This script automates the deployment process for different platforms

set -e  # Exit on any error

echo "🚀 LeakHub Deployment Script"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Node.js $(node --version) detected"
}

# Install dependencies
install_deps() {
    print_status "Installing dependencies..."
    npm ci
    print_success "Dependencies installed"
}

# Build the project
build_project() {
    print_status "Building project for production..."
    npm run build
    print_success "Project built successfully"
}

# Deploy to GitHub Pages
deploy_github_pages() {
    print_status "Deploying to GitHub Pages..."
    
    # Check if git is initialized
    if [ ! -d ".git" ]; then
        print_error "Git repository not found. Please initialize git first."
        exit 1
    fi
    
    # Check if remote origin exists
    if ! git remote get-url origin &> /dev/null; then
        print_error "Git remote 'origin' not found. Please add your GitHub repository as origin."
        exit 1
    fi
    
    # Add all changes
    git add .
    
    # Commit changes
    git commit -m "Deploy LeakHub - $(date)"
    
    # Push to main branch
    git push origin main
    
    print_success "Deployed to GitHub Pages! Check your repository settings to enable GitHub Pages."
}

# Deploy to Vercel
deploy_vercel() {
    print_status "Deploying to Vercel..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    # Deploy
    vercel --prod
    
    print_success "Deployed to Vercel!"
}

# Deploy to Netlify
deploy_netlify() {
    print_status "Deploying to Netlify..."
    
    # Check if Netlify CLI is installed
    if ! command -v netlify &> /dev/null; then
        print_warning "Netlify CLI not found. Installing..."
        npm install -g netlify-cli
    fi
    
    # Deploy
    netlify deploy --prod --dir=dist
    
    print_success "Deployed to Netlify!"
}

# Show usage
show_usage() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  github    Deploy to GitHub Pages"
    echo "  vercel    Deploy to Vercel"
    echo "  netlify   Deploy to Netlify"
    echo "  build     Build project only"
    echo "  install   Install dependencies only"
    echo "  all       Deploy to all platforms"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 github    # Deploy to GitHub Pages"
    echo "  $0 vercel    # Deploy to Vercel"
    echo "  $0 all       # Deploy to all platforms"
}

# Main deployment function
main() {
    case "$1" in
        "github")
            check_node
            install_deps
            build_project
            deploy_github_pages
            ;;
        "vercel")
            check_node
            install_deps
            build_project
            deploy_vercel
            ;;
        "netlify")
            check_node
            install_deps
            build_project
            deploy_netlify
            ;;
        "build")
            check_node
            install_deps
            build_project
            ;;
        "install")
            check_node
            install_deps
            ;;
        "all")
            check_node
            install_deps
            build_project
            deploy_github_pages
            deploy_vercel
            deploy_netlify
            ;;
        "help"|"-h"|"--help")
            show_usage
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
