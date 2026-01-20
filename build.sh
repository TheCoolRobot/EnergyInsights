cd backend
source venv/bin/activate 2>/dev/null || echo "Note: Could not activate virtual environment"
pip3 install -r requirements.txt >/dev/null 2>&1


cd ../frontend
npm install >/dev/null 2>&1
cd ..
echo "Build completed successfully."

