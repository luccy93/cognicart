import json
import logging
import re
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func, or_, and_
from sqlalchemy.orm import selectinload

from app.models.feature_extensions import ChatHistory
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.models.interaction import BrowsingHistory, Wishlist, Review, Rating
from app.models.additional import Coupon
from app.models.user import User
from app.ai.llm_service import llm_service

logger = logging.getLogger(__name__)

TRANSLATIONS = {
    "hello": {"ta": "வணக்கம்", "hi": "नमस्ते", "te": "నమస్కారం"},
    "recommend": {"ta": "பரிந்துரை", "hi": "सुझाव", "te": "సిఫార్సు"},
    "order": {"ta": "ஆர்டர்", "hi": "ऑर्डर", "te": "ఆర్డర్"},
    "deal": {"ta": "சிறப்பு சலுகை", "hi": "डील", "te": "డీల్"},
    "track": {"ta": "கண்காணி", "hi": "ट्रैक करें", "te": "ట్రాక్"},
    "price": {"ta": "விலை", "hi": "कीमत", "te": "ధర"},
    "return": {"ta": "திரும்பப் பெறு", "hi": "वापसी", "te": "తిరిగి ఇవ్వు"},
    "shipping": {"ta": "ஷிப்பிங்", "hi": "शिपिंग", "te": "షిప్పింగ్"},
    "payment": {"ta": "கட்டணம்", "hi": "भुगतान", "te": "చెల్లింపు"},
}


