

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv
import logging

load_dotenv()

logger = logging.getLogger(__name__)


def send_email_notification(to_email: str, subject: str, message: str):
    """
    Send email notification using Gmail SMTP

    Returns:
        bool: True if sent successfully, False otherwise
    """

    try:

        smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
        smtp_port = int(os.getenv('SMTP_PORT', 587))
        smtp_user = os.getenv('SMTP_USERNAME')
        smtp_pass = os.getenv('SMTP_PASSWORD')
        from_email = os.getenv('SMTP_FROM_EMAIL')
        from_name = os.getenv('SMTP_FROM_NAME', 'RubberSmart')


        if not all([smtp_user, smtp_pass, from_email]):
            logger.error(" Missing SMTP credentials in .env")
            return False

        logger.info(f" Sending email to {to_email}")


        msg = MIMEMultipart('alternative')
        msg['From'] = f"{from_name} <{from_email}>"
        msg['To'] = to_email
        msg['Subject'] = subject


        plain_text = message.replace("<br>", "\n")

        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
        </head>
        <body style="margin:0;padding:0;font-family:Arial;background:#f3f4f6;">
            <table width="100%" style="padding:40px 20px;background:#f3f4f6;">
                <tr>
                    <td align="center">
                        <table width="600" style="background:#ffffff;border-radius:8px;overflow:hidden;">
                            
                            <tr>
                                <td style="background:linear-gradient(135deg,#667eea,#764ba2);padding:30px;text-align:center;">
                                    <h1 style="color:white;margin:0;">🌱 RubberSmart</h1>
                                    <p style="color:white;margin-top:10px;">Price Alert System</p>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:30px;">
                                    <div style="background:#f9fafb;padding:20px;border-left:4px solid #667eea;">
                                        {message.replace(chr(10), '<br>')}
                                    </div>

                                    <p style="color:#6b7280;font-size:14px;margin-top:20px;">
                                        This is an automated notification from RubberSmart.
                                    </p>
                                </td>
                            </tr>

                            <tr>
                                <td style="background:#f9fafb;padding:20px;text-align:center;font-size:12px;color:#9ca3af;">
                                    © 2026 RubberSmart — AI Rubber Intelligence
                                </td>
                            </tr>

                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """

        msg.attach(MIMEText(plain_text, 'plain'))
        msg.attach(MIMEText(html_body, 'html'))


        with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)

        logger.info(f" Email sent successfully to {to_email}")
        return True

    except smtplib.SMTPAuthenticationError as e:
        logger.error(f" SMTP Authentication failed: {str(e)}")
        return False

    except Exception as e:
        logger.error(f" Email sending failed: {str(e)}")
        return False




def send_price_alert_email(user_email: str, alert_data: dict):
    """
    Send formatted market price alert email (No rubber type)
    """

    subject = f" Rubber Market Price Alert!"

    message = f"""
<strong style="font-size:18px;color:#667eea;">Rubber Market Price Alert</strong><br><br>

<table style="width:100%;border-collapse:collapse;">
<tr>
<td style="padding:8px;border-bottom:1px solid #eee;"><strong>Current Market Price:</strong></td>
<td style="padding:8px;border-bottom:1px solid #eee;color:#10b981;font-weight:bold;">
Rs. {alert_data['current_price']:.2f} per Liter
</td>
</tr>

<tr>
<td style="padding:8px;border-bottom:1px solid #eee;"><strong>Your Target Price:</strong></td>
<td style="padding:8px;border-bottom:1px solid #eee;">
Rs. {alert_data['target_price']:.2f} per Liter
</td>
</tr>

<tr>
<td style="padding:8px;"><strong>Condition:</strong></td>
<td style="padding:8px;">
Price went <strong>{alert_data['alert_type']}</strong> your target
</td>
</tr>
</table>

<br>

<div style="padding:15px;background:#fef3c7;border-left:4px solid #f59e0b;">
<strong> Recommendation:</strong><br>
The market price has {'exceeded' if alert_data['alert_type']=='above' else 'fallen below'} your target.
This might be a good time to {'sell your rubber' if alert_data['alert_type']=='above' else 'monitor the market closely'}.
</div>
"""

    return send_email_notification(user_email, subject, message)

