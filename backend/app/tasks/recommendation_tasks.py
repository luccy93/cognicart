import pandas as pd
from sqlalchemy import create_engine, text
from app.tasks.celery_app import celery_app
from app.config import settings
from app.ml.collaborative import svd_engine
from app.ml.deep_collaborative import deep_cf_engine
from app.ml.content_based import content_engine


@celery_app.task(bind=True, max_retries=3)
def train_recommendation_models(self):
    engine = create_engine(settings.DATABASE_URL_SYNC)

    # Load ratings
    ratings_df = pd.read_sql(
        "SELECT user_id::text, product_id::text, rating FROM ratings",
        engine
    )
    if ratings_df.empty:
        return {"status": "no_data", "message": "No ratings data available"}

    # Load products
    products_df = pd.read_sql(
        """
        SELECT p.id::text, p.name, p.description, p.brand, p.tags,
               c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = true
        """,
        engine
    )

    try:
        svd_engine.train(ratings_df)
        deep_cf_engine.train(ratings_df)
        content_engine.train(products_df)
        return {
            "status": "success",
            "ratings_count": len(ratings_df),
            "products_count": len(products_df)
        }
    except Exception as e:
        self.retry(exc=e, countdown=60)


@celery_app.task
def generate_personalized_recommendations():
    engine = create_engine(settings.DATABASE_URL_SYNC)
    users = pd.read_sql("SELECT id::text FROM users WHERE is_active = true", engine)

    for user_id in users['id']:
        candidate_products = pd.read_sql(
            text("""
                SELECT id::text FROM products WHERE is_active = true
                AND id NOT IN (
                    SELECT product_id FROM user_interactions
                    WHERE user_id = :uid AND interaction_type = 'purchase'
                )
                LIMIT 200
            """),
            engine,
            params={"uid": user_id}
        )

        if not candidate_products.empty:
            product_ids = candidate_products['id'].tolist()
            svd_scores = dict(svd_engine.recommend_for_user(user_id, product_ids, 50))
            deep_scores = dict(deep_cf_engine.recommend_for_user(user_id, product_ids, 50))

            # Store recommendations
            for pid in product_ids[:50]:
                svd_val = svd_scores.get(pid, 0.5)
                deep_val = deep_scores.get(pid, 0.5)
                hybrid = 0.4 * svd_val + 0.6 * deep_val

                with engine.begin() as conn:
                    conn.execute(
                        text("""
                            INSERT INTO recommendations (user_id, product_id, score, engine, recommendation_type)
                            VALUES (:uid, :pid, :score, 'hybrid', 'personalized')
                            ON CONFLICT (user_id, product_id, recommendation_type)
                            DO UPDATE SET score = :score, created_at = NOW()
                        """),
                        {"uid": user_id, "pid": pid, "score": hybrid}
                    )

    return {"status": "completed", "users_processed": len(users)}
