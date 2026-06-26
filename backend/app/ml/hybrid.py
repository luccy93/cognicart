import os
import json
from typing import List, Optional, Dict, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
import numpy as np
from app.ml.collaborative import svd_engine
from app.ml.deep_collaborative import deep_cf_engine
from app.ml.content_based import content_engine
from app.config import settings


class HybridRecommender:
    def __init__(self):
        self.svd_weight = 0.4
        self.deep_weight = 0.4
        self.content_weight = 0.2

    @staticmethod
    def _uid(val):
        return str(val)

    def compute_hybrid_score(
        self,
        svd_score: float,
        deep_score: float,
        content_score: float
    ) -> float:
        svd_norm = max(0, min(1, svd_score / 5.0))
        deep_norm = max(0, min(1, deep_score / 5.0))
        content_norm = max(0, min(1, content_score))

        final_score = (
            self.svd_weight * svd_norm +
            self.deep_weight * deep_norm +
            self.content_weight * content_norm
        )
        return max(0, min(1, final_score))

    async def get_personalized_recommendations(
        self,
        user_id: str,
        db: AsyncSession,
        n: int = 12
    ) -> List[Tuple[str, float, str]]:
        result = await db.execute(
            text("""
                SELECT p.id FROM products p
                WHERE p.is_active = true
                AND p.id NOT IN (
                    SELECT product_id FROM user_interactions
                    WHERE user_id = :uid AND interaction_type = 'purchase'
                )
                LIMIT 200
            """),
            {"uid": self._uid(user_id)}
        )
        candidate_ids = [row[0] for row in result.fetchall()]

        if not candidate_ids:
            return []

        result = await db.execute(
            text("""
                SELECT COALESCE(
                    (SELECT preferred_categories FROM users WHERE id = :uid),
                    ''
                )
            """),
            {"uid": self._uid(user_id)}
        )
        user_data = result.fetchone()
        user_interests = []
        if user_data and user_data[0]:
            user_interests = [c.strip() for c in user_data[0].split(',') if c.strip()]

        svd_results = svd_engine.recommend_for_user(user_id, candidate_ids, n * 2)
        svd_scores = {pid: score for pid, score in svd_results}

        deep_results = deep_cf_engine.recommend_for_user(user_id, candidate_ids, n * 2)
        deep_scores = {pid: score for pid, score in deep_results}

        content_results = content_engine.recommend_for_user(user_interests, candidate_ids, n * 2)
        content_scores = {pid: score for pid, score in content_results}

        hybrid_scores = []
        for pid in candidate_ids:
            svd_val = svd_scores.get(pid, 0.5)
            deep_val = deep_scores.get(pid, 0.5)
            content_val = content_scores.get(pid, 0.3)
            hybrid_val = self.compute_hybrid_score(svd_val, deep_val, content_val)

            engine_used = "hybrid"
            if svd_val > deep_val and svd_val > content_val:
                engine_used = "svd"
            elif deep_val > svd_val and deep_val > content_val:
                engine_used = "deep_learning"
            elif content_val > svd_val and content_val > deep_val:
                engine_used = "content_based"

            hybrid_scores.append((pid, hybrid_val, engine_used))

        hybrid_scores.sort(key=lambda x: x[1], reverse=True)
        return hybrid_scores[:n]

    async def get_similar_products(
        self,
        product_id: str,
        db: AsyncSession,
        n: int = 8
    ) -> List[Tuple[str, float, str]]:
        content_similar = content_engine.get_similar_products(product_id, n * 2)
        content_dict = {pid: score for pid, score in content_similar}

        result = await db.execute(
            text("SELECT id FROM products WHERE is_active = true AND id != :pid LIMIT 100"),
            {"pid": product_id}
        )
        all_pids = [row[0] for row in result.fetchall()]
        svd_similar = svd_engine.get_similar_products(product_id, [str(p) for p in all_pids], n * 2)
        svd_dict = {str(pid): score for pid, score in svd_similar}

        combined = {}
        all_candidates = set(str(p) for p in all_pids)
        for pid in all_candidates:
            c_score = content_dict.get(pid, 0)
            s_score = svd_dict.get(pid, 0)
            combined[pid] = (s_score * 0.3 + c_score * 0.7)

        sorted_pids = sorted(combined.items(), key=lambda x: x[1], reverse=True)[:n]
        return [(pid, score, "content_based" if content_dict.get(pid, 0) > svd_dict.get(pid, 0) else "svd")
                for pid, score in sorted_pids]

    async def get_trending_products(
        self,
        db: AsyncSession,
        n: int = 8
    ) -> List[Tuple[str, float]]:
        result = await db.execute(
            text("""
                SELECT p.id,
                    (p.popularity_score * 0.4 +
                     p.total_purchases * 0.3 +
                     p.total_ratings * 0.2 +
                     p.average_rating * 0.1) as trending_score
                FROM products p
                WHERE p.is_active = true
                ORDER BY trending_score DESC
                LIMIT :n
            """),
            {"n": n}
        )
        return [(row[0], float(row[1])) for row in result.fetchall()]

    async def get_frequently_bought_together(
        self,
        product_id: str,
        db: AsyncSession,
        n: int = 4
    ) -> List[Tuple[str, float]]:
        result = await db.execute(
            text("""
                SELECT oi2.product_id, COUNT(*) as frequency
                FROM order_items oi1
                JOIN order_items oi2 ON oi1.order_id = oi2.order_id
                    AND oi1.product_id != oi2.product_id
                WHERE oi1.product_id = :pid
                GROUP BY oi2.product_id
                ORDER BY frequency DESC
                LIMIT :n
            """),
            {"pid": product_id, "n": n}
        )
        items = [(row[0], float(row[1])) for row in result.fetchall()]

        if len(items) < n:
            existing_pids = {pid for pid, _ in items}
            result = await db.execute(
                text("""
                    SELECT id, popularity_score
                    FROM products
                    WHERE is_active = true AND id != :pid
                    ORDER BY popularity_score DESC
                    LIMIT :lim
                """),
                {"pid": product_id, "lim": n - len(items)}
            )
            extra = [(row[0], float(row[1]) * 0.01) for row in result.fetchall()
                     if row[0] not in existing_pids]
            items.extend(extra[:n - len(items)])

        return items[:n]

    async def get_continue_shopping(
        self,
        user_id: str,
        db: AsyncSession,
        n: int = 8
    ) -> List[Tuple[str, float]]:
        result = await db.execute(
            text("""
                SELECT p.id, (julianday('now') - julianday(bh.viewed_at)) * 24 as hours_ago
                FROM browsing_history bh
                JOIN products p ON bh.product_id = p.id
                WHERE bh.user_id = :uid AND p.is_active = true
                GROUP BY p.id
                ORDER BY MAX(bh.viewed_at) DESC
                LIMIT :n
            """),
            {"uid": self._uid(user_id), "n": n}
        )
        return [(row[0], max(0, 1 - float(row[1]) / 168)) for row in result.fetchall()]


hybrid_recommender = HybridRecommender()
