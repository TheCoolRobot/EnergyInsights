#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting EnergyInsights...${NC}"

# Function to cleanup background processes on exit
cleanup() {
    echo -e "\n${RED}Shutting down services...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then kill $BACKEND_PID 2>/dev/null; fi
    if [ ! -z "$FRONTEND_PID" ]; then kill $FRONTEND_PID 2>/dev/null; fi
    exit 0
}

# Set up trap to catch SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM

# --- Backend Setup ---
echo -e "${BLUE}Setting up Backend...${NC}"
cd backend || exit

# Create venv if missing
if [ ! -d "venv" ]; then
    echo -e "${GREEN}Creating Python virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate venv
source venv/bin/activate

# Install dependencies
echo -e "${GREEN}Installing backend dependencies...${NC}"
pip install -q -r requirements.txt

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install backend dependencies.${NC}"
    exit 1
fi
cd ..

# --- Frontend Setup ---
echo -e "${BLUE}Setting up Frontend...${NC}"
cd frontend || exit

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${GREEN}Installing frontend dependencies...${NC}"
    yarn install
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to install frontend dependencies.${NC}"
        exit 1
    fi
fi
cd ..

# --- Start Services ---

# Start backend
echo -e "${GREEN}Starting backend server...${NC}"
cd backend
source venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend
echo -e "${GREEN}Starting frontend server...${NC}"
cd frontend
yarn start &
FRONTEND_PID=$!
cd ..

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Backend running on http://localhost:8000${NC}"
echo -e "${GREEN}✓ Frontend running on http://localhost:3000${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Press ${RED}Ctrl+C${NC} to stop both servers"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
