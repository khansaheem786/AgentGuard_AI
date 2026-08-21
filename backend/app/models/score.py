from pydantic import BaseModel


class ReliabilityScore(BaseModel):
    agent: str
    score: float
    grade: str

    total_tests: int
    passed: int
    failed: int
    review: int

    critical_failures: int
    high_failures: int
    pass_rate: float

    # Mutation / security evaluation
    mutation_tests: int = 0
    mutation_failures: int = 0
    mutation_critical: int = 0
    mutation_high: int = 0
    mutation_medium: int = 0

    security_score: float = 100.0