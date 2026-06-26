from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
import json
import hmac
import hashlib
import uuid
from datetime import datetime, timezone
import logging

from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/payments", tags=["Payments Gateway"])


class CreateOrderRequest(BaseModel):
    amount: int
    currency: str = "usd"
    payment_method: str = "stripe"


class VerifyPaymentRequest(BaseModel):
    payment_id: str
    order_id: str
    signature: str
    payment_method: str = "stripe"


def _is_stripe_mode() -> bool:
    return bool(settings.STRIPE_SECRET_KEY)


def _is_razorpay_mode() -> bool:
    return bool(settings.RAZORPAY_KEY_ID)


def _mock_create_order(amount: int, currency: str, payment_method: str) -> dict:
    return {
        "id": f"mock_order_{uuid.uuid4().hex[:12]}",
        "amount": amount,
        "currency": currency.upper(),
        "payment_method": payment_method,
        "status": "created",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }


def _mock_verify_payment(payment_id: str, order_id: str, signature: str) -> dict:
    return {
        "status": "success",
        "payment_id": payment_id,
        "order_id": order_id,
        "signature": signature,
        "verified_at": datetime.now(timezone.utc).isoformat(),
    }


@router.post("/create-order")
async def create_order(data: CreateOrderRequest):
    if data.payment_method == "stripe" and _is_stripe_mode():
        try:
            import stripe
            stripe.api_key = settings.STRIPE_SECRET_KEY
            intent = stripe.PaymentIntent.create(
                amount=data.amount,
                currency=data.currency.lower(),
                metadata={"integration": "cognicart"},
            )
            return {
                "id": intent.id,
                "client_secret": intent.client_secret,
                "amount": intent.amount,
                "currency": intent.currency.upper(),
                "payment_method": data.payment_method,
                "status": intent.status,
            }
        except ImportError:
            logger.warning("stripe library not installed, falling back to mock")
            return _mock_create_order(data.amount, data.currency, data.payment_method)
        except Exception as e:
            logger.error(f"Stripe create order failed: {e}")
            raise HTTPException(status_code=502, detail=f"Payment gateway error: {str(e)}")

    if data.payment_method == "razorpay" and _is_razorpay_mode():
        try:
            import razorpay
            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
            order_data = {
                "amount": data.amount,
                "currency": data.currency.upper(),
                "payment_capture": 1,
            }
            order = client.order.create(order_data)
            return {
                "id": order["id"],
                "amount": order["amount"],
                "currency": order["currency"],
                "payment_method": data.payment_method,
                "status": order["status"],
                "razorpay_key_id": settings.RAZORPAY_KEY_ID,
            }
        except ImportError:
            logger.warning("razorpay library not installed, falling back to mock")
            return _mock_create_order(data.amount, data.currency, data.payment_method)
        except Exception as e:
            logger.error(f"Razorpay create order failed: {e}")
            raise HTTPException(status_code=502, detail=f"Payment gateway error: {str(e)}")

    return _mock_create_order(data.amount, data.currency, data.payment_method)


@router.post("/verify")
async def verify_payment(data: VerifyPaymentRequest):
    if data.payment_method == "razorpay" and _is_razorpay_mode():
        expected_signature = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode(),
            f"{data.order_id}|{data.payment_id}".encode(),
            hashlib.sha256,
        ).hexdigest()
        if hmac.compare_digest(expected_signature, data.signature):
            return {
                "status": "success",
                "payment_id": data.payment_id,
                "order_id": data.order_id,
                "verified_at": datetime.now(timezone.utc).isoformat(),
            }
        raise HTTPException(status_code=400, detail="Payment verification failed: invalid signature")

    if data.payment_method == "stripe" and _is_stripe_mode():
        return {
            "status": "success",
            "payment_id": data.payment_id,
            "order_id": data.order_id,
            "verified_at": datetime.now(timezone.utc).isoformat(),
        }

    return _mock_verify_payment(data.payment_id, data.order_id, data.signature)


@router.post("/webhook")
async def payment_webhook(request: Request):
    payload = await request.body()
    signature = request.headers.get("stripe-signature") or request.headers.get("x-razorpay-signature", "")

    if signature and _is_stripe_mode():
        try:
            import stripe
            stripe.api_key = settings.STRIPE_SECRET_KEY
            event = stripe.Webhook.construct_event(
                payload, signature, settings.STRIPE_WEBHOOK_SECRET
            )
            return {"received": True, "type": event.type, "id": event.id}
        except ImportError:
            logger.warning("stripe library not installed, processing webhook raw")
        except Exception as e:
            logger.error(f"Stripe webhook verification failed: {e}")

    try:
        body = json.loads(payload)
    except json.JSONDecodeError:
        body = {}

    return {
        "received": True,
        "event": body.get("type", "unknown"),
        "message": "Webhook received",
    }
