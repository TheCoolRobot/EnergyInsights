echo -e "Starting backend server..."
cd backend
source venv/bin/activate 2>/dev/null || echo "Note: Could not activate virtual environment"
uvicorn server:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend
echo -e "Starting frontend server..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..



# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
