

from dotenv import load_dotenv
import os
import sys


sys.path.insert(0, os.path.dirname(__file__))


load_dotenv()


from app.services.email_service import send_email_notification, send_price_alert_email

def test_basic_email():
    """Test basic email sending"""
    print("="*70)
    print(" TEST 1: Basic Email")
    print("="*70)
    
    test_email = os.getenv('SMTP_USERNAME')
    
    if not test_email:
        print(" SMTP_USERNAME not set in .env file!")
        print("\n Please add to your .env file:")
        print("   SMTP_USERNAME=your-email@gmail.com")
        print("   SMTP_PASSWORD=your-app-password")
        return False
    
    print(f" Sending test email to: {test_email}")
    
    success = send_email_notification(
        to_email=test_email,
        subject=" RubberSmart Email Test - SUCCESS!",
        message="""
<strong style="font-size: 20px; color: #10b981;">Congratulations!</strong><br><br>

Your RubberSmart email system is <strong>working perfectly!</strong><br><br>

<div style="background: #f0fdf4; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981; margin: 20px 0;">
    ✅ SMTP connection successful<br>
    ✅ Authentication successful<br>
    ✅ Email sent successfully<br>
</div>

<p style="color: #6b7280; margin-top: 20px;">
You're now ready to send price alerts to farmers! 🌱
</p>
        """
    )
    
    return success


def test_price_alert_email():
    """Test price alert email format"""
    print("\n" + "="*70)
    print(" TEST 2: Price Alert Email (Formatted)")
    print("="*70)
    
    test_email = os.getenv('SMTP_USERNAME')
    
    if not test_email:
        print(" Email not configured")
        return False
    

    alert_data = {
        'rubber_type': 'RSS 1',
        'current_price': 455.50,
        'target_price': 450.00,
        'alert_type': 'above'
    }
    
    print(f" Sending formatted price alert to: {test_email}")
    
    success = send_price_alert_email(test_email, alert_data)
    
    return success


if __name__ == "__main__":
    print("\n" + "="*70)
    print(" RUBBERSMART EMAIL SYSTEM TEST")
    print("="*70)
    

    if not os.path.exists('.env'):
        print("\n .env file not found!")
        print("\n Please create .env file with:")
        print("   SMTP_HOST=smtp.gmail.com")
        print("   SMTP_PORT=587")
        print("   SMTP_USERNAME=your-email@gmail.com")
        print("   SMTP_PASSWORD=your-16-char-app-password")
        print("   SMTP_FROM_EMAIL=your-email@gmail.com")
        print("   SMTP_FROM_NAME=RubberSmart")
        sys.exit(1)
    

    result1 = test_basic_email()
    
    if result1:

        result2 = test_price_alert_email()
    else:
        print("\n  Skipping Test 2 (Test 1 failed)")
        result2 = False
    

    print("\n" + "="*70)
    print(" TEST SUMMARY")
    print("="*70)
    print(f"   Basic Email:       {' PASSED' if result1 else ' FAILED'}")
    print(f"   Price Alert Email: {' PASSED' if result2 else ' FAILED'}")
    print("="*70)
    
    if result1 and result2:
        print("\n All tests passed! Check your email inbox.")
        print(" You should have received 2 test emails.")
        print("\n Email system is ready for price alerts!")
    else:
        print("\n Some tests failed. Please check:")
        print("   1. .env file has correct Gmail credentials")
        print("   2. Using Gmail App Password (not regular password)")
        print("   3. 2-Step Verification enabled in Google Account")
        print("\n Setup guide: https://myaccount.google.com/apppasswords")
    
    print("="*70)