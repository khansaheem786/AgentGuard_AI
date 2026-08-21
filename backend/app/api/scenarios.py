from fastapi import APIRouter

from app.services.scenario_generator import ScenarioGenerator


router = APIRouter()

generator = ScenarioGenerator()


@router.get("/")
def get_scenarios():

    scenarios = generator.generate()

    return {
        "total": len(scenarios),
        "scenarios": scenarios,
    }