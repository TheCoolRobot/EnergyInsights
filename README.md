# EnergyInsights

AI-powered energy infrastructure analysis and planning platform. Visualize power plants, analyze regional energy demands, and get AI recommendations for optimal plant locations.

![Tech Stack](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Groq](https://img.shields.io/badge/Groq-Llama_3.3_70B-orange)

## Features

- **Interactive Map** : Visualize existing power plants across the US
- **State Rankings** : Compare states by energy potential (solar, wind, nuclear, hydro)
- **AI Analyst** : Get intelligent location recommendations powered by Groq's Llama 3.3 70B
- **Energy Demand Analysis** : View current demand, growth projections, and peak hours
- **Real-time Statistics** : Track capacity, generation, and infrastructure data

## Tech Stack

### Backend
- **FastAPI** : Modern Python web framework
- **Groq API** : Llama 3.3 70B for AI analysis
- **Uvicorn** : ASGI server

### Frontend
- **React 19** : UI framework
- **Tailwind CSS** : Styling
- **Leaflet** : Interactive maps
- **Recharts** : Data visualization
- **shadcn/ui** : UI components

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+ & Yarn
- Groq API key (free at https://console.groq.com)

### One-Command Setup

```bash
git clone <your-repo-url>
cd EnergyInsights
./run.sh
```

This will :
1. Create Python virtual environment (if needed)
2. Install backend dependencies
3. Install frontend dependencies (if needed)
4. Start backend on http://localhost:8000
5. Start frontend on http://localhost:3000

### Manual Setup

#### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --reload --port 8000
```

#### Frontend
```bash
cd frontend
yarn install
yarn start
```

## Environment Variables

### Backend (optional)

Create `backend/.env` :
```bash
# Required for AI features
GROQ_API_KEY=your_groq_api_key

# Optional
CORS_ORIGINS=*
```

**Note** : The app works without a Groq API key - only the AI Analyst feature will be disabled.

### Frontend (optional)

Create `frontend/.env` :
```bash
# For local development (defaults to localhost:8000 if not set)
REACT_APP_BACKEND_URL=http://localhost:8000

# For production deployment
REACT_APP_BACKEND_URL=https://your-backend-url.com
```

**Note** : If `REACT_APP_BACKEND_URL` is not set, the app defaults to `http://localhost:8000`.

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/power-plants` | List all power plants |
| `GET /api/state-scores` | State energy potential rankings |
| `GET /api/distribution-hubs` | Distribution infrastructure |
| `GET /api/statistics` | Overall statistics |
| `POST /api/ai/suggest` | Get AI location recommendation |
| `GET /api/comparison` | Energy type comparisons |
| `GET /api/rankings/{type}` | Rankings by energy type |

## Project Structure

```
EnergyInsights/
├── backend/
│   ├── server.py           # FastAPI application with data
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables (create this)
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   └── App.js         # Main app component
│   ├── public/
│   └── .env               # Environment variables (optional)
├── run.sh                  # One-command startup script
└── README.md
```

## Deployment

See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for deployment instructions.

## License

MIT

## Contributing

Contributions welcome! Please open an issue or submit a PR.
