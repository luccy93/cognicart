"""HTML email templates for CogniCart — dark glassmorphism theme with inline CSS."""


def _base_wrapper(title: str, body_html: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>{title}</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0f;padding:24px 16px;">
<tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">

<tr><td style="padding-bottom:32px;text-align:center;">
<table cellpadding="0" cellspacing="0" style="display:inline-block;">
<tr>
<td style="width:44px;height:44px;background:linear-gradient(135deg,#6C63FF,#00E5FF);border-radius:12px;text-align:center;font-size:22px;font-weight:800;color:#000;line-height:44px;">C</td>
<td style="padding-left:10px;font-size:22px;font-weight:700;color:#ffffff;">CogniCart</td>
</tr>
</table>
</td></tr>

<tr><td style="background:linear-gradient(135deg,#15151D,#1A1A24);border:1px solid #2A2A35;border-radius:20px;padding:40px 32px;">
{body_html}
</td></tr>

<tr><td style="padding-top:24px;text-align:center;font-size:11px;color:#555555;line-height:1.6;">
&copy; 2025 CogniCart. All rights reserved.<br>
<a href="mailto:support@cognicart.ai" style="color:#6C63FF;text-decoration:none;">support@cognicart.ai</a>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>"""


def _otp_block(otp: str) -> str:
    return f"""
<div style="margin:28px 0;text-align:center;">
<div style="font-size:13px;color:#B8B8C0;margin-bottom:10px;">Your verification code:</div>
<div style="display:inline-block;background:rgba(108,99,255,0.1);border:1px solid rgba(108,99,255,0.3);border-radius:14px;padding:14px 28px;letter-spacing:10px;font-size:34px;font-weight:700;color:#00E5FF;font-family:'Courier New',Courier,monospace;">
{otp}
</div>
<div style="font-size:12px;color:#666666;margin-top:14px;">This code expires in <strong style="color:#6C63FF;">5 minutes</strong>.</div>
</div>"""


def _button(href: str, text: str) -> str:
    return f"""
<table cellpadding="0" cellspacing="0" style="margin:28px auto;">
<tr>
<td style="background:linear-gradient(135deg,#6C63FF,#00E5FF);border-radius:12px;text-align:center;">
<a href="{href}" style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:600;color:#000000;text-decoration:none;border-radius:12px;">{text}</a>
</td>
</tr>
</table>"""


def verification_email_html(otp: str, user_name: str) -> str:
    body = f"""
<h1 style="font-size:22px;font-weight:700;color:#ffffff;margin:0 0 6px 0;">Welcome to CogniCart</h1>
<p style="font-size:14px;color:#B8B8C0;line-height:1.7;margin:0 0 4px 0;">Hi <strong style="color:#ffffff;">{user_name}</strong>,</p>
<p style="font-size:14px;color:#B8B8C0;line-height:1.7;margin:0 0 4px 0;">Thanks for signing up! Use the code below to verify your email address and unlock your AI-powered shopping experience.</p>
{_otp_block(otp)}
<hr style="border:none;border-top:1px solid #2A2A35;margin:28px 0;">
<p style="font-size:12px;color:#666666;line-height:1.5;margin:0;">If you did not create an account, please ignore this email or contact <a href="mailto:support@cognicart.ai" style="color:#6C63FF;text-decoration:none;">support@cognicart.ai</a>.</p>
"""
    return _base_wrapper("Verify Your CogniCart Account", body)


def reset_password_email_html(otp: str, user_name: str) -> str:
    body = f"""
<h1 style="font-size:22px;font-weight:700;color:#ffffff;margin:0 0 6px 0;">Reset Your Password</h1>
<p style="font-size:14px;color:#B8B8C0;line-height:1.7;margin:0 0 4px 0;">Hi <strong style="color:#ffffff;">{user_name}</strong>,</p>
<p style="font-size:14px;color:#B8B8C0;line-height:1.7;margin:0 0 4px 0;">We received a request to reset your CogniCart password. Enter the code below to proceed.</p>
{_otp_block(otp)}
<hr style="border:none;border-top:1px solid #2A2A35;margin:28px 0;">
<p style="font-size:12px;color:#666666;line-height:1.5;margin:0;">If you did not request a password reset, please ignore this email or contact <a href="mailto:support@cognicart.ai" style="color:#6C63FF;text-decoration:none;">support@cognicart.ai</a>.</p>
"""
    return _base_wrapper("Reset Your Password", body)


def welcome_email_html(user_name: str) -> str:
    body = f"""
<h1 style="font-size:22px;font-weight:700;color:#ffffff;margin:0 0 6px 0;">Email Verified!</h1>
<p style="font-size:14px;color:#B8B8C0;line-height:1.7;margin:0 0 4px 0;">Hi <strong style="color:#ffffff;">{user_name}</strong>,</p>
<p style="font-size:14px;color:#B8B8C0;line-height:1.7;margin:0;">Your account has been verified successfully. You are now ready to experience the future of shopping — personalized recommendations, smart price tracking, and one-click checkout powered by AI.</p>
{_button("https://cognicart.ai/dashboard", "Go to Dashboard")}
<hr style="border:none;border-top:1px solid #2A2A35;margin:28px 0;">
<p style="font-size:12px;color:#666666;line-height:1.5;margin:0;">
<strong style="color:#00E5FF;">Pro tip:</strong> Let our AI learn your style — the more you browse, the smarter your recommendations get.
</p>
"""
    return _base_wrapper("Welcome to CogniCart", body)


def order_confirmation_email_html(order_number: str, user_name: str, items: list[dict[str, str]] | None = None, total: str = "") -> str:
    items_html = ""
    if items:
        rows = "".join(
            f"""
            <tr>
            <td style="padding:8px 0;font-size:13px;color:#B8B8C0;border-bottom:1px solid #2A2A35;">{item.get("name", "")}</td>
            <td style="padding:8px 0;font-size:13px;color:#B8B8C0;border-bottom:1px solid #2A2A35;text-align:right;">{item.get("price", "")}</td>
            </tr>""" for item in items
        )
        items_html = f"""
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
        <tr><td style="padding-bottom:8px;font-size:13px;font-weight:600;color:#6C63FF;border-bottom:1px solid #2A2A35;">Item</td>
            <td style="padding-bottom:8px;font-size:13px;font-weight:600;color:#6C63FF;border-bottom:1px solid #2A2A35;text-align:right;">Price</td></tr>
        {rows}
        </table>"""
        if total:
            items_html += f'<p style="font-size:15px;font-weight:700;color:#ffffff;text-align:right;margin:12px 0 0 0;">Total: {total}</p>'

    body = f"""
<h1 style="font-size:22px;font-weight:700;color:#ffffff;margin:0 0 6px 0;">Order Confirmed!</h1>
<p style="font-size:14px;color:#B8B8C0;line-height:1.7;margin:0 0 4px 0;">Hi <strong style="color:#ffffff;">{user_name}</strong>,</p>
<p style="font-size:14px;color:#B8B8C0;line-height:1.7;margin:0 0 4px 0;">Your order <strong style="color:#00E5FF;">#{order_number}</strong> has been confirmed and is being processed.</p>
{items_html}
{_button(f"https://cognicart.ai/orders/{order_number}", "Track Order")}
<hr style="border:none;border-top:1px solid #2A2A35;margin:28px 0;">
<p style="font-size:12px;color:#666666;line-height:1.5;margin:0;">Need help? Reply to this email or visit our <a href="https://cognicart.ai/support" style="color:#6C63FF;text-decoration:none;">Support Center</a>.</p>
"""
    return _base_wrapper(f"Order #{order_number} Confirmed", body)


def price_drop_email_html(product_name: str, current_price: str, previous_price: str, user_name: str, product_url: str = "#") -> str:
    body = f"""
<h1 style="font-size:22px;font-weight:700;color:#ffffff;margin:0 0 6px 0;">Price Drop Alert!</h1>
<p style="font-size:14px;color:#B8B8C0;line-height:1.7;margin:0 0 4px 0;">Hi <strong style="color:#ffffff;">{user_name}</strong>,</p>
<p style="font-size:14px;color:#B8B8C0;line-height:1.7;margin:0 0 20px 0;">The price of <strong style="color:#ffffff;">{product_name}</strong> has dropped! Here is the deal:</p>

<table cellpadding="0" cellspacing="0" style="background:rgba(0,229,255,0.05);border:1px solid rgba(0,229,255,0.2);border-radius:14px;padding:20px;width:100%;">
<tr>
<td style="text-align:center;padding:8px;">
<div style="font-size:12px;color:#666666;margin-bottom:4px;">Was</div>
<div style="font-size:18px;color:#666666;text-decoration:line-through;">{previous_price}</div>
</td>
<td style="text-align:center;padding:8px;">
<div style="font-size:12px;color:#00E5FF;margin-bottom:4px;">Now</div>
<div style="font-size:28px;font-weight:700;color:#00E5FF;">{current_price}</div>
</td>
</tr>
</table>

{_button(product_url, "View Deal")}

<hr style="border:none;border-top:1px solid #2A2A35;margin:28px 0;">
<p style="font-size:12px;color:#666666;line-height:1.5;margin:0;">You are receiving this alert because you are tracking this product. Manage your alerts in your <a href="https://cognicart.ai/price-tracking" style="color:#6C63FF;text-decoration:none;">Price Tracker</a>.</p>
"""
    return _base_wrapper(f"Price Drop: {product_name}", body)
