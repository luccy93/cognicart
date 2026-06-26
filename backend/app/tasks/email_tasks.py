import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.tasks.celery_app import celery_app
from app.config import settings
from app.templates.email_base import (
    verification_email_html,
    reset_password_email_html,
    welcome_email_html,
    order_confirmation_email_html,
    price_drop_email_html,
)
import logging

logger = logging.getLogger(__name__)


def _build_html_body(title: str, content: str, otp: str = None) -> str:
    otp_block = ""
    if otp:
        otp_block = f"""
        <div style="margin: 32px 0; text-align: center;">
            <div style="font-size: 14px; color: #B8B8C0; margin-bottom: 12px;">Your verification code:</div>
            <div style="display: inline-block; background: rgba(108, 99, 255, 0.1); border: 1px solid rgba(108, 99, 255, 0.3); border-radius: 12px; padding: 16px 32px; letter-spacing: 12px; font-size: 36px; font-weight: 700; color: #00E5FF; font-family: 'Courier New', monospace;">
                {otp}
            </div>
            <div style="font-size: 12px; color: #666; margin-top: 16px;">This code expires in 5 minutes.</div>
        </div>"""

    return f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0A0A0F;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #0A0A0F; padding: 40px 16px;">
            <tr><td align="center">
                <table width="480" cellpadding="0" cellspacing="0" style="max-width: 480px; width: 100%;">
                    <tr><td style="padding-bottom: 32px; text-align: center;">
                        <table cellpadding="0" cellspacing="0" style="display: inline-block;">
                            <tr>
                                <td style="width: 44px; height: 44px; background: linear-gradient(135deg, #6C63FF, #00E5FF); border-radius: 12px; text-align: center; font-size: 22px; font-weight: 800; color: #000; line-height: 44px;">C</td>
                                <td style="padding-left: 10px; font-size: 22px; font-weight: 700; color: #fff;">CogniCart</td>
                            </tr>
                        </table>
                    </td></tr>
                    <tr><td style="background: #15151D; border: 1px solid #2A2A35; border-radius: 16px; padding: 40px 32px;">
                        <h1 style="font-size: 22px; font-weight: 700; color: #fff; margin: 0 0 8px 0;">{title}</h1>
                        <p style="font-size: 14px; color: #B8B8C0; line-height: 1.6; margin: 0 0 24px 0;">{content}</p>
                        {otp_block}
                        <hr style="border: none; border-top: 1px solid #2A2A35; margin: 32px 0;">
                        <p style="font-size: 12px; color: #666; line-height: 1.5; margin: 0;">
                            If you did not request this code, please ignore this email or contact support at
                            <a href="mailto:support@cognicart.ai" style="color: #6C63FF; text-decoration: none;">support@cognicart.ai</a>
                        </p>
                    </td></tr>
                    <tr><td style="padding-top: 24px; text-align: center; font-size: 11px; color: #555;">
                        &copy; 2025 CogniCart. All rights reserved.
                    </td></tr>
                </table>
            </td></tr>
        </table>
    </body>
    </html>"""


@celery_app.task
def send_email(recipient: str, subject: str, body: str, html: bool = False):
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print(f"[EMAIL SIMULATED] To: {recipient}, Subject: {subject}")
        print(f"[EMAIL SIMULATED] Body: {body[:200]}...")
        return {"status": "simulated", "recipient": recipient}

    msg = MIMEMultipart()
    msg["From"] = settings.SMTP_USER
    msg["To"] = recipient
    msg["Subject"] = subject

    if html:
        msg.attach(MIMEText(body, "html"))
    else:
        msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
        return {"status": "sent", "recipient": recipient}
    except Exception as e:
        print(f"Failed to send email: {e}")
        return {"status": "failed", "error": str(e)}


@celery_app.task
def send_otp_email(recipient: str, otp: str, purpose: str = "verification", user_name: str = "there"):
    try:
        if purpose == "password_reset":
            subject = "Reset Your CogniCart Password"
            body = reset_password_email_html(otp, user_name)
        else:
            subject = "Verify Your CogniCart Account" if purpose == "verification" else "Your CogniCart Login Code"
            body = verification_email_html(otp, user_name)
        return send_email(recipient, subject, body, html=True)
    except Exception as e:
        logger.warning(f"Template rendering failed, falling back: {e}")
        title = "Verify Your Email Address"
        content = "Welcome to CogniCart! Use the verification code below to complete your setup."
        if purpose == "login":
            subject = "Your CogniCart Login Code"
            title = "Login Verification Code"
            content = "A verification code has been sent to your email for secure login."
        elif purpose == "password_reset":
            subject = "Reset Your CogniCart Password"
            title = "Password Reset Code"
            content = "You requested to reset your password. Use the code below to proceed."
        return send_email(recipient, subject, _build_html_body(title, content, otp), html=True)


@celery_app.task
def send_welcome_email(recipient: str, name: str):
    subject = "Welcome to CogniCart!"
    try:
        body = welcome_email_html(name)
    except Exception as e:
        logger.warning(f"Template rendering failed, falling back: {e}")
        body = _build_html_body(
            f"Welcome, {name}!",
            "Your AI-powered shopping journey begins now. Get personalized recommendations, track orders, and discover products tailored just for you."
        )
    return send_email(recipient, subject, body, html=True)


@celery_app.task
def send_account_verified_email(recipient: str, name: str):
    subject = "Your CogniCart Account is Verified"
    try:
        body = welcome_email_html(name)
    except Exception as e:
        logger.warning(f"Template rendering failed, falling back: {e}")
        body = _build_html_body(
            "Account Verified Successfully!",
            f"Hi {name}, your email has been verified. You can now enjoy personalized shopping, track orders, and get AI-powered recommendations."
        )
    return send_email(recipient, subject, body, html=True)


def send_email_direct(recipient: str, subject: str, body: str, html: bool = True):
    """Synchronous fallback that sends email directly without Celery."""
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.info(f"[EMAIL SIMULATED] To: {recipient}, Subject: {subject}")
        logger.info(f"[EMAIL SIMULATED] Body: {body[:500]}...")
        return {"status": "simulated", "recipient": recipient}

    msg = MIMEMultipart()
    msg["From"] = settings.SMTP_USER
    msg["To"] = recipient
    msg["Subject"] = subject

    if html:
        msg.attach(MIMEText(body, "html"))
    else:
        msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
        logger.info(f"[EMAIL SENT] To: {recipient}, Subject: {subject}")
        return {"status": "sent", "recipient": recipient}
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        return {"status": "failed", "error": str(e)}


@celery_app.task
def send_order_confirmation_email(recipient: str, order_number: str, user_name: str, items: list | None = None, total: str = ""):
    subject = f"Order #{order_number} Confirmed"
    try:
        body = order_confirmation_email_html(order_number, user_name, items, total)
    except Exception as e:
        logger.warning(f"Order confirmation template failed, falling back: {e}")
        body = _build_html_body(f"Order #{order_number} Confirmed", "Your order has been placed successfully.")
    return send_email(recipient, subject, body, html=True)


@celery_app.task
def send_price_drop_email(recipient: str, product_name: str, current_price: str, previous_price: str, user_name: str, product_url: str = "#"):
    subject = f"Price Drop: {product_name}"
    try:
        body = price_drop_email_html(product_name, current_price, previous_price, user_name, product_url)
    except Exception as e:
        logger.warning(f"Price drop template failed, falling back: {e}")
        body = _build_html_body("Price Drop Alert!", f"The price of {product_name} has dropped from {previous_price} to {current_price}.")
    return send_email(recipient, subject, body, html=True)


def send_otp_email_direct(recipient: str, otp: str, purpose: str = "verification", user_name: str = "there"):
    try:
        if purpose == "password_reset":
            subject = "Reset Your CogniCart Password"
            body = reset_password_email_html(otp, user_name)
        else:
            subject = "Verify Your CogniCart Account" if purpose == "verification" else "Your CogniCart Login Code"
            body = verification_email_html(otp, user_name)
        return send_email_direct(recipient, subject, body, html=True)
    except Exception as e:
        logger.warning(f"Template rendering failed, falling back: {e}")
        title = "Verify Your Email Address"
        content = "Welcome to CogniCart! Use the verification code below to complete your setup."
        if purpose == "login":
            subject = "Your CogniCart Login Code"
            title = "Login Verification Code"
            content = "A verification code has been sent to your email for secure login."
        elif purpose == "password_reset":
            subject = "Reset Your CogniCart Password"
            title = "Password Reset Code"
            content = "You requested to reset your password. Use the code below to proceed."
        return send_email_direct(recipient, subject, _build_html_body(title, content, otp), html=True)
