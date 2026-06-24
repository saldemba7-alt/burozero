import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")          # o teu email Gmail
SMTP_PASS = os.getenv("SMTP_PASS", "")          # App Password do Gmail
FROM_NAME = "BuroZero"


def send_otp_email(to_email: str, otp_code: str) -> bool:
    """
    Envia o código OTP por email.
    Usa Gmail SMTP com App Password (grátis).
    """
    if not SMTP_USER or not SMTP_PASS:
        # Em dev: só imprime o código na consola
        print(f"\n{'='*40}")
        print(f"  OTP para {to_email}: {otp_code}")
        print(f"{'='*40}\n")
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"{otp_code} — O teu código BuroZero"
        msg["From"]    = f"{FROM_NAME} <{SMTP_USER}>"
        msg["To"]      = to_email

        html = f"""
        <html><body style="font-family:sans-serif;background:#0d1117;color:#e6edf3;padding:40px;">
          <div style="max-width:400px;margin:0 auto;background:#161b22;border-radius:16px;padding:32px;border:1px solid #2a3548;">
            <h2 style="color:#e6edf3;margin:0 0 8px;">Buro<span style="color:#2563eb">Zero</span></h2>
            <p style="color:#7d8590;margin:0 0 32px;font-size:14px;">Anti-Burocracia Portugal</p>

            <p style="font-size:14px;color:#7d8590;margin-bottom:8px;">O teu código de acesso:</p>
            <div style="background:#0d1117;border:1px solid #2a3548;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
              <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#e6edf3;">{otp_code}</span>
            </div>

            <p style="font-size:13px;color:#7d8590;">
              Válido por <strong style="color:#e6edf3;">10 minutos</strong>.<br>
              Se não pediste este código, ignora este email.
            </p>
          </div>
        </body></html>
        """

        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_USER, to_email, msg.as_string())

        return True

    except Exception as e:
        print(f"Erro ao enviar email: {e}")
        return False
