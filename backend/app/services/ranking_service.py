"""
services/ranking_service.py — Transparent Ranking Algorithm

Each hospital in search results gets a composite score from 0-100:

  score = (distance_score  × 0.30)
        + (cost_score      × 0.25)
        + (rating_score    × 0.25)
        + (accreditation_score × 0.20)

TRANSPARENCY: The API response includes the breakdown for each
hospital. The user can see exactly WHY it's ranked where it is.

Weights are configurable per-query — the frontend lets users
adjust sliders to change what matters most.

WHY this scoring model?
- Distance: Non-negotiable for emergency searches. Closer = better.
- Cost: The #1 concern for most Indian patients, especially for PMJAY.
- Rating: User trust signal — verified community feedback.
- Accreditation: NABH/JCI certification signals quality standards.
"""

from dataclasses import dataclass
from typing import Optional

@dataclass
class RankingResult:
    hospital_id: str
    total_score: float
    distance_score: float
    cost_score: float
    rating_score: float
    accreditation_score: float
    weights: dict

class RankingService:
    """
    Scores hospitals and produces transparent ranking breakdowns.

    All scoring functions return values in [0, 100] range.
    The total score is a weighted average of all sub-scores.
    """

    DEFAULT_WEIGHTS = {
        "distance": 0.30,
        "cost": 0.25,
        "rating": 0.25,
        "accreditation": 0.20,
    }

    # Distance scoring: 0 km = 100 points, 100 km = 0 points (linear)
    MAX_DISTANCE_KM = 100.0

    # Cost scoring reference: uses national median as baseline
    COST_SCORE_BASE = 100_000  # ₹1 lakh baseline

    def score_hospital(
        self,
        hospital,
        max_budget: Optional[int] = None,
        searched_procedure_cost: Optional[int] = None,
        weights: Optional[dict] = None,
    ) -> RankingResult:
        """
        Compute composite ranking score for a single hospital.

        Args:
            hospital: Hospital ORM object (must have distance_km set)
            max_budget: User's stated budget in INR
            searched_procedure_cost: Cost of the specific procedure at this hospital
            weights: Custom weights dict (must sum to 1.0)

        Returns:
            RankingResult with total score and per-component breakdown
        """
        w = weights or self.DEFAULT_WEIGHTS

        dist_score = self._distance_score(hospital.distance_km)
        cost_score = self._cost_score(
            searched_procedure_cost or 0,
            max_budget or self.COST_SCORE_BASE,
        )
        rating_score = self._rating_score(hospital.overall_rating, hospital.total_reviews)
        accred_score = self._accreditation_score(
            hospital.accreditation,
            hospital.is_pmjay_empanelled,
            hospital.verified,
        )

        total = (
            dist_score * w["distance"]
            + cost_score * w["cost"]
            + rating_score * w["rating"]
            + accred_score * w["accreditation"]
        )

        return RankingResult(
            hospital_id=str(hospital.id),
            total_score=round(total, 2),
            distance_score=round(dist_score, 2),
            cost_score=round(cost_score, 2),
            rating_score=round(rating_score, 2),
            accreditation_score=round(accred_score, 2),
            weights=w,
        )

    def rank_hospitals(
        self,
        hospitals: list,
        max_budget: Optional[int] = None,
        procedure_costs: Optional[dict] = None,  # {hospital_id: cost}
        weights: Optional[dict] = None,
    ) -> list:
        """
        Score and sort a list of hospitals by composite score.
        Returns hospitals sorted by total_score descending with ranking
        breakdown attached to each hospital object.
        """
        scored = []
        for hospital in hospitals:
            proc_cost = None
            if procedure_costs:
                proc_cost = procedure_costs.get(str(hospital.id))

            result = self.score_hospital(hospital, max_budget, proc_cost, weights)
            hospital.ranking_score = result.total_score
            hospital.ranking_breakdown = {
                "total": result.total_score,
                "distance": result.distance_score,
                "cost": result.cost_score,
                "rating": result.rating_score,
                "accreditation": result.accreditation_score,
                "weights": result.weights,
            }
            scored.append(hospital)

        return sorted(scored, key=lambda h: h.ranking_score, reverse=True)

    # Scoring Sub-Functions

    def _distance_score(self, distance_km: Optional[float]) -> float:
        """
        Linear decay: 0km → 100pts, MAX_DISTANCE_KM → 0pts.
        Returns 0 if distance unknown.
        """
        if distance_km is None:
            return 0.0
        score = max(0, 100 - (distance_km / self.MAX_DISTANCE_KM * 100))
        return score

    def _cost_score(self, procedure_cost: int, max_budget: int) -> float:
        """
        If procedure_cost is 0 (unknown), return 50 (neutral).
        If cost <= max_budget, score = 100 × (1 - cost/max_budget).
        If cost > max_budget, score = 0 (over budget).
        """
        if procedure_cost <= 0:
            return 50.0  # Neutral when cost is unknown
        if procedure_cost > max_budget:
            return 0.0
        # Within budget: reward lower cost
        return max(0, 100 - (procedure_cost / max_budget * 100)) + 20  # +20 bonus for being in budget

    def _rating_score(self, rating: float, total_reviews: int) -> float:
        """
        Wilson score confidence interval lower bound concept:
        - Raw rating on 1-5 scale → normalize to 0-100
        - Dampen score for hospitals with very few reviews
        """
        if total_reviews == 0 or rating == 0:
            return 40.0  # Neutral default for unrated hospitals

        # Normalize rating (1-5) to 0-100
        normalized = (rating - 1) / 4 * 100

        # Dampen by review count (hospitals with 1-2 reviews get 80% of score)
        # This prevents a single 5-star review from outranking a 4.8-star with 1000 reviews
        confidence = min(1.0, total_reviews / 20)
        dampened = normalized * (0.6 + 0.4 * confidence)
        return min(100, dampened)

    def _accreditation_score(
        self,
        accreditation: Optional[str],
        is_pmjay: bool,
        is_verified: bool,
    ) -> float:
        """
        Accreditation hierarchy:
        JCI (international) > NABH (national) > ISO > None
        PMJAY empanelment adds bonus points (government-vetted).
        Verified by our team adds smaller bonus.
        """
        score = 0.0

        # Accreditation tier
        accred_scores = {
            "JCI": 80.0,
            "NABH": 70.0,
            "NABL": 60.0,
            "ISO": 40.0,
        }
        score += accred_scores.get(accreditation or "", 0.0)

        # Government program bonuses
        if is_pmjay:
            score += 15.0  # PMJAY empanelment = government-vetted quality

        if is_verified:
            score += 5.0   # Our team verified the data

        return min(100.0, score)

ranking_service = RankingService()
