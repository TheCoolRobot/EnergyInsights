from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
from openai import OpenAI
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'energy_insights')]

# Groq API Configuration
GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '')
groq_client = OpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)

# Create the main app
app = FastAPI(title="EcoVolt Geo API")
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ============== DATA MODELS ==============

class PowerPlant(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: str  # solar, wind, nuclear, hydro
    lat: float
    lng: float
    capacity_mw: float
    status: str  # operational, planned, under_construction
    state: str
    year_built: Optional[int] = None

class EnergyResource(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # solar_irradiance, wind_speed, uranium_reserve, hydro_potential
    lat: float
    lng: float
    value: float
    unit: str
    state: str

class StateScore(BaseModel):
    state_code: str
    state_name: str
    solar_score: float
    wind_score: float
    nuclear_score: float
    hydro_score: float
    overall_score: float

class DistributionHub(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    lat: float
    lng: float
    capacity_mw: float
    state: str

class LocationRanking(BaseModel):
    rank: int
    lat: float
    lng: float
    state: str
    score: float
    energy_type: str
    reasoning: str

class AISuggestionRequest(BaseModel):
    state: Optional[str] = None
    energy_type: Optional[str] = None
    budget_millions: Optional[float] = None

class AISuggestion(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    location_name: str
    lat: float
    lng: float
    state: str
    energy_type: str
    recommended_capacity_mw: float
    estimated_cost_millions: float
    score: int  # 1-100
    energy_demand: Dict[str, Any]  # current demand, projected growth, peak hours
    financial_analysis: Dict[str, Any]  # revenue projections, payback period, ROI
    specifications: Dict[str, Any]
    reasoning: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ============== SAMPLE DATA ==============

POWER_PLANTS_DATA = [
    # Solar Plants
    {"name": "Solar Star", "type": "solar", "lat": 34.8361, "lng": -118.5503, "capacity_mw": 579, "status": "operational", "state": "CA", "year_built": 2015},
    {"name": "Topaz Solar Farm", "type": "solar", "lat": 35.3833, "lng": -119.9500, "capacity_mw": 550, "status": "operational", "state": "CA", "year_built": 2014},
    {"name": "Desert Sunlight", "type": "solar", "lat": 33.8272, "lng": -115.4172, "capacity_mw": 550, "status": "operational", "state": "CA", "year_built": 2015},
    {"name": "Copper Mountain Solar", "type": "solar", "lat": 35.7847, "lng": -114.9769, "capacity_mw": 458, "status": "operational", "state": "NV", "year_built": 2015},
    {"name": "Agua Caliente", "type": "solar", "lat": 32.9500, "lng": -113.5167, "capacity_mw": 397, "status": "operational", "state": "AZ", "year_built": 2014},
    {"name": "Mesquite Solar", "type": "solar", "lat": 33.2294, "lng": -112.8956, "capacity_mw": 400, "status": "operational", "state": "AZ", "year_built": 2016},
    {"name": "Roadrunner Solar", "type": "solar", "lat": 32.2539, "lng": -106.7544, "capacity_mw": 497, "status": "planned", "state": "NM", "year_built": None},
    {"name": "Phoebe Solar", "type": "solar", "lat": 31.7619, "lng": -103.0528, "capacity_mw": 315, "status": "operational", "state": "TX", "year_built": 2020},
    {"name": "Blythe Solar", "type": "solar", "lat": 33.6103, "lng": -114.5886, "capacity_mw": 485, "status": "operational", "state": "CA", "year_built": 2016},
    {"name": "California Valley Solar", "type": "solar", "lat": 35.3381, "lng": -119.8589, "capacity_mw": 250, "status": "operational", "state": "CA", "year_built": 2013},
    {"name": "Antelope Valley Solar", "type": "solar", "lat": 34.6678, "lng": -118.1211, "capacity_mw": 266, "status": "operational", "state": "CA", "year_built": 2014},
    {"name": "Nellis Solar", "type": "solar", "lat": 36.2356, "lng": -115.0539, "capacity_mw": 14, "status": "operational", "state": "NV", "year_built": 2007},
    {"name": "Mount Signal Solar", "type": "solar", "lat": 32.6869, "lng": -115.5811, "capacity_mw": 265, "status": "operational", "state": "CA", "year_built": 2014},
    {"name": "Crescent Dunes Solar", "type": "solar", "lat": 38.2403, "lng": -117.3647, "capacity_mw": 110, "status": "operational", "state": "NV", "year_built": 2015},
    {"name": "Maricopa West Solar", "type": "solar", "lat": 33.0186, "lng": -112.7728, "capacity_mw": 28, "status": "operational", "state": "AZ", "year_built": 2012},
    {"name": "Rosamond Solar", "type": "solar", "lat": 34.8642, "lng": -118.1631, "capacity_mw": 125, "status": "operational", "state": "CA", "year_built": 2019},
    {"name": "Springbok Solar", "type": "solar", "lat": 34.5981, "lng": -118.4203, "capacity_mw": 161, "status": "operational", "state": "CA", "year_built": 2016},
    {"name": "Samson Solar", "type": "solar", "lat": 31.8200, "lng": -102.9978, "capacity_mw": 591, "status": "operational", "state": "TX", "year_built": 2021},
    {"name": "Pflugerville Solar", "type": "solar", "lat": 30.4394, "lng": -97.6203, "capacity_mw": 139, "status": "operational", "state": "TX", "year_built": 2019},
    {"name": "Brilliant Solar", "type": "solar", "lat": 40.8539, "lng": -80.6106, "capacity_mw": 100, "status": "operational", "state": "PA", "year_built": 2022},

    # Wind Plants
    {"name": "Alta Wind Energy", "type": "wind", "lat": 35.0800, "lng": -118.3700, "capacity_mw": 1548, "status": "operational", "state": "CA", "year_built": 2014},
    {"name": "Roscoe Wind Farm", "type": "wind", "lat": 32.4500, "lng": -100.5500, "capacity_mw": 782, "status": "operational", "state": "TX", "year_built": 2009},
    {"name": "Horse Hollow Wind", "type": "wind", "lat": 32.0700, "lng": -100.2300, "capacity_mw": 736, "status": "operational", "state": "TX", "year_built": 2006},
    {"name": "Shepherds Flat", "type": "wind", "lat": 45.5700, "lng": -120.0500, "capacity_mw": 845, "status": "operational", "state": "OR", "year_built": 2012},
    {"name": "Capricorn Ridge Wind", "type": "wind", "lat": 31.9500, "lng": -100.4500, "capacity_mw": 662, "status": "operational", "state": "TX", "year_built": 2008},
    {"name": "Fowler Ridge Wind", "type": "wind", "lat": 40.6167, "lng": -87.3833, "capacity_mw": 600, "status": "operational", "state": "IN", "year_built": 2010},
    {"name": "Sunrise Wind", "type": "wind", "lat": 40.8900, "lng": -72.2000, "capacity_mw": 924, "status": "planned", "state": "NY", "year_built": None},
    {"name": "Vineyard Wind", "type": "wind", "lat": 41.1333, "lng": -70.5833, "capacity_mw": 800, "status": "under_construction", "state": "MA", "year_built": None},
    {"name": "Sweetwater Wind", "type": "wind", "lat": 32.3897, "lng": -100.3619, "capacity_mw": 585, "status": "operational", "state": "TX", "year_built": 2007},
    {"name": "Buffalo Gap Wind", "type": "wind", "lat": 32.2850, "lng": -99.8444, "capacity_mw": 523, "status": "operational", "state": "TX", "year_built": 2008},
    {"name": "Panther Creek Wind", "type": "wind", "lat": 32.3283, "lng": -100.4056, "capacity_mw": 458, "status": "operational", "state": "TX", "year_built": 2008},
    {"name": "Cedar Creek Wind", "type": "wind", "lat": 38.1267, "lng": -96.7683, "capacity_mw": 427, "status": "operational", "state": "CO", "year_built": 2011},
    {"name": "Peetz Table Wind", "type": "wind", "lat": 40.9150, "lng": -103.5728, "capacity_mw": 405, "status": "operational", "state": "CO", "year_built": 2011},
    {"name": "Twin Groves Wind", "type": "wind", "lat": 40.5644, "lng": -88.8522, "capacity_mw": 396, "status": "operational", "state": "IL", "year_built": 2008},
    {"name": "Meadow Lake Wind", "type": "wind", "lat": 40.6528, "lng": -87.0092, "capacity_mw": 801, "status": "operational", "state": "IN", "year_built": 2010},
    {"name": "Smoky Hills Wind", "type": "wind", "lat": 38.6694, "lng": -97.6683, "capacity_mw": 344, "status": "operational", "state": "KS", "year_built": 2008},
    {"name": "Flat Ridge Wind", "type": "wind", "lat": 37.5833, "lng": -96.7500, "capacity_mw": 470, "status": "operational", "state": "KS", "year_built": 2011},
    {"name": "Stateline Wind", "type": "wind", "lat": 45.9467, "lng": -119.0947, "capacity_mw": 300, "status": "operational", "state": "WA", "year_built": 2001},
    {"name": "Wild Horse Wind", "type": "wind", "lat": 46.8536, "lng": -120.0522, "capacity_mw": 273, "status": "operational", "state": "WA", "year_built": 2006},
    {"name": "Nine Canyon Wind", "type": "wind", "lat": 46.1439, "lng": -119.3417, "capacity_mw": 96, "status": "operational", "state": "WA", "year_built": 2003},
    {"name": "Klondike Wind", "type": "wind", "lat": 45.8542, "lng": -120.6247, "capacity_mw": 225, "status": "operational", "state": "OR", "year_built": 2010},
    {"name": "Wheatridge Wind", "type": "wind", "lat": 45.6031, "lng": -120.5208, "capacity_mw": 300, "status": "operational", "state": "OR", "year_built": 2020},
    {"name": "Combine Hills Wind", "type": "wind", "lat": 45.6439, "lng": -120.3911, "capacity_mw": 85, "status": "operational", "state": "OR", "year_built": 2009},

    # Nuclear Plants
    {"name": "Palo Verde", "type": "nuclear", "lat": 33.3883, "lng": -112.8617, "capacity_mw": 3937, "status": "operational", "state": "AZ", "year_built": 1986},
    {"name": "South Texas Project", "type": "nuclear", "lat": 28.7956, "lng": -96.0483, "capacity_mw": 2710, "status": "operational", "state": "TX", "year_built": 1988},
    {"name": "Braidwood", "type": "nuclear", "lat": 41.2422, "lng": -88.2133, "capacity_mw": 2389, "status": "operational", "state": "IL", "year_built": 1988},
    {"name": "Byron", "type": "nuclear", "lat": 42.0756, "lng": -89.2817, "capacity_mw": 2347, "status": "operational", "state": "IL", "year_built": 1985},
    {"name": "Vogtle", "type": "nuclear", "lat": 33.1417, "lng": -81.7628, "capacity_mw": 4536, "status": "operational", "state": "GA", "year_built": 2023},
    {"name": "Diablo Canyon", "type": "nuclear", "lat": 35.2117, "lng": -120.8544, "capacity_mw": 2256, "status": "operational", "state": "CA", "year_built": 1985},
    {"name": "Browns Ferry", "type": "nuclear", "lat": 34.7042, "lng": -87.1186, "capacity_mw": 3458, "status": "operational", "state": "AL", "year_built": 1974},
    {"name": "Sequoyah", "type": "nuclear", "lat": 35.2281, "lng": -85.0903, "capacity_mw": 2441, "status": "operational", "state": "TN", "year_built": 1981},
    {"name": "McGuire", "type": "nuclear", "lat": 35.4322, "lng": -80.9486, "capacity_mw": 2316, "status": "operational", "state": "NC", "year_built": 1981},
    {"name": "Catawba", "type": "nuclear", "lat": 35.0539, "lng": -81.0742, "capacity_mw": 2310, "status": "operational", "state": "NC", "year_built": 1985},
    {"name": "Peach Bottom", "type": "nuclear", "lat": 39.7589, "lng": -76.2692, "capacity_mw": 2322, "status": "operational", "state": "PA", "year_built": 1974},
    {"name": "Susquehanna", "type": "nuclear", "lat": 41.0931, "lng": -76.1503, "capacity_mw": 2544, "status": "operational", "state": "PA", "year_built": 1983},
    {"name": "Limerick", "type": "nuclear", "lat": 40.2247, "lng": -75.5869, "capacity_mw": 2317, "status": "operational", "state": "PA", "year_built": 1986},
    {"name": "Salem", "type": "nuclear", "lat": 39.4631, "lng": -75.5356, "capacity_mw": 2299, "status": "operational", "state": "NJ", "year_built": 1977},
    {"name": "Watts Bar", "type": "nuclear", "lat": 35.6014, "lng": -84.7864, "capacity_mw": 2440, "status": "operational", "state": "TN", "year_built": 2016},
    {"name": "Grand Gulf", "type": "nuclear", "lat": 32.0278, "lng": -91.0522, "capacity_mw": 1443, "status": "operational", "state": "MS", "year_built": 1985},
    {"name": "Callaway", "type": "nuclear", "lat": 38.7619, "lng": -91.7819, "capacity_mw": 1236, "status": "operational", "state": "MO", "year_built": 1984},
    {"name": "Wolf Creek", "type": "nuclear", "lat": 38.2406, "lng": -95.6831, "capacity_mw": 1200, "status": "operational", "state": "KS", "year_built": 1985},
    {"name": "Seabrook", "type": "nuclear", "lat": 42.8942, "lng": -70.8503, "capacity_mw": 1295, "status": "operational", "state": "NH", "year_built": 1990},

    # Hydro Plants
    {"name": "Grand Coulee Dam", "type": "hydro", "lat": 47.9656, "lng": -118.9819, "capacity_mw": 6809, "status": "operational", "state": "WA", "year_built": 1942},
    {"name": "Bath County", "type": "hydro", "lat": 38.2167, "lng": -79.8000, "capacity_mw": 3003, "status": "operational", "state": "VA", "year_built": 1985},
    {"name": "Chief Joseph Dam", "type": "hydro", "lat": 47.9958, "lng": -119.6350, "capacity_mw": 2614, "status": "operational", "state": "WA", "year_built": 1958},
    {"name": "Robert Moses Niagara", "type": "hydro", "lat": 43.1361, "lng": -79.0450, "capacity_mw": 2525, "status": "operational", "state": "NY", "year_built": 1961},
    {"name": "John Day Dam", "type": "hydro", "lat": 45.7150, "lng": -120.6939, "capacity_mw": 2160, "status": "operational", "state": "OR", "year_built": 1971},
    {"name": "Hoover Dam", "type": "hydro", "lat": 36.0156, "lng": -114.7378, "capacity_mw": 2080, "status": "operational", "state": "NV", "year_built": 1936},
    {"name": "Glen Canyon Dam", "type": "hydro", "lat": 36.9381, "lng": -111.4844, "capacity_mw": 1320, "status": "operational", "state": "AZ", "year_built": 1966},
    {"name": "The Dalles Dam", "type": "hydro", "lat": 45.6144, "lng": -121.1392, "capacity_mw": 1780, "status": "operational", "state": "OR", "year_built": 1957},
    {"name": "Bonneville Dam", "type": "hydro", "lat": 45.6444, "lng": -121.9406, "capacity_mw": 1092, "status": "operational", "state": "OR", "year_built": 1938},
    {"name": "McNary Dam", "type": "hydro", "lat": 45.9353, "lng": -119.2981, "capacity_mw": 1127, "status": "operational", "state": "WA", "year_built": 1954},
    {"name": "Priest Rapids Dam", "type": "hydro", "lat": 46.6375, "lng": -119.9131, "capacity_mw": 956, "status": "operational", "state": "WA", "year_built": 1959},
    {"name": "Wanapum Dam", "type": "hydro", "lat": 46.8717, "lng": -119.9764, "capacity_mw": 1092, "status": "operational", "state": "WA", "year_built": 1963},
    {"name": "Rocky Reach Dam", "type": "hydro", "lat": 47.4931, "lng": -120.3011, "capacity_mw": 1287, "status": "operational", "state": "WA", "year_built": 1961},
    {"name": "Wells Dam", "type": "hydro", "lat": 47.9508, "lng": -119.8553, "capacity_mw": 840, "status": "operational", "state": "WA", "year_built": 1967},
    {"name": "Ice Harbor Dam", "type": "hydro", "lat": 46.2606, "lng": -118.8789, "capacity_mw": 603, "status": "operational", "state": "WA", "year_built": 1962},
    {"name": "Lower Granite Dam", "type": "hydro", "lat": 46.6628, "lng": -117.4328, "capacity_mw": 810, "status": "operational", "state": "WA", "year_built": 1975},
    {"name": "Little Goose Dam", "type": "hydro", "lat": 46.5867, "lng": -118.0344, "capacity_mw": 810, "status": "operational", "state": "WA", "year_built": 1970},
    {"name": "Boundary Dam", "type": "hydro", "lat": 48.9944, "lng": -117.3206, "capacity_mw": 1055, "status": "operational", "state": "WA", "year_built": 1967},
    {"name": "Dworshak Dam", "type": "hydro", "lat": 46.5150, "lng": -116.2978, "capacity_mw": 400, "status": "operational", "state": "ID", "year_built": 1973},
]

STATE_SCORES_DATA = [
    {"state_code": "CA", "state_name": "California", "solar_score": 92, "wind_score": 78, "nuclear_score": 45, "hydro_score": 65, "overall_score": 82},
    {"state_code": "TX", "state_name": "Texas", "solar_score": 88, "wind_score": 95, "nuclear_score": 70, "hydro_score": 35, "overall_score": 85},
    {"state_code": "AZ", "state_name": "Arizona", "solar_score": 95, "wind_score": 55, "nuclear_score": 78, "hydro_score": 40, "overall_score": 75},
    {"state_code": "NV", "state_name": "Nevada", "solar_score": 94, "wind_score": 60, "nuclear_score": 50, "hydro_score": 45, "overall_score": 72},
    {"state_code": "NM", "state_name": "New Mexico", "solar_score": 90, "wind_score": 70, "nuclear_score": 55, "hydro_score": 25, "overall_score": 68},
    {"state_code": "WA", "state_name": "Washington", "solar_score": 45, "wind_score": 75, "nuclear_score": 60, "hydro_score": 98, "overall_score": 78},
    {"state_code": "OR", "state_name": "Oregon", "solar_score": 50, "wind_score": 82, "nuclear_score": 40, "hydro_score": 90, "overall_score": 72},
    {"state_code": "WY", "state_name": "Wyoming", "solar_score": 65, "wind_score": 92, "nuclear_score": 75, "hydro_score": 30, "overall_score": 70},
    {"state_code": "IL", "state_name": "Illinois", "solar_score": 55, "wind_score": 78, "nuclear_score": 88, "hydro_score": 35, "overall_score": 68},
    {"state_code": "NY", "state_name": "New York", "solar_score": 50, "wind_score": 70, "nuclear_score": 65, "hydro_score": 85, "overall_score": 70},
    {"state_code": "GA", "state_name": "Georgia", "solar_score": 75, "wind_score": 45, "nuclear_score": 85, "hydro_score": 50, "overall_score": 68},
    {"state_code": "FL", "state_name": "Florida", "solar_score": 85, "wind_score": 35, "nuclear_score": 60, "hydro_score": 20, "overall_score": 58},
    {"state_code": "CO", "state_name": "Colorado", "solar_score": 82, "wind_score": 85, "nuclear_score": 45, "hydro_score": 55, "overall_score": 75},
    {"state_code": "ND", "state_name": "North Dakota", "solar_score": 55, "wind_score": 95, "nuclear_score": 40, "hydro_score": 45, "overall_score": 65},
    {"state_code": "SD", "state_name": "South Dakota", "solar_score": 60, "wind_score": 90, "nuclear_score": 35, "hydro_score": 60, "overall_score": 65},
    {"state_code": "KS", "state_name": "Kansas", "solar_score": 75, "wind_score": 92, "nuclear_score": 50, "hydro_score": 25, "overall_score": 68},
    {"state_code": "OK", "state_name": "Oklahoma", "solar_score": 78, "wind_score": 88, "nuclear_score": 55, "hydro_score": 40, "overall_score": 72},
    {"state_code": "MT", "state_name": "Montana", "solar_score": 60, "wind_score": 85, "nuclear_score": 45, "hydro_score": 75, "overall_score": 70},
    {"state_code": "ID", "state_name": "Idaho", "solar_score": 65, "wind_score": 70, "nuclear_score": 60, "hydro_score": 85, "overall_score": 72},
    {"state_code": "UT", "state_name": "Utah", "solar_score": 88, "wind_score": 65, "nuclear_score": 70, "hydro_score": 50, "overall_score": 72},
]

DISTRIBUTION_HUBS_DATA = [
    {"name": "Palo Verde Hub", "lat": 33.4500, "lng": -112.9000, "capacity_mw": 5000, "state": "AZ"},
    {"name": "Four Corners Hub", "lat": 36.7500, "lng": -108.4500, "capacity_mw": 4500, "state": "NM"},
    {"name": "Bonneville Power Hub", "lat": 45.6500, "lng": -121.9500, "capacity_mw": 8000, "state": "WA"},
    {"name": "ERCOT Central Hub", "lat": 30.2500, "lng": -97.7500, "capacity_mw": 12000, "state": "TX"},
    {"name": "PJM Hub East", "lat": 39.9500, "lng": -75.1500, "capacity_mw": 15000, "state": "PA"},
    {"name": "MISO Central Hub", "lat": 41.8800, "lng": -87.6300, "capacity_mw": 10000, "state": "IL"},
    {"name": "CAISO Hub", "lat": 37.3500, "lng": -121.9500, "capacity_mw": 9000, "state": "CA"},
    {"name": "SPP Hub", "lat": 35.4700, "lng": -97.5200, "capacity_mw": 7500, "state": "OK"},
]

LOCATION_RANKINGS = {
    "solar": [
        {"rank": 1, "lat": 33.9, "lng": -116.5, "state": "CA", "score": 98, "reasoning": "Highest solar irradiance, minimal cloud cover, existing grid infrastructure"},
        {"rank": 2, "lat": 32.7, "lng": -113.4, "state": "AZ", "score": 96, "reasoning": "Excellent solar potential, low land costs, strong policy support"},
        {"rank": 3, "lat": 36.1, "lng": -115.1, "state": "NV", "score": 94, "reasoning": "High solar irradiance, available land, renewable energy mandates"},
        {"rank": 4, "lat": 32.0, "lng": -110.9, "state": "AZ", "score": 92, "reasoning": "Strong solar resources, growing energy demand, grid capacity"},
        {"rank": 5, "lat": 31.8, "lng": -106.5, "state": "NM", "score": 90, "reasoning": "High solar potential, tax incentives, land availability"},
    ],
    "wind": [
        {"rank": 1, "lat": 32.4, "lng": -100.5, "state": "TX", "score": 97, "reasoning": "Class 7 wind resources, extensive transmission, favorable regulations"},
        {"rank": 2, "lat": 47.5, "lng": -100.8, "state": "ND", "score": 95, "reasoning": "Strongest wind corridor, low population density, growing grid"},
        {"rank": 3, "lat": 38.5, "lng": -99.3, "state": "KS", "score": 93, "reasoning": "Consistent wind patterns, agricultural integration, tax benefits"},
        {"rank": 4, "lat": 35.5, "lng": -101.8, "state": "TX", "score": 92, "reasoning": "Excellent wind speeds, ERCOT access, proven development area"},
        {"rank": 5, "lat": 42.8, "lng": -108.7, "state": "WY", "score": 90, "reasoning": "High capacity factor potential, energy export opportunities"},
    ],
    "nuclear": [
        {"rank": 1, "lat": 33.2, "lng": -81.8, "state": "GA", "score": 95, "reasoning": "Existing infrastructure, skilled workforce, state support, cooling water access"},
        {"rank": 2, "lat": 41.2, "lng": -88.2, "state": "IL", "score": 93, "reasoning": "Nuclear expertise, baseload demand, regulatory experience"},
        {"rank": 3, "lat": 33.5, "lng": -112.5, "state": "AZ", "score": 91, "reasoning": "Proven site, water recycling capability, grid needs"},
        {"rank": 4, "lat": 28.9, "lng": -96.1, "state": "TX", "score": 89, "reasoning": "Growing demand, existing plant expansion potential, Gulf cooling"},
        {"rank": 5, "lat": 35.2, "lng": -120.8, "state": "CA", "score": 87, "reasoning": "Baseload replacement needs, existing site, policy shifts"},
    ],
    "hydro": [
        {"rank": 1, "lat": 47.9, "lng": -118.9, "state": "WA", "score": 96, "reasoning": "Columbia River system, existing infrastructure, expansion potential"},
        {"rank": 2, "lat": 45.7, "lng": -120.7, "state": "OR", "score": 94, "reasoning": "Major river systems, pumped storage sites, grid integration"},
        {"rank": 3, "lat": 43.0, "lng": -79.0, "state": "NY", "score": 92, "reasoning": "Niagara system, pumped storage potential, demand center proximity"},
        {"rank": 4, "lat": 38.2, "lng": -79.8, "state": "VA", "score": 90, "reasoning": "Appalachian pumped storage, grid stability needs"},
        {"rank": 5, "lat": 46.8, "lng": -117.4, "state": "ID", "score": 88, "reasoning": "Snake River system, expansion sites, regional integration"},
    ]
}

# ============== API ENDPOINTS ==============

@api_router.get("/")
async def root():
    return {"message": "EcoVolt Geo API - Renewable Energy Infrastructure Analysis"}

@api_router.get("/power-plants", response_model=List[PowerPlant])
async def get_power_plants(
    type: Optional[str] = None,
    state: Optional[str] = None,
    status: Optional[str] = None
):
    """Get all power plants with optional filters"""
    plants = [PowerPlant(**plant) for plant in POWER_PLANTS_DATA]
    
    if type:
        plants = [p for p in plants if p.type == type]
    if state:
        plants = [p for p in plants if p.state == state]
    if status:
        plants = [p for p in plants if p.status == status]
    
    return plants

@api_router.get("/state-scores", response_model=List[StateScore])
async def get_state_scores():
    """Get optimization scores for all states"""
    return [StateScore(**score) for score in STATE_SCORES_DATA]

@api_router.get("/distribution-hubs", response_model=List[DistributionHub])
async def get_distribution_hubs():
    """Get all electricity distribution hubs"""
    return [DistributionHub(**hub) for hub in DISTRIBUTION_HUBS_DATA]

@api_router.get("/rankings/{energy_type}", response_model=List[LocationRanking])
async def get_rankings(energy_type: str):
    """Get location rankings for a specific energy type (solar, wind, nuclear, hydro)"""
    if energy_type not in LOCATION_RANKINGS:
        raise HTTPException(status_code=400, detail=f"Invalid energy type. Must be one of: solar, wind, nuclear, hydro")
    
    rankings = []
    for r in LOCATION_RANKINGS[energy_type]:
        rankings.append(LocationRanking(energy_type=energy_type, **r))
    
    return rankings

@api_router.get("/statistics")
async def get_statistics():
    """Get overall statistics for the dashboard"""
    plants = [PowerPlant(**plant) for plant in POWER_PLANTS_DATA]
    
    stats = {
        "total_plants": len(plants),
        "total_capacity_mw": sum(p.capacity_mw for p in plants),
        "by_type": {},
        "by_status": {},
        "states_covered": len(set(p.state for p in plants))
    }
    
    for energy_type in ["solar", "wind", "nuclear", "hydro"]:
        type_plants = [p for p in plants if p.type == energy_type]
        stats["by_type"][energy_type] = {
            "count": len(type_plants),
            "capacity_mw": sum(p.capacity_mw for p in type_plants)
        }
    
    for status in ["operational", "planned", "under_construction"]:
        status_plants = [p for p in plants if p.status == status]
        stats["by_status"][status] = len(status_plants)
    
    return stats

@api_router.post("/ai/suggest", response_model=AISuggestion)
async def ai_suggest_location(request: AISuggestionRequest):
    """Use AI to suggest optimal power plant locations"""
    try:
        system_message = """You are an expert renewable energy infrastructure analyst.
Analyze location data and provide specific recommendations for new power plant installations.
Always respond in valid JSON format with the following structure:
{
    "location_name": "Descriptive name for the location",
    "lat": float (latitude between 25-49 for continental US),
    "lng": float (longitude between -125 to -70 for continental US),
    "state": "two-letter state code",
    "energy_type": "solar|wind|nuclear|hydro",
    "recommended_capacity_mw": float,
    "estimated_cost_millions": float,
    "score": int (1-100),
    "energy_demand": {
        "current_demand_mw": float (current regional energy demand in MW),
        "projected_growth_percent": float (annual growth rate),
        "peak_demand_hours": string (time period of peak demand),
        "demand_drivers": string (industries/factors driving demand)
    },
    "financial_analysis": {
        "annual_revenue_millions": float (estimated annual revenue in millions USD),
        "annual_operating_cost_millions": float (yearly operating expenses),
        "payback_period_years": float (years until investment breaks even),
        "roi_20_year_percent": float (20-year return on investment percentage),
        "net_present_value_millions": float (NPV over 20 years)
    },
    "specifications": {
        "key": "value pairs relevant to the energy type"
    },
    "reasoning": "Detailed explanation of why this location is optimal, including energy demand and financial viability"
}"""

        prompt = f"""Suggest an optimal location for a new power plant with these preferences:
- State preference: {request.state or 'Any US state'}
- Energy type preference: {request.energy_type or 'Best suited type for region'}
- Budget: {request.budget_millions or 'Not specified'} million USD

Consider:
1. Natural resource availability (solar irradiance, wind patterns, water access, uranium proximity)
2. Existing grid infrastructure
3. Land availability and costs
4. Environmental regulations
5. Population centers and energy demand (current usage, growth projections, peak hours, demand drivers)
6. Regional industries and economic factors affecting energy consumption
7. Financial viability: Calculate annual revenue based on electricity rates (~$50-80/MWh), operating costs (10-30% of revenue), payback period, and ROI

Provide a complete financial analysis including:
- Annual revenue projections based on capacity factor and electricity prices
- Operating costs
- Payback period (when cumulative revenue exceeds initial investment)
- 20-year ROI percentage
- Net Present Value using 7% discount rate

Return your recommendation as a single JSON object."""

        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )

        response_text = response.choices[0].message.content.strip()

        import json
        # Parse the JSON response
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        
        suggestion_data = json.loads(response_text.strip())
        
        return AISuggestion(
            location_name=suggestion_data.get("location_name", "AI Recommended Site"),
            lat=float(suggestion_data.get("lat", 35.0)),
            lng=float(suggestion_data.get("lng", -100.0)),
            state=suggestion_data.get("state", "TX"),
            energy_type=suggestion_data.get("energy_type", request.energy_type or "solar"),
            recommended_capacity_mw=float(suggestion_data.get("recommended_capacity_mw", 500)),
            estimated_cost_millions=float(suggestion_data.get("estimated_cost_millions", 750)),
            score=int(suggestion_data.get("score", 85)),
            energy_demand=suggestion_data.get("energy_demand", {
                "current_demand_mw": 5000,
                "projected_growth_percent": 3.5,
                "peak_demand_hours": "2-8 PM",
                "demand_drivers": "Growing population and commercial activity"
            }),
            financial_analysis=suggestion_data.get("financial_analysis", {
                "annual_revenue_millions": 35.0,
                "annual_operating_cost_millions": 8.5,
                "payback_period_years": 12.5,
                "roi_20_year_percent": 185.0,
                "net_present_value_millions": 125.0
            }),
            specifications=suggestion_data.get("specifications", {}),
            reasoning=suggestion_data.get("reasoning", "AI-generated recommendation based on available data")
        )
        
    except Exception as e:
        logger.error(f"AI suggestion error: {str(e)}")
        # Return a fallback suggestion
        return AISuggestion(
            location_name="Recommended Solar Installation Site",
            lat=33.45,
            lng=-112.07,
            state=request.state or "AZ",
            energy_type=request.energy_type or "solar",
            recommended_capacity_mw=450,
            estimated_cost_millions=680,
            score=88,
            energy_demand={
                "current_demand_mw": 8500,
                "projected_growth_percent": 4.2,
                "peak_demand_hours": "3-7 PM daily",
                "demand_drivers": "Data centers, manufacturing, residential cooling"
            },
            financial_analysis={
                "annual_revenue_millions": 42.5,
                "annual_operating_cost_millions": 10.2,
                "payback_period_years": 11.8,
                "roi_20_year_percent": 195.0,
                "net_present_value_millions": 145.0
            },
            specifications={
                "panel_type": "Bifacial monocrystalline",
                "tracking": "Single-axis tracking",
                "land_area_acres": 2500,
                "annual_generation_gwh": 1200
            },
            reasoning="High solar irradiance region with existing grid infrastructure, favorable state policies, and strong energy demand growth driven by expanding data center operations and residential development"
        )

@api_router.get("/comparison")
async def get_comparison_data():
    """Get comparison data for all energy types"""
    return {
        "solar": {
            "avg_capacity_factor": 25.5,
            "avg_lcoe_usd_mwh": 31.5,
            "total_us_capacity_gw": 143,
            "growth_rate_percent": 23.4,
            "jobs_per_gw": 4800,
            "co2_avoided_tons_per_gwh": 420
        },
        "wind": {
            "avg_capacity_factor": 34.8,
            "avg_lcoe_usd_mwh": 26.4,
            "total_us_capacity_gw": 147,
            "growth_rate_percent": 12.8,
            "jobs_per_gw": 3200,
            "co2_avoided_tons_per_gwh": 440
        },
        "nuclear": {
            "avg_capacity_factor": 93.4,
            "avg_lcoe_usd_mwh": 77.5,
            "total_us_capacity_gw": 95,
            "growth_rate_percent": 1.2,
            "jobs_per_gw": 950,
            "co2_avoided_tons_per_gwh": 490
        },
        "hydro": {
            "avg_capacity_factor": 41.2,
            "avg_lcoe_usd_mwh": 64.3,
            "total_us_capacity_gw": 103,
            "growth_rate_percent": 0.8,
            "jobs_per_gw": 1800,
            "co2_avoided_tons_per_gwh": 460
        }
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
