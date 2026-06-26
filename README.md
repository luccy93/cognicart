# CogniCart — Intelligence Behind Every Purchase

CogniCart is a production-ready, enterprise-scale **AI-Powered Personalized Shopping Platform** featuring a hybrid recommendation engine combining collaborative filtering (SVD), deep learning (TensorFlow/Keras), and content-based filtering.

## Tech Stack

### Frontend
- **Next.js 15** (App Router) + React 19 + TypeScript
- Tailwind CSS + Glassmorphism Design System
- Framer Motion + GSAP for animations
- React Three Fiber + Three.js for 3D visuals
- Zustand for state management
- TanStack Query for server state
- Axios for HTTP client

### Backend
- **FastAPI** (Python) + Uvicorn
- SQLAlchemy ORM (async) + PostgreSQL
- Redis for caching & session management
- Celery for background task processing
- JWT Authentication with OAuth & OTP support
- Stripe & Razorpay payment integration

### AI/ML
- **Surprise Library** (SVD Matrix Factorization)
- **TensorFlow/Keras** (Deep Collaborative Filtering)
- **Scikit-learn** (Content-Based TF-IDF)
- Hybrid Weighted Scoring Engine

### Infrastructure
- Docker & Docker Compose
- Nginx reverse proxy
- GitHub Actions CI/CD
- PostgreSQL + Redis

## Project Structure

```
cognicart/
├── backend/
│   ├── app/
│   │   ├── api/           # REST API routes
│   │   ├── auth/          # JWT, OAuth, OTP
│   │   ├── ml/            # Recommendation engines
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── tasks/         # Celery tasks
│   │   ├── utils/         # Helpers
│   │   ├── config.py      # Settings
│   │   ├── database.py    # DB connection
│   │   └── main.py        # FastAPI entry point
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # API client, utils
│   │   ├── store/         # Zustand stores
│   │   └── types/         # TypeScript types
│   ├── Dockerfile
│   └── package.json
├── nginx/
│   └── default.conf
├── docker-compose.yml
├── .github/workflows/ci-cd.yml
└── README.md
```

## Features

### AI Recommendation System
- **Engine 1**: Collaborative Filtering (SVD) via Surprise Library
- **Engine 2**: Deep Collaborative Filtering (TensorFlow/Keras)
- **Engine 3**: Content-Based (TF-IDF + Cosine Similarity)
- **Hybrid Weighted Formula**: `0.4 × SVD + 0.4 × Deep Learning + 0.2 × Content-Based`
- Cold start handling for new users & products
- Real-time personalized recommendations

### Authentication
- Email/password registration & login
- JWT access + refresh tokens
- Google OAuth ready
- Email OTP verification
- Password reset flow
- Session management
- Role-based access (Customer, Admin, Super Admin)

### Database (15+ tables)
- Users, Products, Categories, Ratings, Reviews
- Orders, Order Items, Cart, Cart Items
- Wishlist, Browsing History, User Interactions
- Recommendations, Recommendation Feedback
- Payments, User Sessions

### UI/UX
- Premium dark theme with glassmorphism
- 3D interactive holograms (Three.js)
- Animated components (Framer Motion)
- Responsive design (mobile-first)
- Skeleton loaders & empty states
- Micro-interactions & magnetic buttons

### Shopping Features
- Product search, filters, sorting, pagination
- Shopping cart with quantity management
- Wishlist with price drop alerts
- Order management & tracking
- Coupon/discount system
- Stripe & Razorpay integration

### AI Assistant
- Floating chatbot widget
- Product search & recommendations
- Order status & support
- Quick suggestion chips

### Analytics Dashboard
- Recommendation accuracy metrics
- User engagement tracking
- Revenue analytics
- Sales trends (monthly/daily)
- Top-selling products
- Category performance

### Admin Dashboard
- User management (CRUD, roles, status)
- Product management
- Category management
- Order management (status updates)
- Revenue monitoring
- System health checks

## Getting Started

### Prerequisites
- Node.js 20+
- Python 3.11+
- Docker & Docker Compose (optional)
- PostgreSQL 16+
- Redis 7+

### Quick Start (Local Development)

