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
    kill $MONGO_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up trap to catch SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM

# Start MongoDB
echo -e "${GREEN}Starting MongoDB...${NC}"
mongod --dbpath ./data/db --fork --logpath ./data/mongodb.log 2>/dev/null || {
    echo -e "${RED}Failed to start MongoDB. Trying without fork...${NC}"
    mongod --dbpath ./data/db &
    MONGO_PID=$!
}

# Wait a moment for MongoDB to start
sleep 2

# Start backend
echo -e "${GREEN}Starting backend server...${NC}"
cd backend
source venv/bin/activate 2>/dev/null || echo "Note: Could not activate virtual environment"
uvicorn server:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend
echo -e "${GREEN}Starting frontend server...${NC}"
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ MongoDB running${NC}"
echo -e "${GREEN}✓ Backend running on http://localhost:8000${NC}"
echo -e "${GREEN}✓ Frontend running on http://localhost:3000${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Press ${RED}Ctrl+C${NC} to stop both servers"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
