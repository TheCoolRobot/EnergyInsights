from fastapi import FastAPI
from mangum import Mangum

app = FastAPI()

@app.get("/api/health")
async def health():
    return {"status": "ok"}

@app.get("/api/power-plants")
async def power_plants():
    return [
        {"name": "Solar Star", "type": "solar", "lat": 34.8, "lng": -118.5, "capacity_mw": 579, "status": "operational", "state": "CA"}
    ]

@app.get("/api/state-scores")
async def state_scores():
    return [
        {"state_code": "CA", "state_name": "California", "solar_score": 95, "wind_score": 75, "nuclear_score": 60, "hydro_score": 70, "overall_score": 85}
    ]

@app.get("/api/distribution-hubs")
async def distribution_hubs():
    return [
        {"name": "LA Hub", "lat": 34.0, "lng": -118.2, "capacity_mw": 5000, "state": "CA"}
    ]

@app.get("/api/statistics")
async def statistics():
    return {
        "total_plants": 100,
        "total_capacity_mw": 50000,
        "by_type": {"solar": {"count": 40, "capacity_mw": 20000}},
        "by_status": {"operational": 80}
    }

handler = Mangum(app)