```bash
# 1. Clone the repository
git clone https://github.com/your-org/cognicart.git
cd cognicart

# 2. Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Edit with your config
uvicorn app.main:app --reload --port 8000

# 3. Frontend setup
cd ../frontend
npm install
cp .env.example .env.local  # Edit with your config
npm run dev

# 4. Open in browser
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/api/docs
```

### Docker Setup (Production)

```bash
# Build & run all services
docker-compose up -d --build

# Run database migrations
docker-compose exec backend alembic upgrade head

# Train ML models
docker-compose exec backend python -c "
from app.ml.collaborative import svd_engine
from app.ml.deep_collaborative import deep_cf_engine
from app.ml.content_based import content_engine
import pandas as pd
from app.database import sync_engine
ratings = pd.read_sql('SELECT * FROM ratings', sync_engine)
products = pd.read_sql('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id', sync_engine)
svd_engine.train(ratings)
deep_cf_engine.train(ratings)
content_engine.train(products)
print('Models trained successfully!')
"

# Access
# Frontend: http://localhost:3000
# API: http://localhost:8000
```

## API Documentation

Once running, visit:
- **Swagger UI**: `http://localhost:8000/api/docs`
- **ReDoc**: `http://localhost:8000/api/redoc`

### Main Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh tokens |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user profile |
| GET | `/api/products` | List/search products |
| GET | `/api/products/{id}` | Product details |
| GET | `/api/products/categories/all` | All categories |
| GET | `/api/recommendations/personalized` | Personalized recommendations |
| GET | `/api/recommendations/trending` | Trending products |
| GET | `/api/recommendations/similar/{id}` | Similar products |
| GET | `/api/recommendations/frequently-bought/{id}` | Frequently bought together |
| GET | `/api/recommendations/continue-shopping` | Continue shopping |
| GET | `/api/cart` | Get cart |
| POST | `/api/cart/add` | Add to cart |
| GET | `/api/orders` | User orders |
| POST | `/api/orders` | Create order |
| GET | `/api/wishlist` | Get wishlist |
| POST | `/api/wishlist/add/{id}` | Add to wishlist |
| GET | `/api/analytics/dashboard` | Dashboard analytics |
| GET | `/api/admin/users` | Admin: list users |
| GET | `/api/admin/analytics/overview` | Admin: analytics overview |

## Recommendation Engine Details

### Hybrid Scoring Formula
```python
final_score = 0.4 * svd_score + 0.4 * deep_learning_score + 0.2 * content_score
```

### Engine 1: SVD (Surprise)
- Matrix factorization for collaborative filtering
- Hyperparameters: n_factors=100, n_epochs=20, lr=0.005, reg=0.02

### Engine 2: Deep Learning (TensorFlow)
- Architecture: User Embedding(64) → Product Embedding(64) → Concat → Dense(128,64,32) → Sigmoid
- Regularization: L2(1e-4), Dropout(0.3-0.4), BatchNormalization

### Engine 3: Content-Based (Scikit-learn)
- TF-IDF vectorization with n-grams (1,2)
- Cosine similarity for product matching
- Features: name, description, brand, category, tags

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql+asyncpg://cognicart:cognicart@localhost:5432/cognicart
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
STRIPE_SECRET_KEY=your-stripe-key
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Deployment

### Frontend → Vercel
```bash
cd frontend
vercel --prod
```

### Backend → Render/AWS
```bash
cd backend
docker build -t cognicart-api .
docker run -p 8000:8000 cognicart-api
```

### Database → PostgreSQL Cloud
```bash
# Run migrations
alembic upgrade head
```

## Performance
- Lighthouse Score: 95+ (target)
- SEO Score: 95+ (target)
- Accessibility Score: 95+ (target)
- Lazy loading, code splitting, image optimization
- Server-side rendering with Next.js
- Redis caching for API responses
- Database query optimization with indexes

## Security
- JWT authentication with refresh tokens
- Password hashing (bcrypt)
- Input validation (Pydantic)
- CORS configuration
- Rate limiting
- XSS, CSRF, SQL injection protection
- HTTPS enforced in production

## License
MIT License — see [LICENSE](LICENSE) for details.

---

Built with ❤️ by the CogniCart Team
