import os
import urllib.request
import urllib.error
import json

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
FROM_EMAIL = "onboarding@resend.dev"
FROM_NAME = "BuroZero"


def send_otp_email(to_email: str, otp_code: str) -> bool:
    if not RESEND_API_KEY:
        print(f"OTP para {to_email}: {otp_code}")
        return True

    try:
        html = f"""
        <html><body style="font-family:sans-serif;background:#0d1117;color:#e6edf3;padding:40px;">
          <div style="max-width:400px;margin:0 auto;background:#161b22;border-radius:16px;padding:32px;border:1px solid #2a3548;">
            <h2 style="color:#e6edf3;margin:0 0 8px;">Buro<span style="color:#2563eb">Zero</span></h2>
            <p style="color:#7d8590;margin:0 0 32px;font-size:14px;">Anti-Burocracia Portugal</p>
            <p style="font-size:14px;color:#7d8590;margin-bottom:8px;">O teu codigo de acesso:</p>
            <div style="background:#0d1117;border:1px solid #2a3548;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
              <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#e6edf3;">{otp_code}</span>
            </div>
            <p style="font-size:13px;color:#7d8590;">Valido por <strong style="color:#e6edf3;">10 minutos</strong>.</p>
          </div>
        </body></html>
        """

        payload = json.dumps({
            "from": f"{FROM_NAME} <{FROM_EMAIL}>",
            "to": [to_email],
            "subject": f"{otp_code} - O teu codigo BuroZero",
            "html": html,
        }).encode("utf-8")

        req = urllib.request.Request(
            "https://api.resend.com/emails",
            data=payload,
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            method="POST",
        )

        with urllib.request.urlopen(req) as resp:
            return resp.status == 200

    except Exception as e:
        print(f"Erro ao enviar email: {e}")
        return False
