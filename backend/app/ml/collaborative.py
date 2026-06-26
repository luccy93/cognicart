import os
import pickle
from typing import List, Optional
from surprise import Dataset, Reader, SVD, accuracy
from surprise.model_selection import train_test_split
import pandas as pd
import numpy as np
from app.config import settings


class CollaborativeFilteringEngine:
    def __init__(self):
        self.model: Optional[SVD] = None
        self.trainset = None
        self.user_mapping = {}
        self.product_mapping = {}
        self.reverse_user_mapping = {}
        self.reverse_product_mapping = {}
        self.model_path = os.path.join(settings.MODEL_PATH, "svd_model.pkl")

    def _build_mappings(self, ratings_df: pd.DataFrame):
        self.user_mapping = {uid: i for i, uid in enumerate(ratings_df['user_id'].unique())}
        self.product_mapping = {pid: i for i, pid in enumerate(ratings_df['product_id'].unique())}
        self.reverse_user_mapping = {v: k for k, v in self.user_mapping.items()}
        self.reverse_product_mapping = {v: k for k, v in self.product_mapping.items()}

    def train(self, ratings_df: pd.DataFrame):
        self._build_mappings(ratings_df)

        df = ratings_df.copy()
        df['user_idx'] = df['user_id'].map(self.user_mapping)
        df['product_idx'] = df['product_id'].map(self.product_mapping)

        reader = Reader(rating_scale=(1, 5))
        data = Dataset.load_from_df(
            df[['user_idx', 'product_idx', 'rating']],
            reader
        )

        trainset = data.build_full_trainset()
        self.model = SVD(n_factors=100, n_epochs=20, lr_all=0.005, reg_all=0.02)
        self.model.fit(trainset)
        self.trainset = trainset

        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        with open(self.model_path, 'wb') as f:
            pickle.dump({
                'model': self.model,
                'user_mapping': self.user_mapping,
                'product_mapping': self.product_mapping,
                'reverse_user_mapping': self.reverse_user_mapping,
                'reverse_product_mapping': self.reverse_product_mapping
            }, f)

    def load_model(self):
        if os.path.exists(self.model_path):
            with open(self.model_path, 'rb') as f:
                data = pickle.load(f)
                self.model = data['model']
                self.user_mapping = data['user_mapping']
                self.product_mapping = data['product_mapping']
                self.reverse_user_mapping = data['reverse_user_mapping']
                self.reverse_product_mapping = data['reverse_product_mapping']

    def predict_rating(self, user_id: str, product_id: str) -> float:
        if self.model is None:
            self.load_model()
        if self.model is None:
            return 3.0

        user_idx = self.user_mapping.get(user_id)
        product_idx = self.product_mapping.get(product_id)

        if user_idx is None or product_idx is None:
            return 3.0

        prediction = self.model.predict(user_idx, product_idx)
        return max(1.0, min(5.0, prediction.est))

    def recommend_for_user(self, user_id: str, product_ids: List[str], n: int = 10) -> List[tuple]:
        if self.model is None:
            self.load_model()

        scores = []
        for pid in product_ids:
            score = self.predict_rating(user_id, pid)
            scores.append((pid, score))

        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:n]

    def get_similar_products(self, product_id: str, all_product_ids: List[str], n: int = 10) -> List[tuple]:
        if self.model is None:
            self.load_model()

        pid_idx = self.product_mapping.get(product_id)
        if pid_idx is None or self.model is None:
            return []

        target_vector = self.model.pu[pid_idx] if hasattr(self.model, 'pu') else None
        if target_vector is None:
            return []

        similarities = []
        for other_pid in all_product_ids:
            if other_pid == product_id:
                continue
            other_idx = self.product_mapping.get(other_pid)
            if other_idx is None:
                continue
            other_vector = self.model.pu[other_idx] if hasattr(self.model, 'pu') else None
            if other_vector is None:
                continue
            sim = np.dot(target_vector, other_vector) / (
                np.linalg.norm(target_vector) * np.linalg.norm(other_vector) + 1e-8
            )
            similarities.append((other_pid, float(sim)))

        similarities.sort(key=lambda x: x[1], reverse=True)
        return similarities[:n]


svd_engine = CollaborativeFilteringEngine()
