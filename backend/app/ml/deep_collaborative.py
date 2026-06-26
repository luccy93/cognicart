import os
import json
import numpy as np
import pandas as pd
from typing import List, Optional, Dict, Tuple
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, Model, regularizers
from app.config import settings


class DeepCollaborativeFiltering:
    def __init__(self):
        self.model: Optional[Model] = None
        self.user_mapping: Dict[str, int] = {}
        self.product_mapping: Dict[str, int] = {}
        self.reverse_user_mapping: Dict[int, str] = {}
        self.reverse_product_mapping: Dict[int, str] = {}
        self.num_users = 0
        self.num_products = 0
        self.embedding_dim = 64
        self.model_path = os.path.join(settings.MODEL_PATH, "deep_cf_model.keras")
        self.mapping_path = os.path.join(settings.MODEL_PATH, "deep_cf_mappings.json")

    def _build_mappings(self, ratings_df: pd.DataFrame):
        users = ratings_df['user_id'].unique()
        products = ratings_df['product_id'].unique()
        self.user_mapping = {uid: i for i, uid in enumerate(users)}
        self.product_mapping = {pid: i for i, pid in enumerate(products)}
        self.reverse_user_mapping = {v: k for k, v in self.user_mapping.items()}
        self.reverse_product_mapping = {v: k for k, v in self.product_mapping.items()}
        self.num_users = len(users)
        self.num_products = len(products)

    def _build_model(self):
        user_input = layers.Input(shape=(1,), dtype=tf.int32, name='user_input')
        product_input = layers.Input(shape=(1,), dtype=tf.int32, name='product_input')

        user_embedding = layers.Embedding(
            self.num_users + 1, self.embedding_dim,
            embeddings_regularizer=regularizers.l2(1e-4),
            name='user_embedding'
        )(user_input)
        user_embedding = layers.Flatten()(user_embedding)
        user_embedding = layers.BatchNormalization()(user_embedding)
        user_embedding = layers.Dropout(0.3)(user_embedding)

        product_embedding = layers.Embedding(
            self.num_products + 1, self.embedding_dim,
            embeddings_regularizer=regularizers.l2(1e-4),
            name='product_embedding'
        )(product_input)
        product_embedding = layers.Flatten()(product_embedding)
        product_embedding = layers.BatchNormalization()(product_embedding)
        product_embedding = layers.Dropout(0.3)(product_embedding)

        concat = layers.Concatenate()([user_embedding, product_embedding])

        dense_1 = layers.Dense(128, activation='relu', kernel_regularizer=regularizers.l2(1e-4))(concat)
        batch_1 = layers.BatchNormalization()(dense_1)
        drop_1 = layers.Dropout(0.4)(batch_1)

        dense_2 = layers.Dense(64, activation='relu', kernel_regularizer=regularizers.l2(1e-4))(drop_1)
        batch_2 = layers.BatchNormalization()(dense_2)
        drop_2 = layers.Dropout(0.3)(batch_2)

        dense_3 = layers.Dense(32, activation='relu', kernel_regularizer=regularizers.l2(1e-4))(drop_2)

        output = layers.Dense(1, activation='sigmoid', name='rating_output')(dense_3)

        model = Model(inputs=[user_input, product_input], outputs=output)
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.001),
            loss='mean_squared_error',
            metrics=['mae']
        )
        return model

    def train(self, ratings_df: pd.DataFrame, epochs: int = 20, batch_size: int = 256):
        self._build_mappings(ratings_df)

        df = ratings_df.copy()
        df['user_idx'] = df['user_id'].map(self.user_mapping)
        df['product_idx'] = df['product_id'].map(self.product_mapping)
        df['rating_norm'] = df['rating'] / 5.0

        self.model = self._build_model()

        early_stopping = keras.callbacks.EarlyStopping(
            monitor='loss', patience=3, restore_best_weights=True
        )

        self.model.fit(
            [df['user_idx'].values, df['product_idx'].values],
            df['rating_norm'].values,
            epochs=epochs,
            batch_size=batch_size,
            callbacks=[early_stopping],
            verbose=1
        )

        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        self.model.save(self.model_path)
        with open(self.mapping_path, 'w') as f:
            json.dump({
                'user_mapping': self.user_mapping,
                'product_mapping': self.product_mapping,
                'reverse_user_mapping': {str(k): v for k, v in self.reverse_user_mapping.items()},
                'reverse_product_mapping': {str(k): v for k, v in self.reverse_product_mapping.items()}
            }, f)

    def load_model(self):
        if os.path.exists(self.model_path):
            self.model = keras.models.load_model(self.model_path)
        if os.path.exists(self.mapping_path):
            with open(self.mapping_path) as f:
                data = json.load(f)
                self.user_mapping = {k: int(v) for k, v in data['user_mapping'].items()}
                self.product_mapping = {k: int(v) for k, v in data['product_mapping'].items()}
                self.reverse_user_mapping = {int(k): v for k, v in data['reverse_user_mapping'].items()}
                self.reverse_product_mapping = {int(k): v for k, v in data['reverse_product_mapping'].items()}

    def predict_rating(self, user_id: str, product_id: str) -> float:
        if self.model is None:
            self.load_model()
        if self.model is None:
            return 0.6

        user_idx = self.user_mapping.get(user_id)
        product_idx = self.product_mapping.get(product_id)

        if user_idx is None or product_idx is None:
            return 0.6

        pred = self.model.predict([np.array([user_idx]), np.array([product_idx])], verbose=0)
        return float(pred[0][0]) * 5.0

    def recommend_for_user(self, user_id: str, product_ids: List[str], n: int = 10) -> List[Tuple[str, float]]:
        if self.model is None:
            self.load_model()

        user_idx = self.user_mapping.get(user_id)
        if user_idx is None:
            return [(pid, 0.6) for pid in product_ids[:n]]

        scores = []
        batch_size = 64
        for i in range(0, len(product_ids), batch_size):
            batch = product_ids[i:i + batch_size]
            batch_indices = []
            valid_pids = []
            for pid in batch:
                pidx = self.product_mapping.get(pid)
                if pidx is not None:
                    batch_indices.append(pidx)
                    valid_pids.append(pid)

            if batch_indices:
                preds = self.model.predict(
                    [np.full(len(batch_indices), user_idx), np.array(batch_indices)],
                    verbose=0
                )
                for pid, pred in zip(valid_pids, preds):
                    scores.append((pid, float(pred[0]) * 5.0))

        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:n]


deep_cf_engine = DeepCollaborativeFiltering()
