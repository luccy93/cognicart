import os
import json
import pickle
import numpy as np
import pandas as pd
from typing import List, Optional, Dict, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.config import settings


class ContentBasedEngine:
    def __init__(self):
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.product_vectors: Optional[np.ndarray] = None
        self.product_metadata: Dict[str, Dict] = {}
        self.product_ids: List[str] = []
        self.model_path = os.path.join(settings.MODEL_PATH, "content_based.pkl")

    def _build_product_features(self, products_df: pd.DataFrame) -> pd.Series:
        features = []
        for _, row in products_df.iterrows():
            feature_parts = []
            feature_parts.append(row.get('name', ''))
            feature_parts.append(row.get('description', ''))
            feature_parts.append(row.get('brand', ''))
            feature_parts.append(row.get('category_name', ''))
            tags = row.get('tags', '')
            if isinstance(tags, str):
                feature_parts.append(tags.replace(',', ' '))
            features.append(' '.join(feature_parts))
        return pd.Series(features)

    def train(self, products_df: pd.DataFrame):
        self.product_ids = products_df['id'].tolist()
        self.product_metadata = {
            row['id']: row.to_dict() for _, row in products_df.iterrows()
        }

        feature_series = self._build_product_features(products_df)

        self.vectorizer = TfidfVectorizer(
            max_features=5000,
            stop_words='english',
            ngram_range=(1, 2),
            sublinear_tf=True
        )
        self.product_vectors = self.vectorizer.fit_transform(feature_series)

        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        with open(self.model_path, 'wb') as f:
            pickle.dump({
                'vectorizer': self.vectorizer,
                'product_vectors': self.product_vectors,
                'product_ids': self.product_ids,
                'product_metadata': self.product_metadata
            }, f)

    def load_model(self):
        if os.path.exists(self.model_path):
            with open(self.model_path, 'rb') as f:
                data = pickle.load(f)
                self.vectorizer = data['vectorizer']
                self.product_vectors = data['product_vectors']
                self.product_ids = data['product_ids']
                self.product_metadata = data['product_metadata']

    def get_similar_products(self, product_id: str, n: int = 10) -> List[Tuple[str, float]]:
        if self.vectorizer is None:
            self.load_model()
        if self.vectorizer is None or product_id not in self.product_ids:
            return []

        idx = self.product_ids.index(product_id)
        vector = self.product_vectors[idx]

        similarities = cosine_similarity(vector, self.product_vectors).flatten()
        similar_indices = similarities.argsort()[::-1][1:n + 1]

        results = [(self.product_ids[i], float(similarities[i])) for i in similar_indices]
        return results

    def recommend_for_user(self, user_interests: List[str], product_ids: List[str], n: int = 10) -> List[Tuple[str, float]]:
        if self.vectorizer is None:
            self.load_model()
        if self.vectorizer is None:
            return [(pid, 0.5) for pid in product_ids[:n]]

        query = ' '.join(user_interests)
        query_vector = self.vectorizer.transform([query])

        available_indices = [self.product_ids.index(pid) for pid in product_ids if pid in self.product_ids]
        if not available_indices:
            return [(pid, 0.5) for pid in product_ids[:n]]

        available_vectors = self.product_vectors[available_indices]
        similarities = cosine_similarity(query_vector, available_vectors).flatten()

        scored = [(product_ids[i], float(similarities[j])) for j, i in enumerate(available_indices)]
        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:n]


content_engine = ContentBasedEngine()
