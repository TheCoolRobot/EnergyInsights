# EnergyInsights 🔋⚡

AI-powered energy infrastructure analysis and planning platform. Visualize power plants, analyze regional energy demands, and get AI recommendations for optimal plant locations.

![Tech Stack](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-Llama_3.3_70B-orange)

## Features

- **Interactive Map**: Visualize existing power plants across the US
- **State Rankings**: Compare states by energy potential (solar, wind, nuclear, hydro)
- **AI Analyst**: Get intelligent location recommendations powered by Groq's Llama 3.3 70B
- **Energy Demand Analysis**: View current demand, growth projections, and peak hours
- **Real-time Statistics**: Track capacity, generation, and infrastructure data

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **Motor**: Async MongoDB driver
- **Groq API**: Llama 3.3 70B for AI analysis
- **Uvicorn**: ASGI server

### Frontend
- **React 19**: UI framework
- **Tailwind CSS**: Styling
- **Leaflet**: Interactive maps
- **Recharts**: Data visualization
- **shadcn/ui**: UI components

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js & Yarn
- MongoDB (local or Atlas)
- Groq API key (free at https://console.groq.com)

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd EnergyInsights
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt

   # Add your API key to .env
   # GROQ_API_KEY=your_key_here

   uvicorn server:app --reload
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   yarn install
   yarn start
   ```

4. **Open** http://localhost:3000

## Deployment

See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for complete deployment instructions to Vercel (all free tier!).

Quick deploy:
```bash
# Backend
cd backend
vercel --prod

# Frontend
cd frontend
vercel --prod
```

## Environment Variables

### Backend (.env)
```bash
MONGO_URL=mongodb://localhost:27017
DB_NAME=energy_insights
CORS_ORIGINS=*
GROQ_API_KEY=your_groq_api_key
```

### Frontend (.env)
```bash
REACT_APP_BACKEND_URL=http://localhost:8000
WDS_SOCKET_PORT=0
ENABLE_HEALTH_CHECK=false
```

## API Endpoints

- `GET /api/power-plants` - List all power plants
- `GET /api/state-scores` - State energy potential rankings
- `GET /api/distribution-hubs` - Distribution infrastructure
- `GET /api/statistics` - Overall statistics
- `POST /api/ai/suggest` - Get AI location recommendation
- `GET /api/comparison` - Energy type comparisons

## Project Structure

```
EnergyInsights/
├── backend/
│   ├── server.py           # FastAPI application
│   ├── requirements.txt    # Python dependencies
│   ├── .env               # Environment variables
│   └── vercel.json        # Vercel config
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   └── App.js         # Main app component
│   ├── public/
│   └── vercel.json        # Vercel config
└── README.md
```

## Development

### Backend
```bash
cd backend
source venv/bin/activate
uvicorn server:app --reload
```

### Frontend
```bash
cd frontend
yarn start
```

## License

MIT

## Contributing

Contributions welcome! Please open an issue or submit a PR.