class ChatService:
    def __init__(self):
        self.sessions: Dict[str, List[dict]] = {}

    async def get_or_create_session(
        self, user_id: str, session_id: Optional[str] = None, db: AsyncSession = None
    ) -> str:
        if not session_id:
            session_id = str(uuid.uuid4())
        if session_id not in self.sessions:
            self.sessions[session_id] = []
            if db:
                result = await db.execute(
                    select(ChatHistory)
                    .where(
                        ChatHistory.user_id == user_id,
                        ChatHistory.session_id == session_id,
                    )
                    .order_by(ChatHistory.created_at)
                )
                history = result.scalars().all()
                for msg in history:
                    self.sessions[session_id].append(
                        {"role": msg.role, "content": msg.content}
                    )
        return session_id

    def _detect_language(self, text: str) -> str:
        tamil_chars = set("அஆஇஈஉஊஎஏஐஒஓஔகஙசஜஞடணதநபமயரலவழளற்ற")
        hindi_chars = set("कखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह")
        telugu_chars = set("అఆఇఈఉఊఋఎఏఐఒఓఔకఖగఘఙచఛజఝఞటఠడఢణతథదధనపఫబభమయరలవశషసహ")
        for ch in text:
            if ch in tamil_chars:
                return "ta"
            if ch in hindi_chars:
                return "hi"
            if ch in telugu_chars:
                return "te"
        return "en"

    def _get_translation(self, key: str, lang: str) -> str:
        if lang in TRANSLATIONS.get(key, {}):
            return TRANSLATIONS[key][lang]
        return key

    async def generate_response(
        self,
        user_id: str,
        user_message: str,
        session_id: str,
        db: AsyncSession,
    ) -> dict:
        lower = user_message.lower().strip()
        lang = self._detect_language(user_message)

        # ── Shopping-specific intents (always use rule-based for DB queries) ──

        # Order tracking
        if any(w in lower for w in ["track", "where is my", "order status", "my order", self._get_translation("track", lang)]):
            order_id = self._extract_order_id(lower)
            return await self._handle_order_tracking(user_id, order_id, db, lang)

        # Product recommendation
        if any(w in lower for w in ["recommend", "suggest", "show me", "find", "need", "looking for", self._get_translation("recommend", lang)]):
            return await self._handle_product_recommendation(lower, user_id, db, lang)

        # Product comparison
        if any(w in lower for w in ["compare", "vs", "versus", "or"]):
            return await self._handle_product_comparison(lower, db, lang)

        # Deals / discounts / coupons
        if any(w in lower for w in ["deal", "discount", "coupon", "offer", "sale", "under ₹", "budget", self._get_translation("deal", lang)]):
            return await self._handle_deals(lower, db, lang)

        # Smart coupon
        if any(w in lower for w in ["best coupon", "apply coupon", "coupon for cart", "best offer"]):
            return await self._handle_smart_coupon(user_id, db, lang)

        # Trending / popular
        if any(w in lower for w in ["trending", "popular", "top", "best", "hot"]):
            return await self._handle_trending(db, lang)

        # FAQ / policy
        if any(w in lower for w in ["faq", "return", "shipping", "refund", "cancel", "policy", "payment", self._get_translation("return", lang), self._get_translation("shipping", lang)]):
            return self._handle_faq(lower, lang)

        # Personalized recommendations
        if any(w in lower for w in ["personalized", "for me", "my interest", "based on my"]):
            return await self._handle_personalized_recommendations(user_id, db, lang)

        # Recommendation explanations
        if any(w in lower for w in ["why", "explain", "reason", "because"]):
            return await self._handle_explanation(user_id, lower, db, lang)

        # Greeting
        if any(w in lower for w in ["hello", "hi ", "hey", "greetings", "namaste", self._get_translation("hello", lang)]):
            return await self._greeting_response(user_id, db, lang)

        # Help
        if any(w in lower for w in ["help", "what can you do", "capabilities", "features"]):
            return self._help_response(lang)

        # Price/stock alerts
        if any(w in lower for w in ["price alert", "notify me", "stock alert", self._get_translation("price", lang)]):
            return self._alert_response(lang)

        # Cancel order
        if "cancel" in lower and ("order" in lower or "my" in lower):
            order_id = self._extract_order_id(lower)
            return await self._handle_order_tracking(user_id, order_id, db, lang)

        # Multilingual non-English fallback
        if lang != "en":
            return await self._handle_multilingual_query(user_message, lang, db)

        # ── LLM-powered general conversation ──
        llm_response = await self._try_llm(user_message, session_id)
        if llm_response:
            return {"type": "text", "content": llm_response, "suggestions": ["Recommend products", "Track my order", "Show deals", "Help"]}

        # ── Rule-based fallback ──
        return await self._handle_general_query(lower, db, lang)

    async def _try_llm(self, user_message: str, session_id: str) -> Optional[str]:
        try:
            session_history = self.sessions.get(session_id, [])
            context = session_history[-10:] if session_history else None
            return await llm_service.generate(user_message, context)
        except Exception as e:
            logger.warning(f"LLM service unavailable, using rule-based fallback: {e}")
            return None

    async def _handle_multilingual_query(self, query: str, lang: str, db: AsyncSession) -> dict:
        responses = {
            "ta": "உங்கள் கேள்வியைப் புரிந்துகொள்ள முடியவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும் அல்லது ஆங்கிலத்தில் கேட்கவும்.",
            "hi": "आपका प्रश्न समझ में नहीं आया। कृपया पुनः प्रयास करें या अंग्रेजी में पूछें।",
            "te": "మీ ప్రశ్న అర్థం కాలేదు. దయచేసి మళ్ళీ ప్రయత్నించండి లేదా ఆంగ్లంలో అడగండి.",
        }
        return {
            "type": "text",
            "content": responses.get(lang, "I didn't understand your query. Please try again."),
            "suggestions": ["Recommend products", "Track my order", "Show deals", "Help"],
        }

    def _extract_order_id(self, text: str) -> Optional[str]:
        patterns = [
            r"ORD-\d+",
            r"order\s*[#: ]?\s*(\w{8,})",
            r"(\w{8,12})",
        ]
        for pat in patterns:
            match = re.search(pat, text, re.IGNORECASE)
            if match:
                return match.group(0)
        return None

    async def _handle_order_tracking(
        self, user_id: str, order_id: Optional[str], db: AsyncSession, lang: str = "en"
    ) -> dict:
        prompts = {
            "missing_id": {
                "en": "Please provide your order ID (e.g., ORD-12345) and I'll track it for you!",
                "ta": "உங்கள் ஆர்டர் ஐடியை வழங்கவும் (எ.கா., ORD-12345), நான் அதை கண்காணிக்கிறேன்!",
                "hi": "कृपया अपना ऑर्डर आईडी प्रदान करें (जैसे, ORD-12345), मैं इसे ट्रैक करूंगा!",
                "te": "దయచేసి మీ ఆర్డర్ ID ని అందించండి (ఉదా., ORD-12345), నేను దానిని ట్రాక్ చేస్తాను!",
            },
            "not_found": {
                "en": "I couldn't find order `{id}`. Please check and try again.",
                "ta": "ஆர்டர் `{id}` கண்டுபிடிக்க முடியவில்லை. சரிபார்த்து மீண்டும் முயற்சிக்கவும்.",
                "hi": "ऑर्डर `{id}` नहीं मिला। कृपया जांचें और पुनः प्रयास करें।",
                "te": "ఆర్డర్ `{id}` కనుగొనలేకపోయాను. దయచేసి తనిఖీ చేసి మళ్ళీ ప్రయత్నించండి.",
            },
        }
        if not order_id:
            content = prompts["missing_id"].get(lang, prompts["missing_id"]["en"])
            return {"type": "text", "content": content, "suggestions": ["Track ORD-12345", "My recent orders", "Cancel my order"]}

        result = await db.execute(
            select(Order)
            .where(Order.id == order_id, Order.user_id == user_id)
            .options(selectinload(Order.items).selectinload(OrderItem.product))
        )
        order = result.scalar_one_or_none()

        if not order:
            content = prompts["not_found"].get(lang, prompts["not_found"]["en"]).format(id=order_id)
            return {"type": "text", "content": content, "suggestions": ["Track my recent orders", "View Orders page", "Contact support"]}

        items_summary = "\n".join([f"• {item.product.name} x{item.quantity}" for item in order.items])
        tracking_info = f"\n**Tracking:** {order.tracking_number}" if order.tracking_number else ""

        status_labels = {
            "en": "Status", "ta": "நிலை", "hi": "स्थिति", "te": "స్థితి",
        }
        payment_labels = {
            "en": "Payment", "ta": "கட்டணம்", "hi": "भुगतान", "te": "చెల్లింపు",
        }
        total_labels = {
            "en": "Total", "ta": "மொத்தம்", "hi": "कुल", "te": "మొత్తం",
        }

        return {
            "type": "text",
            "content": (
                f"**Order #{order.order_number or order.id}**\n\n"
                f"**{status_labels.get(lang, 'Status')}:** `{order.status.upper()}`\n"
                f"**{payment_labels.get(lang, 'Payment')}:** `{order.payment_status.upper()}`\n"
                f"**{total_labels.get(lang, 'Total')}:** ₹{order.total:,.2f}\n"
                f"**Items:**\n{items_summary}{tracking_info}"
            ),
            "suggestions": ["Track another order", "View all orders", "Need help?"],
        }

    async def _handle_product_recommendation(
        self, query: str, user_id: str, db: AsyncSession, lang: str = "en"
    ) -> dict:
        keywords = self._extract_keywords(query)
        conditions = [Product.is_active == True]

        if keywords:
            keyword_filters = []
            for kw in keywords:
                keyword_filters.append(Product.tags.ilike(f"%{kw}%"))
                keyword_filters.append(Product.name.ilike(f"%{kw}%"))
                keyword_filters.append(Product.brand.ilike(f"%{kw}%"))
            if keyword_filters:
                conditions.append(or_(*keyword_filters))

        # Extract budget
        budget = self._extract_budget(query)
        if budget:
            conditions.append(Product.price <= budget)
            budget_hint = f" under ₹{budget:,.0f}"
        else:
            budget_hint = ""

        # Also check user's browsing/wishlist history for context-aware results
        if not keywords:
            try:
                history_result = await db.execute(
                    select(BrowsingHistory.product_id)
                    .where(BrowsingHistory.user_id == user_id)
                    .order_by(desc(BrowsingHistory.viewed_at))
                    .limit(5)
                )
                browsed_ids = [row[0] for row in history_result.all() if row[0]]
                if browsed_ids:
                    conditions.append(Product.id.in_(browsed_ids))
            except Exception:
                pass

        result = await db.execute(
            select(Product)
            .where(and_(*conditions))
            .order_by(desc(Product.popularity_score))
            .limit(5)
        )
        products = result.scalars().all()

        if not products:
            messages = {
                "en": f"I couldn't find products matching '{' '.join(keywords)}'.",
                "ta": f"'{' '.join(keywords)}' உடன் பொருந்தும் பொருட்களை என்னால் கண்டுபிடிக்க முடியவில்லை.",
                "hi": f"'{' '.join(keywords)}' से मेल खाने वाले उत्पाद नहीं मिल सके।",
                "te": f"'{' '.join(keywords)}' తో సరిపోలే ఉత్పత్తులు కనుగొనలేకపోయాను.",
            }
            return {
                "type": "text",
                "content": messages.get(lang, messages["en"]),
                "suggestions": ["Show trending products", "Best sellers", "Browse categories"],
            }

        product_cards = [
            {
                "id": p.id, "name": p.name, "price": p.price,
                "rating": p.average_rating, "image": p.thumbnail_url,
                "match_score": min(99, int(p.popularity_score)), "slug": p.slug,
                "brand": p.brand,
            }
            for p in products
        ]

        header = {
            "en": f"Here are top picks{budget_hint} based on your query:",
            "ta": f"உங்கள் கேள்வியின் அடிப்படையில் சிறந்த தேர்வுகள்{budget_hint}:",
            "hi": f"आपकी क्वेरी के आधार पर शीर्ष चयन{budget_hint}:",
            "te": f"మీ ప్రశ్న ఆధారంగా టాప్ ఎంపికలు{budget_hint}:",
        }

        return {
            "type": "carousel",
            "content": header.get(lang, header["en"]),
            "products": product_cards,
            "suggestions": ["Add to cart", "View details", "Compare"],
        }

    async def _handle_smart_coupon(self, user_id: str, db: AsyncSession, lang: str = "en") -> dict:
        try:
            now = datetime.now(timezone.utc)
            result = await db.execute(
                select(Coupon)
                .where(
                    Coupon.is_active == True,
                    Coupon.starts_at <= now,
                    Coupon.expires_at >= now,
                )
                .order_by(desc(Coupon.discount_value))
                .limit(3)
            )
            coupons = result.scalars().all()

            if not coupons:
                messages = {
                    "en": "No coupons available right now. Check back later for exciting offers!",
                    "ta": "இப்போது கூப்பன்கள் எதுவும் இல்லை. பின்னர் சரிபார்க்கவும்!",
                    "hi": "अभी कोई कूपन उपलब्ध नहीं है। बाद में जांचें!",
                    "te": "ప్రస్తుతం కూపన్లు లేవు. తర్వాత తనిఖీ చేయండి!",
                }
                return {"type": "text", "content": messages.get(lang, messages["en"]), "suggestions": ["Show deals", "Trending products", "Browse all"]}

            coupon_lines = []
            for c in coupons:
                if c.discount_type == "percentage":
                    val = f"{c.discount_value}% OFF"
                else:
                    val = f"₹{c.discount_value} OFF"
                coupon_lines.append(f"🏷️ **{c.code}** — {val}\n   {c.description or 'Limited time offer'}")

            return {
                "type": "text",
                "content": "🎫 **Best Coupons Available**\n\n" + "\n\n".join(coupon_lines) + "\n\nUse these at checkout!",
                "suggestions": ["Apply coupon", "Show more deals", "Browse products"],
            }
        except Exception:
            return {"type": "text", "content": "Check your cart for available coupon options!", "suggestions": ["View cart", "Browse deals"]}

    async def _handle_product_comparison(self, query: str, db: AsyncSession, lang: str = "en") -> dict:
        words = re.split(r"\s+(?:vs|versus|and|or)\s+", query)
        if len(words) >= 2:
            names = [w.strip() for w in words[:2] if w.strip()]
            if len(names) >= 2:
                results = []
                for name in names:
                    parts = name.split()[-3:]
                    r = await db.execute(
                        select(Product).where(
                            Product.is_active == True,
                            or_(*[Product.name.ilike(f"%{p}%") for p in parts],
                                *[Product.brand.ilike(f"%{p}%") for p in parts])
                        ).limit(1)
                    )
                    p = r.scalar_one_or_none()
                    if p:
                        results.append(p)

                if len(results) == 2:
                    p1, p2 = results
                    return {
                        "type": "comparison",
                        "content": f"## {p1.name} vs {p2.name}",
                        "products": [
                            {"id": p1.id, "name": p1.name, "price": p1.price, "rating": p1.average_rating,
                             "reviews": p1.total_reviews, "purchases": p1.total_purchases,
                             "image": p1.thumbnail_url, "brand": p1.brand, "slug": p1.slug},
                            {"id": p2.id, "name": p2.name, "price": p2.price, "rating": p2.average_rating,
                             "reviews": p2.total_reviews, "purchases": p2.total_purchases,
                             "image": p2.thumbnail_url, "brand": p2.brand, "slug": p2.slug},
                        ],
                        "suggestions": [f"View {p1.name}", f"View {p2.name}", "Compare other products"],
                    }

        messages = {
            "en": "I can help compare products! Try: *Compare iPhone vs Samsung*",
            "ta": "பொருட்களை ஒப்பிட உதவுகிறேன்! முயற்சிக்கவும்: *iPhone vs Samsung ஒப்பிடுக*",
            "hi": "उत्पादों की तुलना करने में मदद कर सकता हूं! उदाहरण: *iPhone vs Samsung तुलना करें*",
            "te": "ఉత్పత్తులను పోల్చడానికి సహాయపడగలను! ప్రయత్నించండి: *iPhone vs Samsung పోల్చండి*",
        }
        return {"type": "text", "content": messages.get(lang, messages["en"]),
                "suggestions": ["Show trending products", "Best headphones", "Browse all"]}

    async def _handle_deals(self, query: str, db: AsyncSession, lang: str = "en") -> dict:
        budget = self._extract_budget(query)
        conditions = [Product.is_active == True, Product.original_price.isnot(None)]
        if budget:
            conditions.append(Product.price <= budget)

        result = await db.execute(
            select(Product).where(and_(*conditions))
            .order_by(desc(func.round((Product.original_price - Product.price) / Product.original_price * 100)))
            .limit(5)
        )
        products = result.scalars().all()

        product_cards = []
        for p in products:
            if p.original_price and p.original_price > p.price:
                discount = int((p.original_price - p.price) / p.original_price * 100)
                product_cards.append({
                    "id": p.id, "name": p.name, "price": p.price,
                    "original_price": p.original_price, "discount": discount,
                    "rating": p.average_rating, "image": p.thumbnail_url, "slug": p.slug,
                })

        if not product_cards:
            messages = {
                "en": "No deals found right now. Check back soon!",
                "ta": "இப்போது சலுகைகள் எதுவும் இல்லை. விரைவில் மீண்டும் சரிபார்க்கவும்!",
                "hi": "अभी कोई डील नहीं मिली। जल्द ही दोबारा जांचें!",
                "te": "ప్రస్తుతం డీల్స్ లేవు. త్వరలో మళ్ళీ తనిఖీ చేయండి!",
            }
            return {"type": "text", "content": messages.get(lang, messages["en"]),
                    "suggestions": ["Show all products", "Trending", "Best rated"]}

        header = {
            "en": "🔥 **Best Deals & Discounts** — Grab them before they're gone!",
            "ta": "🔥 **சிறந்த சலுகைகள் & தள்ளுபடிகள்** — இவை முடிவதற்குள் பெற்றுக்கொள்ளுங்கள்!",
            "hi": "🔥 **सर्वश्रेष्ठ डील और छूट** — इन्हें जाने से पहले पाएं!",
            "te": "🔥 **ఉత్తమ డీల్స్ & డిస్కౌంట్లు** — ఇవి పోయేముందు పొందండి!",
        }

        return {"type": "carousel", "content": header.get(lang, header["en"]),
                "products": product_cards, "suggestions": ["Show more deals", "Apply coupon", "Flash sales"]}

    async def _handle_trending(self, db: AsyncSession, lang: str = "en") -> dict:
        result = await db.execute(
            select(Product).where(Product.is_active == True)
            .order_by(desc(Product.popularity_score)).limit(6)
        )
        products = result.scalars().all()

        product_cards = [
            {"id": p.id, "name": p.name, "price": p.price, "rating": p.average_rating,
             "image": p.thumbnail_url, "match_score": min(99, int(p.popularity_score)), "slug": p.slug}
            for p in products
        ]

        header = {
            "en": "📈 **Trending Products** — What everyone's buying right now!",
            "ta": "📈 **பிரபலமான பொருட்கள்** — அனைவரும் இப்போது வாங்குவது என்ன!",
            "hi": "📈 **ट्रेंडिंग उत्पाद** — हर कोई अभी क्या खरीद रहा है!",
            "te": "📈 **ట్రెండింగ్ ఉత్పత్తులు** — అందరూ ఇప్పుడు ఏమి కొంటున్నారు!",
        }

        return {"type": "carousel", "content": header.get(lang, header["en"]),
                "products": product_cards, "suggestions": ["Recommend for me", "Best deals", "New arrivals"]}

    async def _handle_personalized_recommendations(self, user_id: str, db: AsyncSession, lang: str = "en") -> dict:
        try:
            # Get user's wishlist
            wishlist_result = await db.execute(
                select(Wishlist.product_id).where(Wishlist.user_id == user_id).limit(10)
            )
            wishlist_ids = [row[0] for row in wishlist_result.all() if row[0]]

            # Get browsing history
            browsing_result = await db.execute(
                select(BrowsingHistory.product_id).where(BrowsingHistory.user_id == user_id)
                .order_by(desc(BrowsingHistory.viewed_at)).limit(20)
            )
            browsed_ids = [row[0] for row in browsing_result.all() if row[0]]

            # Get purchased products
            order_result = await db.execute(
                select(OrderItem.product_id).join(Order).where(
                    Order.user_id == user_id,
                    Order.status.in_(["delivered", "shipped", "confirmed"]),
                ).limit(20)
            )
            purchased_ids = [row[0] for row in order_result.all() if row[0]]

            # Build personalized recommendations excluding purchased items
            all_interests = list(set(wishlist_ids + browsed_ids))
            if not all_interests:
                # Get user's preferred_categories
                user_result = await db.execute(select(User).where(User.id == user_id))
                user = user_result.scalar_one_or_none()
                if user and user.preferred_categories:
                    categories = [c.strip() for c in user.preferred_categories.split(",")]
                    conditions = [Product.is_active == True,
                                  or_(*[Product.tags.ilike(f"%{c}%") for c in categories])]
                else:
                    conditions = [Product.is_active == True]
            else:
                conditions = [Product.is_active == True,
                              Product.id.in_(all_interests)]

            if purchased_ids:
                conditions.append(Product.id.notin_(purchased_ids))

            result = await db.execute(
                select(Product).where(and_(*conditions))
                .order_by(desc(Product.popularity_score)).limit(5)
            )
            products = result.scalars().all()

            if not products:
                messages = {
                    "en": "I don't have enough data to personalize yet. Try browsing or adding items to your wishlist!",
                    "ta": "இன்னும் தனிப்பயனாக்க போதுமான தரவு இல்லை. உங்கள் விருப்பப்பட்டியலில் பொருட்களைச் சேர்க்கவும்!",
                    "hi": "अभी तक वैयक्तिकृत करने के लिए पर्याप्त डेटा नहीं है। अपनी इच्छा सूची में आइटम जोड़ें!",
                    "te": "ఇంకా వ్యక్తిగతీకరించడానికి తగినంత డేటా లేదు. మీ విష్లిస్ట్కి ఐటమ్లను జోడించండి!",
                }
                return {"type": "text", "content": messages.get(lang, messages["en"]),
                        "suggestions": ["Browse products", "Trending items", "Shop now"]}

            # Build explanation
            explanation_parts = []
            if wishlist_ids:
                explanation_parts.append("📌 items in your wishlist")
            if browsed_ids:
                explanation_parts.append("👀 products you've viewed")
            explanation = "Based on " + " and ".join(explanation_parts) if explanation_parts else "Based on your interests"

            product_cards = [
                {"id": p.id, "name": p.name, "price": p.price, "rating": p.average_rating,
                 "image": p.thumbnail_url, "match_score": min(99, int(p.popularity_score)), "slug": p.slug}
                for p in products
            ]

            return {
                "type": "carousel",
                "content": f"🎯 **Personalized For You**\n{explanation}:",
                "products": product_cards,
                "suggestions": ["Add to cart", "View details", "Show more"],
            }

        except Exception as e:
            logger.error(f"Personalized recs error: {e}")
            return await self._handle_trending(db, lang)

    async def _handle_explanation(self, user_id: str, query: str, db: AsyncSession, lang: str = "en") -> dict:
        try:
            history_result = await db.execute(
                select(BrowsingHistory).where(BrowsingHistory.user_id == user_id)
                .order_by(desc(BrowsingHistory.viewed_at)).limit(3)
            )
            history = history_result.scalars().all()

            purchase_result = await db.execute(
                select(OrderItem.product_id).join(Order).where(
                    Order.user_id == user_id,
                    Order.status.in_(["delivered", "shipped"]),
                ).order_by(desc(Order.created_at)).limit(3)
            )
            purchased = [row[0] for row in purchase_result.all() if row[0]]

            lines = []
            if history:
                lines.append("👀 **Recently Viewed:**")
                for h in history:
                    p = await db.get(Product, h.product_id)
                    if p:
                        lines.append(f"  • {p.name}")
            if purchased:
                products_result = await db.execute(
                    select(Product).where(Product.id.in_(purchased))
                )
                prods = products_result.scalars().all()
                lines.append("🛒 **Previously Purchased:**")
                for p in prods:
                    lines.append(f"  • {p.name}")

            if not lines:
                messages = {
                    "en": "Start browsing products and I'll explain why I recommend them!",
                    "ta": "பொருட்களை உலாவத் தொடங்குங்கள், நான் ஏன் பரிந்துரைக்கிறேன் என்பதை விளக்குகிறேன்!",
                    "hi": "उत्पादों को ब्राउज़ करना शुरू करें और मैं समझाऊंगा कि मैं उनकी अनुशंसा क्यों करता हूं!",
                    "te": "ఉత్పత్తులను బ్రౌజ్ చేయడం ప్రారంభించండి, నేను ఎందుకు సిఫార్సు చేస్తున్నానో వివరిస్తాను!",
                }
                return {"type": "text", "content": messages.get(lang, messages["en"]),
                        "suggestions": ["Browse products", "Trending", "Recommend"]}

            return {"type": "text", "content": "\n".join(lines),
                    "suggestions": ["Recommend for me", "Show deals", "Browse products"]}

        except Exception:
            return {"type": "text", "content": "Based on your browsing history and preferences!",
                    "suggestions": ["Recommend products", "Show trending"]}

    def _handle_faq(self, query: str, lang: str = "en") -> dict:
        lower = query.lower()
        if "return" in lower:
            contents = {
                "en": "**📦 Return Policy**\n\n• 30-day easy returns from delivery\n• Items must be unused with original packaging\n• Free pickup for defective items\n• Refund within 5-7 business days",
                "ta": "**📦 திரும்பப் பெறும் கொள்கை**\n\n• டெலிவரியில் இருந்து 30 நாட்கள் எளிதான திரும்பப் பெறுதல்\n• பொருட்கள் பயன்படுத்தப்படாததாக இருக்க வேண்டும்\n• குறைபாடுள்ள பொருட்களுக்கு இலவச சேகரிப்பு\n• 5-7 வேலை நாட்களில் பணம் திரும்பும்",
                "hi": "**📦 वापसी नीति**\n\n• डिलीवरी से 30 दिन आसान वापसी\n• सामान अप्रयुक्त और मूल पैकेजिंग में होना चाहिए\n• दोषपूर्ण वस्तुओं के लिए मुफ्त पिकअप\n• 5-7 कार्य दिवसों में रिफंड",
                "te": "**📦 తిరిగి ఇచ్చే విధానం**\n\n• డెలివరీ నుండి 30 రోజులు సులభమైన రిటర్న్\n• వస్తువులు ఉపయోగించనివిగా ఉండాలి\n• లోపభరిత వస్తువులకు ఉచిత పికప్\n• 5-7 పని దినాలలో రీఫండ్",
            }
        elif "shipping" in lower:
            contents = {
                "en": "**🚚 Shipping Policy**\n\n• Free shipping on orders above ₹999\n• Standard: 3-5 business days\n• Express: 1-2 days (₹99)\n• COD available up to ₹50,000\n• Same-day delivery in select cities",
                "ta": "**🚚 ஷிப்பிங் கொள்கை**\n\n• ₹999 க்கு மேல் இலவச ஷிப்பிங்\n• நிலையானது: 3-5 வேலை நாட்கள்\n• எக்ஸ்பிரஸ்: 1-2 நாட்கள் (₹99)\n• ₹50,000 வரை COD கிடைக்கும்",
                "hi": "**🚚 शिपिंग नीति**\n\n• ₹999 से अधिक के ऑर्डर पर मुफ्त शिपिंग\n• मानक: 3-5 कार्य दिवस\n• एक्सप्रेस: 1-2 दिन (₹99)\n• ₹50,000 तक COD उपलब्ध",
                "te": "**🚚 షిప్పింగ్ విధానం**\n\n• ₹999 పైన ఆర్డర్లకు ఉచిత షిప్పింగ్\n• స్టాండర్డ్: 3-5 పని దినాలు\n• ఎక్స్ప్రెస్: 1-2 రోజులు (₹99)\n• ₹50,000 వరకు COD అందుబాటులో",
            }
        elif "refund" in lower:
            contents = {
                "en": "**💰 Refund Policy**\n\n• Refund initiated within 24hrs of pickup\n• Credits to payment method: 3-5 days\n• Wallet credit: Instant\n• Check status in Orders page",
                "ta": "**💰 பணம் திரும்பப் பெறும் கொள்கை**\n\n• சேகரிப்பின் 24 மணி நேரத்திற்குள் பணம் திரும்பும்\n• கட்டண முறைக்கு: 3-5 நாட்கள்\n• வாலெட் கிரெடிட்: உடனடி",
                "hi": "**💰 रिफंड नीति**\n\n• पिकअप के 24 घंटे के भीतर रिफंड शुरू\n• भुगतान विधि में: 3-5 दिन\n• वॉलेट क्रेडिट: तत्काल",
                "te": "**💰 రీఫండ్ విధానం**\n\n• పికప్ తర్వాత 24 గంటలలోపు రీఫండ్ ప్రారంభం\n• చెల్లింపు పద్ధతికి: 3-5 రోజులు\n• వాలెట్ క్రెడిట్: తక్షణం",
            }
        elif "payment" in lower:
            contents = {
                "en": "**💳 Payment Options**\n\n• Credit/Debit Cards (Visa, Mastercard, RuPay)\n• UPI (Google Pay, PhonePe, Paytm)\n• Net Banking\n• EMI options available\n• Cash on Delivery (COD)",
                "ta": "**💳 கட்டண விருப்பங்கள்**\n\n• கிரெடிட்/டெபிட் கார்டுகள்\n• UPI (Google Pay, PhonePe, Paytm)\n• நெட் பேங்கிங்\n• EMI வசதி\n• டெலிவரி时 பணம் (COD)",
                "hi": "**💳 भुगतान विकल्प**\n\n• क्रेडिट/डेबिट कार्ड\n• UPI (Google Pay, PhonePe, Paytm)\n• नेट बैंकिंग\n• EMI सुविधा\n• कैश ऑन डिलीवरी (COD)",
                "te": "**💳 చెల్లింపు ఎంపికలు**\n\n• క్రెడిట్/డెబిట్ కార్డులు\n• UPI (Google Pay, PhonePe, Paytm)\n• నెట్ బ్యాంకింగ్\n• EMI సౌకర్యం\n• డెలివరీపై నగదు (COD)",
            }
        else:
            contents = {
                "en": "**📖 FAQ**\n\n• **Shipping** — Free above ₹999, 3-5 days\n• **Returns** — 30-day easy returns\n• **Refunds** — 5-7 business days\n• **Payments** — Cards, UPI, Net Banking, COD\n\nWhat would you like to know more about?",
                "ta": "**📖 அடிக்கடி கேட்கப்படும் கேள்விகள்**\n\n• **ஷிப்பிங்** — ₹999 க்கு மேல் இலவசம்\n• **திரும்பப் பெறுதல்** — 30 நாட்கள்\n• **பணம் திரும்ப** — 5-7 நாட்கள்\n• **கட்டணம்** — கார்டுகள், UPI, நெட் பேங்கிங்",
                "hi": "**📖 सामान्य प्रश्न**\n\n• **शिपिंग** — ₹999 से ऊपर मुफ्त\n• **वापसी** — 30 दिन\n• **रिफंड** — 5-7 कार्य दिवस\n• **भुगतान** — कार्ड, UPI, नेट बैंकिंग",
                "te": "**📖 తరచుగా అడిగే ప్రశ్నలు**\n\n• **షిప్పింగ్** — ₹999 పైన ఉచితం\n• **రిటర్న్స్** — 30 రోజులు\n• **రీఫండ్స్** — 5-7 రోజులు\n• **చెల్లింపు** — కార్డులు, UPI, నెట్ బ్యాంకింగ్",
            }

        content = contents.get(lang, contents["en"])
        return {"type": "text", "content": content,
                "suggestions": ["Shipping details", "Return policy", "Payment options", "Contact support"]}

    async def _greeting_response(self, user_id: str, db: AsyncSession, lang: str = "en") -> dict:
        hour = datetime.now(timezone.utc).hour
        if lang == "ta":
            greeting = "காலை வணக்கம்" if hour < 12 else "மதிய வணக்கம்" if hour < 17 else "மாலை வணக்கம்"
            msg = f"👋 {greeting}! நான் CogniCart AI உதவியாளர்.\n\nஎன்னால் உதவ முடியும்:\n• 🛍️ பொருட்கள் பரிந்துரை\n• 📦 ஆர்டர் கண்காணிப்பு\n• 🔍 பொருட்கள் ஒப்பீடு\n• 💰 சிறந்த சலுகைகள்\n• ❓ கேள்விகள் & உதவி"
        elif lang == "hi":
            greeting = "शुभ प्रभात" if hour < 12 else "शुभ अपराह्न" if hour < 17 else "शुभ संध्या"
            msg = f"👋 {greeting}! मैं CogniCart AI सहायक हूं.\n\nमैं मदद कर सकता हूं:\n• 🛍️ उत्पाद अनुशंसा\n• 📦 ऑर्डर ट्रैकिंग\n• 🔍 उत्पाद तुलना\n• 💰 सर्वश्रेष्ठ डील\n• ❓ प्रश्नोत्तरी"
        elif lang == "te":
            greeting = "శుభోదయం" if hour < 12 else "శుభ మధ్యాహ్నం" if hour < 17 else "శుభ సాయంత్రం"
            msg = f"👋 {greeting}! నేను CogniCart AI సహాయకుడిని.\n\nనేను సహాయపడగలను:\n• 🛍️ ఉత్పత్తి సిఫార్సులు\n• 📦 ఆర్డర్ ట్రాకింగ్\n• 🔍 ఉత్పత్తి పోలిక\n• 💰 ఉత్తమ డీల్స్\n• ❓ తరచుగా అడిగే ప్రశ్నలు"
        else:
            greeting = "Good morning" if hour < 12 else "Good afternoon" if hour < 17 else "Good evening"

            # Try to get user name
            user_name = ""
            try:
                user_result = await db.execute(select(User).where(User.id == user_id))
                user = user_result.scalar_one_or_none()
                if user:
                    user_name = f", {user.full_name.split()[0]}"
            except Exception:
                pass

            msg = f"👋 {greeting}{user_name}! I'm CogniCart AI Assistant.\n\nI can help you with:\n• 🛍️ Product recommendations\n• 📦 Order tracking\n• 🔍 Product comparisons\n• 💰 Best deals & coupons\n• ❓ FAQs & support\n\nHow can I assist you today?"

        return {"type": "text", "content": msg,
                "suggestions": ["Recommend products for me", "Track my order", "Show today's deals", "Compare products"]}

    def _help_response(self, lang: str = "en") -> dict:
        helps = {
            "en": (
                "**🤖 CogniCart AI Capabilities**\n\n"
                "🛍️ **Product Discovery**\n• \"Recommend gaming laptops under ₹70000\"\n• \"Show me wireless headphones\"\n\n"
                "📊 **Product Comparison**\n• \"Compare iPhone 16 and Samsung S25\"\n\n"
                "📦 **Order Assistance**\n• \"Track my order\" • \"Where is my package?\"\n\n"
                "💰 **Deals & Coupons**\n• \"Show today's deals\" • \"Apply best coupon\"\n\n"
                "🎯 **Personalized**\n• \"Recommend for me\" • \"Based on my interests\"\n\n"
                "❓ **Support**\n• Shipping, returns, payments\n\n"
                "What would you like help with?"
            ),
            "ta": (
                "**🤖 CogniCart AI திறன்கள்**\n\n"
                "🛍️ **பொருட்கள் கண்டுபிடிப்பு**\n• \"₹70000 க்குள் கேமிங் லேப்டாப் பரிந்துரை\"\n\n"
                "📦 **ஆர்டர் உதவி**\n• \"என் ஆர்டரை கண்காணி\"\n\n"
                "💰 **சலுகைகள்**\n• \"இன்றைய சலுகைகளை காட்டு\"\n\n"
                "❓ **உதவி**\n• ஷிப்பிங், திரும்பப் பெறுதல், கட்டணம்"
            ),
            "hi": (
                "**🤖 CogniCart AI क्षमताएं**\n\n"
                "🛍️ **उत्पाद खोज**\n• \"₹70000 के तहत गेमिंग लैपटॉप सुझाएं\"\n\n"
                "📦 **ऑर्डर सहायता**\n• \"मेरे ऑर्डर को ट्रैक करें\"\n\n"
                "💰 **डील और कूपन**\n• \"आज की डील दिखाएं\"\n\n"
                "❓ **सहायता**\n• शिपिंग, वापसी, भुगतान"
            ),
            "te": (
                "**🤖 CogniCart AI సామర్థ్యాలు**\n\n"
                "🛍️ **ఉత్పత్తి ఆవిష్కరణ**\n• \"₹70000 లోపు గేమింగ్ ల్యాప్టాప్ సిఫార్సు చేయి\"\n\n"
                "📦 **ఆర్డర్ సహాయం**\n• \"నా ఆర్డర్ ట్రాక్ చేయి\"\n\n"
                "💰 **డీల్స్**\n• \"నేటి డీల్స్ చూపించు\"\n\n"
                "❓ **సహాయం**\n• షిప్పింగ్, రిటర్న్స్, చెల్లింపులు"
            ),
        }
        content = helps.get(lang, helps["en"])
        return {"type": "text", "content": content,
                "suggestions": ["Recommend products", "Track my order", "Show deals", "Return policy"]}

    def _alert_response(self, lang: str = "en") -> dict:
        alerts = {
            "en": "🔔 **Price & Stock Alerts**\n\n• **Price drops** — Get notified when price falls\n• **Back in stock** — Know when sold-out items return\n\nVisit any product page and use the alert buttons!",
            "ta": "🔔 **விலை & கையிருப்பு எச்சரிக்கைகள்**\n\n• **விலை குறைவு** — விலை குறையும் போது அறிவிப்பு\n• **மீண்டும் கையிருப்பில்** — விற்றுத் தீர்ந்த பொருட்கள் வரும்போது அறிவிப்பு",
            "hi": "🔔 **मूल्य और स्टॉक अलर्ट**\n\n• **मूल्य में गिरावट** — कीमत गिरने पर सूचना\n• **वापस स्टॉक में** — बिक चुके आइटम आने पर सूचना",
            "te": "🔔 **ధర & స్టాక్ అలర్ట్లు**\n\n• **ధర తగ్గింపు** — ధర తగ్గినప్పుడు నోటిఫికేషన్\n• **తిరిగి స్టాక్లో** — అమ్ముడుపోయిన వస్తువులు వచ్చినప్పుడు నోటిఫికేషన్",
        }
        return {"type": "text", "content": alerts.get(lang, alerts["en"]),
                "suggestions": ["Show trending", "Best deals", "Browse products"]}

    async def _handle_general_query(self, query: str, db: AsyncSession, lang: str = "en") -> dict:
        keywords = self._extract_keywords(query)
        if not keywords:
            return self._help_response(lang)

        conditions = [Product.is_active == True]
        keyword_filters = []
        for kw in keywords:
            keyword_filters.append(Product.name.ilike(f"%{kw}%"))
            keyword_filters.append(Product.tags.ilike(f"%{kw}%"))
            keyword_filters.append(Product.brand.ilike(f"%{kw}%"))
            keyword_filters.append(Product.short_description.ilike(f"%{kw}%"))
        if keyword_filters:
            conditions.append(or_(*keyword_filters))

        result = await db.execute(
            select(Product).where(and_(*conditions))
            .order_by(desc(Product.popularity_score)).limit(5)
        )
        products = result.scalars().all()

        if not products:
            no_results = {
                "en": f"I couldn't find anything for \"{' '.join(keywords)}\".",
                "ta": f"\"{' '.join(keywords)}\" க்கு எதுவும் கிடைக்கவில்லை.",
                "hi": f"\"{' '.join(keywords)}\" के लिए कुछ नहीं मिला।",
                "te": f"\"{' '.join(keywords)}\" కోసం ఏమీ కనుగొనలేకపోయాను.",
            }
            return {"type": "text", "content": no_results.get(lang, no_results["en"]),
                    "suggestions": ["Show all products", "Trending items", "Help"]}

        product_cards = [
            {"id": p.id, "name": p.name, "price": p.price, "rating": p.average_rating,
             "image": p.thumbnail_url, "match_score": min(99, int(p.popularity_score)), "slug": p.slug}
            for p in products
        ]

        return {"type": "carousel", "content": f"Here's what I found for \"{' '.join(keywords)}\":",
                "products": product_cards, "suggestions": ["View details", "Compare", "Add to cart"]}

    def _extract_keywords(self, query: str) -> List[str]:
        stop_words = {
            "a", "an", "the", "is", "are", "was", "were", "for", "and", "or",
            "in", "on", "at", "to", "of", "by", "with", "show", "me", "find",
            "need", "want", "get", "buy", "recommend", "suggest", "looking",
            "under", "less", "than", "above", "more", "best", "top", "good",
            "great", "nice", "some", "any", "all", "please", "can", "could",
            "would", "should", "hi", "hello", "hey", "vs", "versus",
        }
        words = re.findall(r"\b\w{2,}\b", query.lower())
        return [w for w in words if w not in stop_words][:5]

    def _extract_budget(self, query: str) -> Optional[float]:
        patterns = [
            r"under\s*₹?\s*([\d,]+)",
            r"less\s*than\s*₹?\s*([\d,]+)",
            r"budget\s*(?:of\s*)?₹?\s*([\d,]+)",
            r"₹\s*([\d,]+)",
            r"below\s*₹?\s*([\d,]+)",
            r"upto\s*₹?\s*([\d,]+)",
        ]
        for pat in patterns:
            match = re.search(pat, query, re.IGNORECASE)
            if match:
                return float(match.group(1).replace(",", ""))
        return None

    async def save_message(self, user_id: str, session_id: str, role: str, content: str, metadata_json: dict = None, db: AsyncSession = None):
        msg = ChatHistory(
            id=str(uuid.uuid4()), user_id=user_id, session_id=session_id,
            role=role, content=content, metadata_json=metadata_json or {},
        )
        db.add(msg)
        await db.commit()
        await db.refresh(msg)
        return msg


chat_service = ChatService()
