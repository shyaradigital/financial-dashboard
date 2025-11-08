#!/bin/bash

# Financial Dashboard - Ubuntu/Linux Installation Script
# Run this script: bash install-ubuntu.sh

set -e

echo "========================================"
echo "Financial Dashboard - Installation"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "${YELLOW}Checking Node.js installation...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js found: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js not found!${NC}"
    echo -e "${YELLOW}Installing Node.js...${NC}"
    
    # Check if running as root
    if [ "$EUID" -eq 0 ]; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
    else
        echo -e "${YELLOW}Please run as sudo or install Node.js manually:${NC}"
        echo "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
        echo "sudo apt-get install -y nodejs"
        exit 1
    fi
fi

# Check npm
echo -e "${YELLOW}Checking npm installation...${NC}"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓ npm found: $NPM_VERSION${NC}"
else
    echo -e "${RED}✗ npm not found!${NC}"
    exit 1
fi

# Install system dependencies (if needed)
echo -e "${YELLOW}Checking system dependencies...${NC}"
if [ "$EUID" -eq 0 ]; then
    apt-get update
    apt-get install -y build-essential libnss3-dev libatk-bridge2.0-dev libdrm2 libxkbcommon-dev libxcomposite-dev libxdamage-dev libxrandr-dev libgbm-dev libasound2-dev
else
    echo -e "${YELLOW}Note: Some system dependencies may be needed.${NC}"
    echo -e "${YELLOW}If build fails, run: sudo apt-get install -y build-essential libnss3-dev libatk-bridge2.0-dev libdrm2 libxkbcommon-dev libxcomposite-dev libxdamage-dev libxrandr-dev libgbm-dev libasound2-dev${NC}"
fi

# Install npm dependencies
echo ""
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to install dependencies!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Build application
echo ""
echo -e "${YELLOW}Building application...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Build failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Build successful${NC}"

# Create desktop entry
echo ""
echo -e "${YELLOW}Creating desktop shortcut...${NC}"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DESKTOP_DIR="$HOME/.local/share/applications"
mkdir -p "$DESKTOP_DIR"

cat > "$DESKTOP_DIR/financial-dashboard.desktop" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Financial Dashboard
Comment=Local-First Financial Management
Exec=sh -c "cd '$SCRIPT_DIR' && npm start"
Icon=application-x-executable
Terminal=false
Categories=Finance;Office;
StartupNotify=true
EOF

chmod +x "$DESKTOP_DIR/financial-dashboard.desktop"
echo -e "${GREEN}✓ Desktop shortcut created${NC}"

# Create launcher script
echo ""
echo -e "${YELLOW}Creating launcher script...${NC}"
cat > "$SCRIPT_DIR/launch-dashboard.sh" << EOF
#!/bin/bash
cd "$SCRIPT_DIR"
npm start
EOF

chmod +x "$SCRIPT_DIR/launch-dashboard.sh"
echo -e "${GREEN}✓ Launcher script created${NC}"

echo ""
echo "========================================"
echo -e "${GREEN}Installation Complete!${NC}"
echo "========================================"
echo ""
echo -e "${YELLOW}You can now:${NC}"
echo "1. Find 'Financial Dashboard' in your Applications menu"
echo "2. Or run: npm start"
echo "3. Or run: ./launch-dashboard.sh"
echo ""

