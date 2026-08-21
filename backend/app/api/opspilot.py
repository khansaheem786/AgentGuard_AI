from fastapi import APIRouter

from app.services.opspilot import OpsPilotAgent
from app.services.tool_executor import ToolExecutor
from app.services.trace_service import TraceService


router = APIRouter()

agent = OpsPilotAgent()
executor = ToolExecutor()
trace_service = TraceService()


@router.get("/info")
def get_agent_info():
    return agent.get_info()


@router.post("/execute-tool")
def execute_tool(
    tool_name: str,
    arguments: dict,
):
    result = executor.execute(
        tool_name,
        arguments,
    )

    trace = trace_service.record(
        agent=agent.name,
        tool=tool_name,
        arguments=arguments,
        result=result,
    )

    return {
        "execution": result,
        "trace": trace,
    }


@router.get("/traces")
def get_traces():
    return {
        "total": len(trace_service.get_all()),
        "traces": trace_service.get_all(),
    }