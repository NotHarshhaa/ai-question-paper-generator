import random
import logging
from utils.ai_engine import AIEngine

logger = logging.getLogger(__name__)


class SmartSelector:
    def __init__(self, ai_engine: AIEngine, similarity_threshold: float = 0.75):
        self.ai_engine = ai_engine
        self.similarity_threshold = similarity_threshold

    def remove_duplicates(self, questions: list[dict]) -> list[dict]:
        if len(questions) <= 1:
            return questions

        texts = [q["text"] for q in questions]
        sim_matrix = self.ai_engine.compute_batch_similarity(texts)

        to_remove = set()
        for i in range(len(questions)):
            if i in to_remove:
                continue
            for j in range(i + 1, len(questions)):
                if j in to_remove:
                    continue
                if sim_matrix[i][j] > self.similarity_threshold:
                    to_remove.add(j)
                    logger.debug(
                        "Removing duplicate (sim=%.2f): '%s'",
                        sim_matrix[i][j],
                        questions[j]["text"][:50],
                    )

        return [q for idx, q in enumerate(questions) if idx not in to_remove]

    def balance_difficulty(
        self,
        questions: list[dict],
        distribution: dict[str, int],
        total_needed: int,
    ) -> list[dict]:
        by_difficulty: dict[str, list[dict]] = {"easy": [], "medium": [], "hard": []}
        for q in questions:
            diff = q.get("difficulty", "medium")
            by_difficulty[diff].append(q)

        total_pct = distribution.get("easy", 30) + distribution.get("medium", 40) + distribution.get("hard", 30)
        if total_pct == 0:
            total_pct = 100

        targets = {
            "easy": max(1, round(total_needed * distribution.get("easy", 30) / total_pct)),
            "medium": max(1, round(total_needed * distribution.get("medium", 40) / total_pct)),
            "hard": max(1, round(total_needed * distribution.get("hard", 30) / total_pct)),
        }

        # Adjust to exact total
        while sum(targets.values()) > total_needed:
            for diff in ["easy", "medium", "hard"]:
                if targets[diff] > 1 and sum(targets.values()) > total_needed:
                    targets[diff] -= 1
        while sum(targets.values()) < total_needed:
            for diff in ["medium", "easy", "hard"]:
                if sum(targets.values()) < total_needed:
                    targets[diff] += 1

        selected = []
        for diff, target in targets.items():
            pool = by_difficulty[diff]
            if len(pool) >= target:
                selected.extend(random.sample(pool, target))
            else:
                selected.extend(pool)
                # Fill shortage from other pools
                shortage = target - len(pool)
                other_pools = []
                for other_diff, other_pool in by_difficulty.items():
                    if other_diff != diff:
                        for q in other_pool:
                            if q not in selected:
                                other_pools.append(q)
                if other_pools:
                    fill = other_pools[:shortage]
                    # Reassign difficulty
                    for q in fill:
                        q["difficulty"] = diff
                    selected.extend(fill)

        return selected[:total_needed]

    def select_questions(
        self,
        questions: list[dict],
        distribution: dict[str, int],
        total_needed: int,
    ) -> list[dict]:
        # Step 1: Remove duplicates
        unique = self.remove_duplicates(questions)
        logger.info(
            "After dedup: %d questions (from %d)", len(unique), len(questions)
        )

        # Step 2: Balance difficulty
        selected = self.balance_difficulty(unique, distribution, total_needed)
        logger.info("After balancing: %d questions selected", len(selected))

        return selected
